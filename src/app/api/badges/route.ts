import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/requireRole";

/**
 * GET /api/badges?code=XYZ          — public, anyone with the code can fetch
 *                                     (codes are full UUIDs, not enumerable).
 * GET /api/badges?email=foo&eventId  — admin/staff only. Otherwise anyone could
 *                                     enumerate which emails are registered.
 */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const email = req.nextUrl.searchParams.get("email");
  const eventId = req.nextUrl.searchParams.get("eventId");

  if (!code && !email) {
    return NextResponse.json({ error: "Provide a badge code or email" }, { status: 400 });
  }

  let badge;

  if (code) {
    badge = await prisma.badge.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        subscriber: true,
        event: { select: { title: true, date: true } },
      },
    });
  } else if (email) {
    // Email lookup is admin/staff only — exposes registered emails otherwise.
    const session = getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
    }

    const subscriber = await prisma.subscriber.findFirst({
      where: eventId ? { email, eventId } : { email },
      include: { badge: true },
    });
    if (subscriber?.badge) {
      badge = await prisma.badge.findUnique({
        where: { id: subscriber.badge.id },
        include: {
          subscriber: true,
          event: { select: { title: true, date: true } },
        },
      });
    }
  }

  if (!badge) {
    return NextResponse.json({ error: "Badge not found" }, { status: 404 });
  }

  return NextResponse.json({
    code: badge.code,
    qrData: badge.qrData,
    subscriberName: `${badge.subscriber.firstName} ${badge.subscriber.lastName}`,
    subscriberEmail: badge.subscriber.email,
    subscriberCompany: badge.subscriber.company,
    eventTitle: badge.event.title,
    eventDate: badge.event.date,
    isScanned: badge.isScanned,
  });
}
