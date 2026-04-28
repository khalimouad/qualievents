import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, passThrough } from "@/lib/requireRole";
import { encrypt } from "@/lib/crypto";

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
      sessions: { orderBy: [{ day: "asc" }, { sortOrder: "asc" }, { startTime: "asc" }] },
      _count: { select: { subscribers: true } },
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  // Strip the encrypted password from public reads — admin tooling that needs
  // the cleartext should consult /api/events/[slug]/stream-password (not built
  // here yet; the cleartext is also surfaced to confirmed attendees over email).
  const { streamPasswordEnc, ...rest } = event;
  void streamPasswordEnc;
  return NextResponse.json(rest);
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

  const eventType = VALID_TYPES.has(body.eventType) ? body.eventType : event.eventType;
  const format = VALID_FORMATS.has(body.format) ? body.format : event.format;

  const updated = await prisma.event.update({
    where: { slug },
    data: {
      title: body.title ?? event.title,
      tagline: body.tagline !== undefined ? body.tagline : event.tagline,
      description: body.description ?? event.description,
      date: body.date ? new Date(body.date) : event.date,
      endDate: body.endDate ? new Date(body.endDate) : event.endDate,

      eventType,
      format,
      objectives: body.objectives !== undefined ? body.objectives : event.objectives,
      targetAudience: body.targetAudience !== undefined ? body.targetAudience : event.targetAudience,
      context: body.context !== undefined ? body.context : event.context,
      platform: body.platform !== undefined ? body.platform : event.platform,
      streamUrl: body.streamUrl !== undefined ? body.streamUrl : event.streamUrl,
      // Empty string = clear; non-empty = re-encrypt; undefined = leave as-is.
      streamPasswordEnc:
        body.streamPassword === undefined
          ? event.streamPasswordEnc
          : body.streamPassword === ""
            ? null
            : encrypt(String(body.streamPassword)),
      streamInstructions: body.streamInstructions !== undefined ? body.streamInstructions : event.streamInstructions,
      recordingUrl: body.recordingUrl !== undefined ? body.recordingUrl : event.recordingUrl,

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

  // Don't leak the encrypted blob to the client.
  const { streamPasswordEnc, ...rest } = updated;
  void streamPasswordEnc;
  return NextResponse.json(rest);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try { requireAdmin(req); } catch (e) { return passThrough(e); }
  const { slug } = await params;

  const event = await prisma.event.findUnique({ where: { slug } });
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  await prisma.event.delete({ where: { slug } });
  return NextResponse.json({ success: true });
}
