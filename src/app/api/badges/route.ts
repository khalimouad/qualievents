import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/requireRole";
import { rateLimit } from "@/lib/rateLimit";

/**
 * GET /api/badges?code=XYZ          — public, anyone with the code can fetch
 *                                     (codes are full UUIDs, not enumerable).
 * GET /api/badges?email=foo&eventId  — admin/staff only. Otherwise anyone could
 *                                     enumerate which emails are registered.
 */
export async function GET(req: NextRequest) {
  // Public endpoint — guard against brute-force enumeration of codes.
  const rl = await rateLimit(req, { name: "badges.lookup", limit: 30, windowSec: 60 });
  if (!rl.allowed) return rl.response!;

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
        subscriber: { select: { firstName: true, lastName: true, email: true, company: true, jobTitle: true } },
        event: { select: { title: true, date: true, logoUrl: true } },
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
          subscriber: { select: { firstName: true, lastName: true, email: true, company: true, jobTitle: true } },
          event: { select: { title: true, date: true, logoUrl: true } },
        },
      });
    }
  }

  if (!badge) {
    return NextResponse.json({ error: "Badge not found" }, { status: 404 });
  }

  return NextResponse.json({
    code: badge.code,
    badgeNumber: badge.badgeNumber,
    qrData: badge.qrData,
    subscriberName: `${badge.subscriber.firstName} ${badge.subscriber.lastName}`,
    subscriberEmail: badge.subscriber.email,
    subscriberCompany: badge.subscriber.company,
    subscriberJobTitle: badge.subscriber.jobTitle,
    eventTitle: badge.event.title,
    eventDate: badge.event.date,
    eventLogoUrl: badge.event.logoUrl,
    isScanned: badge.isScanned,
  });
}
