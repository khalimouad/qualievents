import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const all = req.nextUrl.searchParams.get("all") === "true";

  const events = await prisma.event.findMany({
    where: all ? undefined : { isPublished: true },
    select: {
      id: true,
      slug: true,
      title: true,
      tagline: true,
      description: true,
      date: true,
      endDate: true,
      venue: true,
      city: true,
      country: true,
      themeColor: true,
      heroImage: true,
      isPublished: true,
      maxAttendees: true,
      _count: { select: { subscribers: true, panelists: true } },
    },
    orderBy: { date: "asc" },
  });
  return NextResponse.json(events);
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const slug = body.slug || slugify(body.title);

  const existing = await prisma.event.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "An event with this slug already exists" }, { status: 400 });
  }

  const event = await prisma.event.create({
    data: {
      slug,
      title: body.title,
      tagline: body.tagline || null,
      description: body.description,
      date: new Date(body.date),
      endDate: body.endDate ? new Date(body.endDate) : null,
      venue: body.venue,
      address: body.address,
      city: body.city,
      country: body.country,
      latitude: body.latitude ? parseFloat(body.latitude) : null,
      longitude: body.longitude ? parseFloat(body.longitude) : null,
      themeColor: body.themeColor || null,
      heroImage: body.heroImage || null,
      gallery: Array.isArray(body.gallery) ? body.gallery : [],
      maxAttendees: body.maxAttendees ? parseInt(body.maxAttendees) : 500,
      isPublished: body.isPublished ?? false,
      isPaid: body.isPaid ?? false,
      ticketPrice: body.ticketPrice ? parseInt(body.ticketPrice) : null,
    },
  });
  return NextResponse.json(event, { status: 201 });
}
