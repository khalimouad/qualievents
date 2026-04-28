import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, passThrough } from "@/lib/requireRole";

export const runtime = "nodejs";

/**
 * GET — list certifications for an event (admin/staff).
 * Includes the subscriber's name + email + the type / pdfUrl / verificationCode.
 */
export async function GET(
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

  const rows = await prisma.certification.findMany({
    where: { eventId: event.id },
    orderBy: { createdAt: "desc" },
    include: {
      subscriber: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  });
  return NextResponse.json(rows);
}
