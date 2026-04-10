import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const eventId = req.nextUrl.searchParams.get("eventId");
  if (!eventId) {
    return NextResponse.json({ error: "eventId required" }, { status: 400 });
  }

  const [total, scanned] = await Promise.all([
    prisma.badge.count({ where: { eventId } }),
    prisma.badge.count({ where: { eventId, isScanned: true } }),
  ]);

  return NextResponse.json({ total, scanned });
}
