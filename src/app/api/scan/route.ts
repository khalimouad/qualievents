import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.json({ error: "Badge code required" }, { status: 400 });
  }

  const badge = await prisma.badge.findUnique({
    where: { code: code.toUpperCase() },
    include: {
      subscriber: true,
      event: { select: { title: true, date: true } },
    },
  });

  if (!badge) {
    return NextResponse.json({ error: "Invalid badge code" }, { status: 404 });
  }

  return NextResponse.json({
    valid: true,
    alreadyScanned: badge.isScanned,
    scannedAt: badge.scannedAt,
    subscriber: {
      name: `${badge.subscriber.firstName} ${badge.subscriber.lastName}`,
      email: badge.subscriber.email,
      company: badge.subscriber.company,
      jobTitle: badge.subscriber.jobTitle,
    },
    event: badge.event,
  });
}

export async function POST(req: NextRequest) {
  const { code } = await req.json();
  if (!code) {
    return NextResponse.json({ error: "Badge code required" }, { status: 400 });
  }

  const badge = await prisma.badge.findUnique({
    where: { code: code.toUpperCase() },
    include: {
      subscriber: true,
      event: { select: { title: true } },
    },
  });

  if (!badge) {
    return NextResponse.json({ error: "Invalid badge code", valid: false }, { status: 404 });
  }

  if (badge.isScanned) {
    return NextResponse.json({
      valid: true,
      alreadyScanned: true,
      scannedAt: badge.scannedAt,
      subscriber: {
        name: `${badge.subscriber.firstName} ${badge.subscriber.lastName}`,
        email: badge.subscriber.email,
        company: badge.subscriber.company,
      },
      message: "This badge has already been scanned",
    });
  }

  await prisma.badge.update({
    where: { id: badge.id },
    data: { isScanned: true, scannedAt: new Date() },
  });

  return NextResponse.json({
    valid: true,
    alreadyScanned: false,
    subscriber: {
      name: `${badge.subscriber.firstName} ${badge.subscriber.lastName}`,
      email: badge.subscriber.email,
      company: badge.subscriber.company,
    },
    message: "Badge scanned successfully",
  });
}
