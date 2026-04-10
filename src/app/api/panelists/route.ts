import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const eventId = req.nextUrl.searchParams.get("eventId");
  const panelists = await prisma.panelist.findMany({
    where: eventId ? { eventId } : undefined,
    include: { event: { select: { title: true } } },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(panelists);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.firstName || !body.lastName || !body.email || !body.bio || !body.eventId) {
    return NextResponse.json(
      { error: "First name, last name, email, bio, and event ID are required" },
      { status: 400 }
    );
  }

  const panelist = await prisma.panelist.create({
    data: {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone || null,
      bio: body.bio,
      company: body.company || null,
      jobTitle: body.jobTitle || null,
      photo: body.photo || null,
      topic: body.topic || null,
      linkedin: body.linkedin || null,
      twitter: body.twitter || null,
      eventId: body.eventId,
      sortOrder: body.sortOrder ?? 0,
    },
  });

  return NextResponse.json(panelist, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Panelist ID required" }, { status: 400 });
  }

  await prisma.panelist.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
