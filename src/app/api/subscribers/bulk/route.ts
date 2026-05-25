import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdmin, passThrough } from "@/lib/requireRole";
import { generateBadgeCode, generateQRDataURL } from "@/lib/qrcode";
import { sendEmail, buildBadgeEmail } from "@/lib/email";
import { decrypt } from "@/lib/crypto";
import { audit } from "@/lib/audit";

const VALID_STATUSES = new Set(["confirmed", "pending", "waitlisted", "cancelled"]);
const VALID_ACTIONS = new Set(["delete", "set-status", "resend-badge"]);

interface Body {
  ids: string[];
  action: "delete" | "set-status" | "resend-badge";
  status?: string;
}

export async function POST(req: NextRequest) {
  // Reads/edits are open to staff; deletes require admin (checked below).
  try { requireAuth(req); } catch (e) { return passThrough(e); }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }
  const ids = Array.isArray(body.ids) ? body.ids.filter((x) => typeof x === "string" && x.length) : [];
  if (ids.length === 0) {
    return NextResponse.json({ error: "Aucun abonné sélectionné" }, { status: 400 });
  }
  if (!VALID_ACTIONS.has(body.action)) {
    return NextResponse.json({ error: "Action invalide" }, { status: 400 });
  }

  if (body.action === "delete") {
    try { requireAdmin(req); } catch (e) { return passThrough(e); }
    const result = await prisma.subscriber.deleteMany({ where: { id: { in: ids } } });
    audit(req, { action: "subscriber.bulk-delete", metadata: { count: result.count } });
    return NextResponse.json({ count: result.count });
  }

  if (body.action === "set-status") {
    if (!body.status || !VALID_STATUSES.has(body.status)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }
    const result = await prisma.subscriber.updateMany({
      where: { id: { in: ids } },
      data: { status: body.status },
    });
    audit(req, {
      action: "subscriber.bulk-status",
      metadata: { count: result.count, status: body.status },
    });
    return NextResponse.json({ count: result.count });
  }

  // resend-badge — only confirmed subscribers with an existing badge.
  const subs = await prisma.subscriber.findMany({
    where: { id: { in: ids } },
    include: { event: true, badge: true },
  });

  let sent = 0;
  let created = 0;
  let skipped = 0;

  for (const sub of subs) {
    if (sub.status !== "confirmed") { skipped++; continue; }

    let badgeCode = sub.badge?.code;
    let qrData = sub.badge?.qrData;
    if (!badgeCode || !qrData) {
      badgeCode = generateBadgeCode();
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      qrData = await generateQRDataURL(`${appUrl}/api/scan?code=${badgeCode}`);
      const badgeNumber = await prisma.badge.count({ where: { eventId: sub.eventId } }) + 1;
      await prisma.badge.create({
        data: {
          code: badgeCode,
          badgeNumber,
          qrData,
          subscriberId: sub.id,
          eventId: sub.eventId,
        },
      });
      created++;
    }

    let streamPassword: string | null = null;
    if (sub.event.streamPasswordEnc) {
      try { streamPassword = decrypt(sub.event.streamPasswordEnc); } catch { streamPassword = null; }
    }

    const html = buildBadgeEmail(
      `${sub.firstName} ${sub.lastName}`,
      sub.event.title,
      badgeCode,
      qrData,
      {
        format: (sub.event.format as "IN_PERSON" | "ONLINE" | "HYBRID") || "IN_PERSON",
        streamUrl: sub.event.streamUrl,
        streamPassword,
        platform: sub.event.platform,
        streamInstructions: sub.event.streamInstructions,
      }
    );

    const r = await sendEmail({
      to: sub.email,
      subject: `Votre badge pour ${sub.event.title}`,
      html,
    });
    if (r.success) sent++;
  }

  audit(req, {
    action: "subscriber.bulk-resend-badge",
    metadata: { sent, created, skipped, total: subs.length },
  });
  return NextResponse.json({ sent, created, skipped, total: subs.length });
}
