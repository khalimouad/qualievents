import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdmin, passThrough } from "@/lib/requireRole";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireAuth(req);
  } catch (e) {
    return passThrough(e);
  }
  const { id } = await params;
  const booking = await prisma.groupBooking.findUnique({
    where: { id },
    include: {
      event: { select: { title: true, slug: true, date: true, venue: true, city: true, country: true, format: true, themeColor: true } },
      tier: true,
      subscribers: {
        select: { id: true, firstName: true, lastName: true, email: true, status: true, badge: { select: { code: true, isScanned: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(booking);
}

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
  const existing = await prisma.groupBooking.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await req.json();
  const validStatus = new Set(["pending", "confirmed", "cancelled", "refunded"]);
  const updated = await prisma.groupBooking.update({
    where: { id },
    data: {
      status: body.status && validStatus.has(body.status) ? body.status : existing.status,
      notes: body.notes !== undefined ? body.notes : existing.notes,
      payerName: body.payerName ?? existing.payerName,
      payerEmail: body.payerEmail ?? existing.payerEmail,
      payerPhone: body.payerPhone !== undefined ? body.payerPhone : existing.payerPhone,
      companyName: body.companyName !== undefined ? body.companyName : existing.companyName,
      vatNumber: body.vatNumber !== undefined ? body.vatNumber : existing.vatNumber,
      billingAddress: body.billingAddress !== undefined ? body.billingAddress : existing.billingAddress,
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
  await prisma.groupBooking.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
