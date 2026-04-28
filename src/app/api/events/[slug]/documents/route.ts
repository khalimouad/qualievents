import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, passThrough } from "@/lib/requireRole";

const VALID_KINDS = new Set(["PROGRAMME", "BROCHURE", "LOGISTICS", "TERMS", "OTHER"]);

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const event = await prisma.event.findUnique({ where: { slug }, select: { id: true } });
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
  const docs = await prisma.eventDocument.findMany({
    where: { eventId: event.id },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json(docs);
}

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
  if (!body.title || !body.url) {
    return NextResponse.json({ error: "Le titre et le lien sont requis" }, { status: 400 });
  }

  const last = await prisma.eventDocument.findFirst({
    where: { eventId: event.id },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  const doc = await prisma.eventDocument.create({
    data: {
      eventId: event.id,
      kind: VALID_KINDS.has(body.kind) ? body.kind : "OTHER",
      title: String(body.title),
      url: String(body.url),
      sizeBytes: typeof body.sizeBytes === "number" ? body.sizeBytes : null,
      sortOrder: (last?.sortOrder ?? 0) + 10,
    },
  });
  return NextResponse.json(doc, { status: 201 });
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
  const event = await prisma.event.findUnique({ where: { slug }, select: { id: true } });
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
  const { order } = await req.json();
  if (!Array.isArray(order)) {
    return NextResponse.json({ error: "order must be an array of document IDs" }, { status: 400 });
  }
  await prisma.$transaction(
    order.map((id: string, idx: number) =>
      prisma.eventDocument.updateMany({
        where: { id, eventId: event.id },
        data: { sortOrder: (idx + 1) * 10 },
      })
    )
  );
  return NextResponse.json({ ok: true });
}
