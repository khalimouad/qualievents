import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdmin, passThrough } from "@/lib/requireRole";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireAuth(req);
  } catch (e) {
    return passThrough(e);
  }
  const { id } = await params;
  const existing = await prisma.eventTicketTier.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Tier not found" }, { status: 404 });

  const body = await req.json();
  const updated = await prisma.eventTicketTier.update({
    where: { id },
    data: {
      name: typeof body.name === "string" && body.name ? body.name : existing.name,
      description: body.description !== undefined ? body.description || null : existing.description,
      price: typeof body.price === "number" && body.price >= 0 ? Math.floor(body.price) : existing.price,
      currency: typeof body.currency === "string" && body.currency ? body.currency : existing.currency,
      inclusions: Array.isArray(body.inclusions)
        ? body.inclusions.filter((s: unknown) => typeof s === "string" && s.trim())
        : existing.inclusions,
      capacity:
        body.capacity === null
          ? null
          : typeof body.capacity === "number" && body.capacity > 0
            ? body.capacity
            : existing.capacity,
      available: typeof body.available === "boolean" ? body.available : existing.available,
      availableFrom:
        body.availableFrom === null
          ? null
          : body.availableFrom !== undefined
            ? new Date(body.availableFrom)
            : existing.availableFrom,
      availableUntil:
        body.availableUntil === null
          ? null
          : body.availableUntil !== undefined
            ? new Date(body.availableUntil)
            : existing.availableUntil,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireAdmin(req);
  } catch (e) {
    return passThrough(e);
  }
  const { id } = await params;
  await prisma.eventTicketTier.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
