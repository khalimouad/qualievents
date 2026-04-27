import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      panelists: { orderBy: { sortOrder: "asc" } },
      sponsors: { orderBy: { sortOrder: "asc" } },
      _count: { select: { subscribers: true } },
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  return NextResponse.json(event);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const body = await req.json();

  const event = await prisma.event.findUnique({ where: { slug } });
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const updated = await prisma.event.update({
    where: { slug },
    data: {
      title: body.title ?? event.title,
      tagline: body.tagline !== undefined ? body.tagline : event.tagline,
      description: body.description ?? event.description,
      date: body.date ? new Date(body.date) : event.date,
      endDate: body.endDate ? new Date(body.endDate) : event.endDate,
      venue: body.venue ?? event.venue,
      address: body.address ?? event.address,
      city: body.city ?? event.city,
      country: body.country ?? event.country,
      latitude: body.latitude !== undefined ? parseFloat(body.latitude) : event.latitude,
      longitude: body.longitude !== undefined ? parseFloat(body.longitude) : event.longitude,
      themeColor: body.themeColor !== undefined ? body.themeColor : event.themeColor,
      heroImage: body.heroImage !== undefined ? body.heroImage : event.heroImage,
      gallery: Array.isArray(body.gallery) ? body.gallery : event.gallery,
      maxAttendees: body.maxAttendees ? parseInt(body.maxAttendees) : event.maxAttendees,
      isPublished: body.isPublished !== undefined ? body.isPublished : event.isPublished,
      isPaid: body.isPaid !== undefined ? body.isPaid : event.isPaid,
      ticketPrice: body.ticketPrice !== undefined ? (body.ticketPrice ? parseInt(body.ticketPrice) : null) : event.ticketPrice,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const event = await prisma.event.findUnique({ where: { slug } });
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  await prisma.event.delete({ where: { slug } });
  return NextResponse.json({ success: true });
}
