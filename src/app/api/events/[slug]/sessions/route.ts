import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, passThrough } from "@/lib/requireRole";

const VALID_KINDS = new Set(["SESSION", "WORKSHOP", "BREAK", "VISIT", "DINNER", "NETWORKING", "EXAM"]);

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const event = await prisma.event.findUnique({ where: { slug }, select: { id: true } });
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
  const sessions = await prisma.eventSession.findMany({
    where: { eventId: event.id },
    orderBy: [{ day: "asc" }, { sortOrder: "asc" }, { startTime: "asc" }],
  });
  return NextResponse.json(sessions);
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
  if (!body.title) {
    return NextResponse.json({ error: "Le titre est requis" }, { status: 400 });
  }

  // Place new session at the bottom of its day.
  const last = await prisma.eventSession.findFirst({
    where: { eventId: event.id, day: body.day || 1 },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  const session = await prisma.eventSession.create({
    data: {
      eventId: event.id,
      title: String(body.title),
      description: body.description || null,
      kind: VALID_KINDS.has(body.kind) ? body.kind : "SESSION",
      day: typeof body.day === "number" ? body.day : 1,
      startTime: body.startTime || null,
      endTime: body.endTime || null,
      location: body.location || null,
      speakerName: body.speakerName || null,
      streamUrl: body.streamUrl || null,
      sortOrder: (last?.sortOrder ?? 0) + 10,
    },
  });
  return NextResponse.json(session, { status: 201 });
}

/**
 * PUT /api/events/[slug]/sessions
 * Body: { order: string[] }
 * Bulk-updates sortOrder according to the array of session IDs (10, 20, 30…).
 * Used by the drag-style reorder in the admin Programme tab.
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
    return NextResponse.json({ error: "order must be an array of session IDs" }, { status: 400 });
  }
  await prisma.$transaction(
    order.map((id: string, idx: number) =>
      prisma.eventSession.updateMany({
        where: { id, eventId: event.id },
        data: { sortOrder: (idx + 1) * 10 },
      })
    )
  );
  return NextResponse.json({ ok: true });
}
