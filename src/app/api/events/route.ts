import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/crypto";

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
      eventType: true,
      format: true,
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

const VALID_FORMATS = new Set(["IN_PERSON", "ONLINE", "HYBRID"]);
const VALID_TYPES = new Set([
  "TRAINING_SEMINAR",
  "CONFERENCE",
  "WEBINAR",
  "FORUM",
  "WORKSHOP",
  "NETWORKING",
  "OTHER",
]);

export async function POST(req: NextRequest) {
  const body = await req.json();

  const slug = body.slug || slugify(body.title);

  const existing = await prisma.event.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "An event with this slug already exists" }, { status: 400 });
  }

  const eventType = VALID_TYPES.has(body.eventType) ? body.eventType : "CONFERENCE";
  const format = VALID_FORMATS.has(body.format) ? body.format : "IN_PERSON";

  // For ONLINE events the venue/address are optional; supply placeholders so
  // the existing required-NOT-NULL columns stay happy.
  const venue = (body.venue || "").trim() || (format === "ONLINE" ? "En ligne" : "");
  const address = (body.address || "").trim() || (format === "ONLINE" ? "Visioconférence" : "");
  const city = (body.city || "").trim() || (format === "ONLINE" ? "—" : "");
  const country = (body.country || "").trim() || (format === "ONLINE" ? "—" : "");

  if (format !== "ONLINE" && (!venue || !address || !city || !country)) {
    return NextResponse.json({ error: "Lieu, adresse, ville et pays sont requis pour un événement présentiel." }, { status: 400 });
  }

  const event = await prisma.event.create({
    data: {
      slug,
      title: body.title,
      tagline: body.tagline || null,
      description: body.description,
      date: new Date(body.date),
      endDate: body.endDate ? new Date(body.endDate) : null,

      eventType,
      format,
      objectives: body.objectives || null,
      targetAudience: body.targetAudience || null,
      context: body.context || null,
      platform: body.platform || null,
      streamUrl: body.streamUrl || null,
      streamPasswordEnc: body.streamPassword ? encrypt(String(body.streamPassword)) : null,
      streamInstructions: body.streamInstructions || null,
      recordingUrl: body.recordingUrl || null,

      venue,
      address,
      city,
      country,
      latitude: body.latitude ? parseFloat(body.latitude) : null,
      longitude: body.longitude ? parseFloat(body.longitude) : null,
      themeColor: body.themeColor || null,
      heroImage: body.heroImage || null,
      brochureUrl: body.brochureUrl || null,
      seriesId: body.seriesId || null,
      gallery: Array.isArray(body.gallery) ? body.gallery : [],
      maxAttendees: body.maxAttendees ? parseInt(body.maxAttendees) : 500,
      isPublished: body.isPublished ?? false,
      isPaid: body.isPaid ?? false,
      ticketPrice: body.ticketPrice ? parseInt(body.ticketPrice) : null,
    },
  });
  return NextResponse.json(event, { status: 201 });
}
