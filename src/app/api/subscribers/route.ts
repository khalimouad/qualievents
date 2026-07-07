import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateBadgeCode, generateQRDataURL } from "@/lib/qrcode";
import { requireAdmin, passThrough } from "@/lib/requireRole";
import { sendEmail, buildBadgeEmail } from "@/lib/email";
import { buildBadgeAttachments } from "@/lib/badgeAttachments";
import { decrypt } from "@/lib/crypto";
import { rateLimit } from "@/lib/rateLimit";

export async function GET(req: NextRequest) {
  const eventId = req.nextUrl.searchParams.get("eventId");

  const subscribers = await prisma.subscriber.findMany({
    where: eventId ? { eventId } : undefined,
    include: {
      event: { select: { title: true } },
      badge: { select: { code: true, badgeNumber: true, isScanned: true, type: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(subscribers);
}

export async function DELETE(req: NextRequest) {
  try { requireAdmin(req); } catch (e) { return passThrough(e); }
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  await prisma.subscriber.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

export async function POST(req: NextRequest) {
  const rl = await rateLimit(req, { name: "subscribers.register", limit: 10, windowSec: 3600 });
  if (!rl.allowed) return rl.response!;

  const body = await req.json();

  if (!body.firstName || !body.lastName || !body.email || !body.eventId) {
    return NextResponse.json(
      { error: "First name, last name, email, and event are required" },
      { status: 400 }
    );
  }

  // Check if already registered
  const existing = await prisma.subscriber.findFirst({
    where: { email: body.email, eventId: body.eventId },
  });
  if (existing) {
    return NextResponse.json(
      { error: "You are already registered for this event" },
      { status: 400 }
    );
  }

  // Check capacity
  const event = await prisma.event.findUnique({
    where: { id: body.eventId },
    include: { _count: { select: { subscribers: true } } },
  });
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }
  const isAtCapacity = event._count.subscribers >= event.maxAttendees;
  const status = isAtCapacity ? "waitlisted" : "confirmed";

  // Optional tier — only valid if the tier belongs to this event AND is free
  // (paid tiers go through /api/payments).
  let tierId: string | null = null;
  if (body.tierId) {
    const tier = await prisma.eventTicketTier.findUnique({ where: { id: body.tierId } });
    if (!tier || tier.eventId !== body.eventId) {
      return NextResponse.json({ error: "Tarif invalide" }, { status: 400 });
    }
    if (tier.price > 0) {
      return NextResponse.json({ error: "Ce tarif est payant — utilisez le flux de paiement." }, { status: 400 });
    }
    if (!tier.available) {
      return NextResponse.json({ error: "Ce tarif n'est plus disponible" }, { status: 400 });
    }
    if (tier.capacity != null) {
      const sold = await prisma.subscriber.count({ where: { tierId: tier.id } });
      if (sold >= tier.capacity) {
        return NextResponse.json({ error: "Ce tarif est complet" }, { status: 400 });
      }
    }
    tierId = tier.id;
  }

  // Create subscriber (waitlisted if at capacity)
  const subscriber = await prisma.subscriber.create({
    data: {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone || null,
      company: body.company || null,
      jobTitle: body.jobTitle || null,
      dietaryReqs: body.dietaryReqs || null,
      status,
      isVip: body.isVip === true,
      eventId: body.eventId,
      tierId,
    },
  });

  if (isAtCapacity) {
    return NextResponse.json(
      { ...subscriber, waitlisted: true, message: "Event is at capacity. You've been added to the waitlist." },
      { status: 201 }
    );
  }

  // Generate badge
  const badgeCode = generateBadgeCode();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const qrContent = `${appUrl}/api/scan?code=${badgeCode}`;
  const qrData = await generateQRDataURL(qrContent);
  const badgeNumber = await prisma.badge.count({ where: { eventId: body.eventId } }) + 1;

  await prisma.badge.create({
    data: {
      code: badgeCode,
      badgeNumber,
      qrData,
      subscriberId: subscriber.id,
      eventId: body.eventId,
      type: body.isVip === true ? "VIP" : "STANDARD",
    },
  });

  // Send confirmation email with badge (non-blocking)
  const eventDate = event.date.toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
  let streamPassword: string | null = null;
  if (event.streamPasswordEnc) {
    try {
      streamPassword = decrypt(event.streamPasswordEnc);
    } catch {
      streamPassword = null;
    }
  }

  const eventFormat = (event.format as "IN_PERSON" | "ONLINE" | "HYBRID") || "IN_PERSON";
  const emailHtml = buildBadgeEmail(
    `${subscriber.firstName} ${subscriber.lastName}`,
    event.title,
    badgeCode,
    {
      format: eventFormat,
      streamUrl: event.streamUrl,
      streamPassword,
      platform: event.platform,
      streamInstructions: event.streamInstructions,
    }
  );
  buildBadgeAttachments(eventFormat, {
    code: badgeCode,
    badgeNumber,
    type: body.isVip === true ? "VIP" : "STANDARD",
    qrData,
    subscriber: { firstName: subscriber.firstName, lastName: subscriber.lastName, jobTitle: subscriber.jobTitle, company: subscriber.company },
    event: { title: event.title, date: event.date, city: event.city, themeColor: event.themeColor, logoUrl: event.logoUrl },
  }).then((attachments) =>
    sendEmail({
      to: subscriber.email,
      subject: `Your badge for ${event.title} is ready!`,
      html: emailHtml,
      attachments,
    })
  ).catch(() => {}); // Don't fail registration if email fails

  return NextResponse.json(
    { ...subscriber, badgeCode },
    { status: 201 }
  );
}
