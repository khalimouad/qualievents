import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const events = await prisma.event.findMany({
    where: { isPublished: true },
    select: {
      id: true,
      title: true,
      date: true,
      venue: true,
      city: true,
    },
    orderBy: { date: "asc" },
  });
  return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const event = await prisma.event.create({
    data: {
      title: body.title,
      description: body.description,
      date: new Date(body.date),
      endDate: body.endDate ? new Date(body.endDate) : null,
      venue: body.venue,
      address: body.address,
      city: body.city,
      country: body.country,
      latitude: body.latitude ? parseFloat(body.latitude) : null,
      longitude: body.longitude ? parseFloat(body.longitude) : null,
      maxAttendees: body.maxAttendees ? parseInt(body.maxAttendees) : 500,
      isPublished: body.isPublished ?? false,
    },
  });
  return NextResponse.json(event, { status: 201 });
}
