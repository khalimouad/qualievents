import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, passThrough } from "@/lib/requireRole";

interface TierWithCount {
  id: string;
  eventId: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  inclusions: string[];
  capacity: number | null;
  available: boolean;
  availableFrom: Date | null;
  availableUntil: Date | null;
  sortOrder: number;
  _count?: { subscribers: number };
}

/**
 * Public list — only returns *available* tiers within their availability
 * window when called without auth. Authenticated callers get the full list.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const event = await prisma.event.findUnique({ where: { slug }, select: { id: true } });
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  const tiers = await prisma.eventTicketTier.findMany({
    where: { eventId: event.id },
    orderBy: [{ sortOrder: "asc" }, { price: "asc" }],
    include: { _count: { select: { subscribers: true } } },
  });

  // Compute remaining capacity per tier and surface a thin computed flag.
  const enriched = tiers.map((t: TierWithCount) => {
    const sold = t._count?.subscribers ?? 0;
    const remaining = t.capacity == null ? null : Math.max(t.capacity - sold, 0);
    const now = Date.now();
    const inWindow =
      (!t.availableFrom || new Date(t.availableFrom).getTime() <= now) &&
      (!t.availableUntil || new Date(t.availableUntil).getTime() >= now);
    const purchasable = t.available && inWindow && (remaining == null || remaining > 0);
    return {
      id: t.id,
      eventId: t.eventId,
      name: t.name,
      description: t.description,
      price: t.price,
      currency: t.currency,
      inclusions: t.inclusions,
      capacity: t.capacity,
      remaining,
      available: t.available,
      availableFrom: t.availableFrom,
      availableUntil: t.availableUntil,
      sortOrder: t.sortOrder,
      purchasable,
      sold,
    };
  });

  return NextResponse.json(enriched);
}

const VALID_KEYS = [
  "name",
  "description",
  "price",
  "currency",
  "inclusions",
  "capacity",
  "available",
  "availableFrom",
  "availableUntil",
] as const;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    requireAuth(req);
  } catch (e) {
    return passThrough(e);
  }
  const { slug } = await params;
  const event = await prisma.event.findUnique({ where: { slug }, select: { id: true } });
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  const body = await req.json();
  if (!body.name || typeof body.price !== "number") {
    return NextResponse.json({ error: "Le nom et le prix sont obligatoires." }, { status: 400 });
  }
  if (body.price < 0) {
    return NextResponse.json({ error: "Le prix doit être positif." }, { status: 400 });
  }

  const last = await prisma.eventTicketTier.findFirst({
    where: { eventId: event.id },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  const created = await prisma.eventTicketTier.create({
    data: {
      eventId: event.id,
      name: String(body.name),
      description: body.description || null,
      price: Math.floor(body.price),
      currency: body.currency || "EUR",
      inclusions: Array.isArray(body.inclusions) ? body.inclusions.filter((s: unknown) => typeof s === "string" && s.trim()) : [],
      capacity: typeof body.capacity === "number" && body.capacity > 0 ? body.capacity : null,
      available: body.available !== false,
      availableFrom: body.availableFrom ? new Date(body.availableFrom) : null,
      availableUntil: body.availableUntil ? new Date(body.availableUntil) : null,
      sortOrder: (last?.sortOrder ?? 0) + 10,
    },
  });

  void VALID_KEYS;
  return NextResponse.json(created, { status: 201 });
}

/**
 * PUT: bulk reorder via { order: [id, id, ...] }.
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    requireAuth(req);
  } catch (e) {
    return passThrough(e);
  }
  const { slug } = await params;
  const event = await prisma.event.findUnique({ where: { slug }, select: { id: true } });
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  const { order } = await req.json();
  if (!Array.isArray(order)) {
    return NextResponse.json({ error: "order must be an array of tier IDs" }, { status: 400 });
  }
  await prisma.$transaction(
    order.map((id: string, idx: number) =>
      prisma.eventTicketTier.updateMany({
        where: { id, eventId: event.id },
        data: { sortOrder: (idx + 1) * 10 },
      })
    )
  );
  return NextResponse.json({ ok: true });
}
