import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, passThrough } from "@/lib/requireRole";
import { audit } from "@/lib/audit";

const SHIFT_MS = 365 * 24 * 60 * 60 * 1000;

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "event";
}

async function uniqueSlug(base: string): Promise<string> {
  let candidate = base;
  let n = 2;
  while (await prisma.event.findUnique({ where: { slug: candidate }, select: { id: true } })) {
    candidate = `${base}-${n++}`;
  }
  return candidate;
}

/** Duplicate an event with its programme, tiers, panelists, sponsors and documents.
 *  Subscribers, badges, payments, certifications and group bookings are NOT cloned —
 *  the new event starts empty. Dates shift forward by ~1 year so the copy is
 *  immediately editable for next year's edition. The clone is created as draft
 *  (isPublished=false) regardless of source. */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try { requireAdmin(req); } catch (e) { return passThrough(e); }
  const { slug } = await params;

  const source = await prisma.event.findUnique({
    where: { slug },
    include: {
      sessions: true,
      ticketTiers: true,
      panelists: true,
      sponsors: true,
      documents: true,
    },
  });
  if (!source) {
    return NextResponse.json({ error: "Événement introuvable" }, { status: 404 });
  }

  let body: { title?: string; date?: string } = {};
  try { body = await req.json(); } catch { /* allow empty body */ }

  const newTitle = (body.title?.trim() || `${source.title} (copie)`);
  const baseSlug = slugify(newTitle);
  const newSlug = await uniqueSlug(baseSlug);

  const sourceStart = source.date.getTime();
  const newStart = body.date ? new Date(body.date) : new Date(sourceStart + SHIFT_MS);
  const shift = newStart.getTime() - sourceStart;
  const newEnd = source.endDate ? new Date(source.endDate.getTime() + shift) : null;

  const created = await prisma.event.create({
    data: {
      slug: newSlug,
      title: newTitle,
      tagline: source.tagline,
      description: source.description,
      date: newStart,
      endDate: newEnd,
      eventType: source.eventType,
      format: source.format,
      objectives: source.objectives,
      targetAudience: source.targetAudience,
      context: source.context,
      platform: source.platform,
      streamUrl: source.streamUrl,
      streamPasswordEnc: source.streamPasswordEnc,
      streamInstructions: source.streamInstructions,
      // Recording is per-edition; don't carry it forward.
      recordingUrl: null,
      venue: source.venue,
      address: source.address,
      city: source.city,
      country: source.country,
      latitude: source.latitude,
      longitude: source.longitude,
      heroImage: source.heroImage,
      gallery: source.gallery,
      themeColor: source.themeColor,
      maxAttendees: source.maxAttendees,
      isPublished: false,
      isPaid: source.isPaid,
      ticketPrice: source.ticketPrice,
      currency: source.currency,
      orgId: source.orgId,
      seriesId: source.seriesId,
      brochureUrl: source.brochureUrl,
      sessions: {
        create: source.sessions.map((s) => ({
          title: s.title,
          description: s.description,
          kind: s.kind,
          day: s.day,
          startTime: s.startTime,
          endTime: s.endTime,
          location: s.location,
          speakerName: s.speakerName,
          streamUrl: s.streamUrl,
          sortOrder: s.sortOrder,
        })),
      },
      ticketTiers: {
        create: source.ticketTiers.map((t) => ({
          name: t.name,
          description: t.description,
          price: t.price,
          currency: t.currency,
          inclusions: t.inclusions,
          capacity: t.capacity,
          available: t.available,
          availableFrom: t.availableFrom ? new Date(t.availableFrom.getTime() + shift) : null,
          availableUntil: t.availableUntil ? new Date(t.availableUntil.getTime() + shift) : null,
          sortOrder: t.sortOrder,
        })),
      },
      panelists: {
        create: source.panelists.map((p) => ({
          firstName: p.firstName,
          lastName: p.lastName,
          email: p.email,
          phone: p.phone,
          bio: p.bio,
          company: p.company,
          jobTitle: p.jobTitle,
          photo: p.photo,
          topic: p.topic,
          linkedin: p.linkedin,
          twitter: p.twitter,
          sortOrder: p.sortOrder,
        })),
      },
      sponsors: {
        create: source.sponsors.map((s) => ({
          name: s.name,
          logo: s.logo,
          website: s.website,
          tier: s.tier,
          sortOrder: s.sortOrder,
        })),
      },
      documents: {
        create: source.documents.map((d) => ({
          kind: d.kind,
          title: d.title,
          url: d.url,
          sizeBytes: d.sizeBytes,
          sortOrder: d.sortOrder,
        })),
      },
    },
    select: { id: true, slug: true, title: true },
  });

  audit(req, {
    action: "event.clone",
    resource: `Event:${created.slug}`,
    metadata: { from: source.slug, title: created.title },
  });

  return NextResponse.json(created, { status: 201 });
}
