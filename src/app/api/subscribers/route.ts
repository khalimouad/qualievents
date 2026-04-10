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
  if (event._count.subscribers >= event.maxAttendees) {
    return NextResponse.json({ error: "Event is at full capacity" }, { status: 400 });
  }

  // Create subscriber
  const subscriber = await prisma.subscriber.create({
    data: {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone || null,
      company: body.company || null,
      jobTitle: body.jobTitle || null,
      dietaryReqs: body.dietaryReqs || null,
      status: "confirmed",
      eventId: body.eventId,
    },
  });

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
