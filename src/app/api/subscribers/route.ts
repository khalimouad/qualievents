import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateBadgeCode, generateQRDataURL } from "@/lib/qrcode";
import { sendEmail, buildBadgeEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
  const eventId = req.nextUrl.searchParams.get("eventId");

  const subscribers = await prisma.subscriber.findMany({
    where: eventId ? { eventId } : undefined,
    include: {
      event: { select: { title: true } },
      badge: { select: { code: true, isScanned: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(subscribers);
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  await prisma.subscriber.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

export async function POST(req: NextRequest) {
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
      eventId: body.eventId,
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

  await prisma.badge.create({
    data: {
      code: badgeCode,
      qrData,
      subscriberId: subscriber.id,
      eventId: body.eventId,
    },
  });

  // Send confirmation email with badge (non-blocking)
  const eventDate = event.date.toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
  const emailHtml = buildBadgeEmail(
    `${subscriber.firstName} ${subscriber.lastName}`,
    event.title,
    badgeCode,
    qrData
  );
  sendEmail({
    to: subscriber.email,
    subject: `Your badge for ${event.title} is ready!`,
    html: emailHtml,
  }).catch(() => {}); // Don't fail registration if email fails

  return NextResponse.json(
    { ...subscriber, badgeCode },
    { status: 201 }
  );
}
