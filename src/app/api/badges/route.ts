import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const email = req.nextUrl.searchParams.get("email");

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
    const subscriber = await prisma.subscriber.findFirst({
      where: { email },
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
