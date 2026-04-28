import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdmin, passThrough } from "@/lib/requireRole";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const series = await prisma.eventSeries.findUnique({
    where: { slug },
    include: {
      events: {
        orderBy: { date: "asc" },
        select: {
          id: true, slug: true, title: true, tagline: true, description: true,
          date: true, endDate: true, eventType: true, format: true,
          venue: true, city: true, country: true, themeColor: true, heroImage: true,
          isPublished: true, ticketPrice: true, currency: true,
          ticketTiers: {
            where: { available: true },
            orderBy: [{ sortOrder: "asc" }, { price: "asc" }],
            select: { price: true, currency: true },
          },
          _count: { select: { subscribers: true, panelists: true } },
        },
      },
    },
  });
  if (!series) return NextResponse.json({ error: "Programme introuvable" }, { status: 404 });
  return NextResponse.json(series);
}

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
  const existing = await prisma.eventSeries.findUnique({ where: { slug } });
  if (!existing) return NextResponse.json({ error: "Programme introuvable" }, { status: 404 });

  const body = await req.json();
  const updated = await prisma.eventSeries.update({
    where: { slug },
    data: {
      title: body.title ?? existing.title,
      description: body.description !== undefined ? body.description : existing.description,
      heroImage: body.heroImage !== undefined ? body.heroImage : existing.heroImage,
      brochureUrl: body.brochureUrl !== undefined ? body.brochureUrl : existing.brochureUrl,
      themeColor: body.themeColor !== undefined ? body.themeColor : existing.themeColor,
      isPublished: typeof body.isPublished === "boolean" ? body.isPublished : existing.isPublished,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    requireAdmin(req);
  } catch (e) {
    return passThrough(e);
  }
  const { slug } = await params;
  await prisma.eventSeries.delete({ where: { slug } });
  return NextResponse.json({ ok: true });
}
