import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.sponsor.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Sponsor not found" }, { status: 404 });
  }

  const updated = await prisma.sponsor.update({
    where: { id },
    data: {
      name: body.name ?? existing.name,
      logo: body.logo !== undefined ? body.logo : existing.logo,
      website: body.website !== undefined ? body.website : existing.website,
      tier: body.tier ?? existing.tier,
      sortOrder: body.sortOrder !== undefined ? body.sortOrder : existing.sortOrder,
    },
  });

  return NextResponse.json(updated);
}
