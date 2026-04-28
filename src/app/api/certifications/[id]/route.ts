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
  const existing = await prisma.certification.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await req.json();
  const updated = await prisma.certification.update({
    where: { id },
    data: {
      type: body.type === "CERTIFIED" || body.type === "PARTICIPATION" ? body.type : existing.type,
      examPassed: typeof body.examPassed === "boolean" ? body.examPassed : existing.examPassed,
      revoked: typeof body.revoked === "boolean" ? body.revoked : existing.revoked,
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
  await prisma.certification.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
