import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, passThrough } from "@/lib/requireRole";

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function GET(req: NextRequest) {
  const all = req.nextUrl.searchParams.get("all") === "true";
  const series = await prisma.eventSeries.findMany({
    where: all ? undefined : { isPublished: true },
    include: { _count: { select: { events: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(series);
}

export async function POST(req: NextRequest) {
  try {
    requireAuth(req);
  } catch (e) {
    return passThrough(e);
  }
  const body = await req.json();
  if (!body.title) {
    return NextResponse.json({ error: "Le titre est requis" }, { status: 400 });
  }
  const slug = body.slug ? slugify(body.slug) : slugify(body.title);
  const existing = await prisma.eventSeries.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "Un programme avec ce slug existe déjà" }, { status: 400 });
  }
  const created = await prisma.eventSeries.create({
    data: {
      slug,
      title: body.title,
      description: body.description || null,
      heroImage: body.heroImage || null,
      brochureUrl: body.brochureUrl || null,
      themeColor: body.themeColor || null,
      isPublished: body.isPublished ?? false,
    },
  });
  return NextResponse.json(created, { status: 201 });
}
