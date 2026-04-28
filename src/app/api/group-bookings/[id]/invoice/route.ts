import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { requireAuth, passThrough } from "@/lib/requireRole";
import { renderInvoicePdf, buildInvoiceNumber } from "@/lib/invoice";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * POST /api/group-bookings/[id]/invoice
 * Generates the invoice PDF, uploads to Vercel Blob, persists invoiceUrl +
 * invoiceNumber. Reuses the existing number when present (idempotent
 * regeneration); allocates a new sequential number otherwise.
 */
export async function POST(
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
      event: true,
      tier: true,
      subscribers: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Allocate the invoice number (sequential per calendar year) on first run.
  let invoiceNumber = booking.invoiceNumber;
  if (!invoiceNumber) {
    const startOfYear = new Date(new Date().getFullYear(), 0, 1);
    const yearCount = await prisma.groupBooking.count({
      where: { invoiceNumber: { not: null }, updatedAt: { gte: startOfYear } },
    });
    invoiceNumber = buildInvoiceNumber(yearCount);
  }

  const orgName = process.env.ORG_NAME || "QualiEvents";
  const orgEmail = process.env.SMTP_USER || null;
  const lineLabel = booking.tier
    ? `${booking.event.title} — ${booking.tier.name}`
    : `Inscription : ${booking.event.title}`;

  const unitPrice =
    booking.subscribers.length > 0 ? booking.totalAmount / booking.subscribers.length : booking.totalAmount;

  const pdfBuffer = await renderInvoicePdf({
    invoiceNumber,
    reference: booking.reference,
    issuedAt: new Date(),
    currency: booking.currency,
    organizationName: orgName,
    organizationEmail: orgEmail,
    payerName: booking.payerName,
    payerEmail: booking.payerEmail,
    payerPhone: booking.payerPhone,
    companyName: booking.companyName,
    vatNumber: booking.vatNumber,
    billingAddress: booking.billingAddress,
    eventTitle: booking.event.title,
    eventDate: booking.event.date,
    eventLocation:
      booking.event.format === "ONLINE"
        ? "En ligne"
        : [booking.event.venue, booking.event.city, booking.event.country].filter(Boolean).join(", "),
    lines: [
      {
        label: lineLabel,
        unitPrice: Math.floor(unitPrice),
        quantity: booking.subscribers.length,
      },
    ],
    notes: booking.notes,
    themeColor: booking.event.themeColor,
  });

  const filename = `invoices/${booking.event.slug}/${booking.reference}.pdf`;
  const blob = await put(filename, pdfBuffer, {
    access: "public",
    contentType: "application/pdf",
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  const updated = await prisma.groupBooking.update({
    where: { id: booking.id },
    data: { invoiceNumber, invoiceUrl: blob.url },
  });

  return NextResponse.json({
    invoiceNumber: updated.invoiceNumber,
    invoiceUrl: updated.invoiceUrl,
  });
}
