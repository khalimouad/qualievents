import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdmin, passThrough } from "@/lib/requireRole";

const VALID_KINDS = new Set(["PROGRAMME", "BROCHURE", "LOGISTICS", "TERMS", "OTHER"]);

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
  const existing = await prisma.eventDocument.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Document not found" }, { status: 404 });
  const body = await req.json();
  const updated = await prisma.eventDocument.update({
    where: { id },
    data: {
      kind: VALID_KINDS.has(body.kind) ? body.kind : existing.kind,
      title: typeof body.title === "string" && body.title ? body.title : existing.title,
      url: typeof body.url === "string" && body.url ? body.url : existing.url,
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
  await prisma.eventDocument.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
