import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const eventId = req.nextUrl.searchParams.get("eventId");
  const sponsors = await prisma.sponsor.findMany({
    where: eventId ? { eventId } : undefined,
    include: { event: { select: { title: true } } },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(sponsors);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.name || !body.eventId) {
    return NextResponse.json({ error: "Name and event ID required" }, { status: 400 });
  }
  const sponsor = await prisma.sponsor.create({
    data: {
      name: body.name,
      logo: body.logo || null,
      website: body.website || null,
      tier: body.tier || "gold",
      eventId: body.eventId,
      sortOrder: body.sortOrder ?? 0,
    },
  });
  return NextResponse.json(sponsor, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  await prisma.sponsor.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
