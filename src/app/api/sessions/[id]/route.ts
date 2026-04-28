import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdmin, passThrough } from "@/lib/requireRole";

const VALID_KINDS = new Set(["SESSION", "WORKSHOP", "BREAK", "VISIT", "DINNER", "NETWORKING", "EXAM"]);

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
  const existing = await prisma.eventSession.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Session not found" }, { status: 404 });

  const body = await req.json();
  const updated = await prisma.eventSession.update({
    where: { id },
    data: {
      title: typeof body.title === "string" && body.title ? body.title : existing.title,
      description: body.description !== undefined ? body.description : existing.description,
      kind: VALID_KINDS.has(body.kind) ? body.kind : existing.kind,
      day: typeof body.day === "number" ? body.day : existing.day,
      startTime: body.startTime !== undefined ? body.startTime : existing.startTime,
      endTime: body.endTime !== undefined ? body.endTime : existing.endTime,
      location: body.location !== undefined ? body.location : existing.location,
      speakerName: body.speakerName !== undefined ? body.speakerName : existing.speakerName,
      streamUrl: body.streamUrl !== undefined ? body.streamUrl : existing.streamUrl,
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
  await prisma.eventSession.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
