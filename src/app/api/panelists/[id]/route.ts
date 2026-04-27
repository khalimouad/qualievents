import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.panelist.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Panelist not found" }, { status: 404 });
  }

  const updated = await prisma.panelist.update({
    where: { id },
    data: {
      firstName: body.firstName ?? existing.firstName,
      lastName: body.lastName ?? existing.lastName,
      email: body.email ?? existing.email,
      phone: body.phone !== undefined ? body.phone : existing.phone,
      bio: body.bio ?? existing.bio,
      company: body.company !== undefined ? body.company : existing.company,
      jobTitle: body.jobTitle !== undefined ? body.jobTitle : existing.jobTitle,
      photo: body.photo !== undefined ? body.photo : existing.photo,
      topic: body.topic !== undefined ? body.topic : existing.topic,
      linkedin: body.linkedin !== undefined ? body.linkedin : existing.linkedin,
      twitter: body.twitter !== undefined ? body.twitter : existing.twitter,
      sortOrder: body.sortOrder !== undefined ? body.sortOrder : existing.sortOrder,
    },
  });

  return NextResponse.json(updated);
}
