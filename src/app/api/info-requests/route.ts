import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const eventId = req.nextUrl.searchParams.get("eventId");

  const requests = await prisma.infoRequest.findMany({
    where: eventId ? { eventId } : undefined,
    include: {
      event: { select: { title: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(requests);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.firstName || !body.lastName || !body.email || !body.eventId) {
    return NextResponse.json(
      { error: "First name, last name, email, and event are required" },
      { status: 400 }
    );
  }

  const event = await prisma.event.findUnique({ where: { id: body.eventId } });
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const infoRequest = await prisma.infoRequest.create({
    data: {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone || null,
      company: body.company || null,
      message: body.message || null,
      eventId: body.eventId,
    },
  });

  return NextResponse.json(infoRequest, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  await prisma.infoRequest.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
