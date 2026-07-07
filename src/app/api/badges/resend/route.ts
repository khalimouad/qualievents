import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
import { sendEmail, buildBadgeEmail } from "@/lib/email";
import { buildBadgeAttachments } from "@/lib/badgeAttachments";
import { rateLimit } from "@/lib/rateLimit";

/**
 * POST /api/badges/resend — public "find my badge" endpoint.
 *
 * Looking up a badge by email can't be done synchronously and returned to
 * the browser like the code-based lookup in GET /api/badges: an unauthenticated
 * caller could enumerate which emails are registered for an event just by
 * watching for a 200 vs 404. Instead this emails the badge to the address on
 * file (if any) and always returns the same generic response either way.
 */
export async function POST(req: NextRequest) {
  const rl = await rateLimit(req, { name: "badges.resend", limit: 5, windowSec: 900 });
  if (!rl.allowed) return rl.response!;

  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const eventSlug = typeof body.eventSlug === "string" ? body.eventSlug : undefined;

  const genericResponse = NextResponse.json({
    message: "Si cette adresse est enregistrée, un email contenant le badge vient d'être envoyé.",
  });

  if (!email) return genericResponse;

  const subscriber = await prisma.subscriber.findFirst({
    where: eventSlug ? { email, event: { slug: eventSlug } } : { email },
    include: { badge: true, event: true },
    orderBy: { createdAt: "desc" },
  });

  if (!subscriber?.badge) return genericResponse;

  let streamPassword: string | null = null;
  if (subscriber.event.streamPasswordEnc) {
    try { streamPassword = decrypt(subscriber.event.streamPasswordEnc); } catch { streamPassword = null; }
  }

  const format = (subscriber.event.format as "IN_PERSON" | "ONLINE" | "HYBRID") || "IN_PERSON";
  const html = buildBadgeEmail(
    `${subscriber.firstName} ${subscriber.lastName}`,
    subscriber.event.title,
    subscriber.badge.code,
    {
      format,
      streamUrl: subscriber.event.streamUrl,
      streamPassword,
      platform: subscriber.event.platform,
      streamInstructions: subscriber.event.streamInstructions,
    }
  );

  const attachments = await buildBadgeAttachments(format, {
    code: subscriber.badge.code,
    badgeNumber: subscriber.badge.badgeNumber,
    type: subscriber.badge.type,
    qrData: subscriber.badge.qrData,
    subscriber: { firstName: subscriber.firstName, lastName: subscriber.lastName, jobTitle: subscriber.jobTitle, company: subscriber.company },
    event: { title: subscriber.event.title, date: subscriber.event.date, city: subscriber.event.city, themeColor: subscriber.event.themeColor, logoUrl: subscriber.event.logoUrl },
  });

  await sendEmail({
    to: subscriber.email,
    subject: `Votre badge pour ${subscriber.event.title}`,
    html,
    attachments,
  }).catch(() => {});

  return genericResponse;
}
