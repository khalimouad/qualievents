import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, passThrough } from "@/lib/requireRole";
import { generateBadgeCode, generateQRDataURL } from "@/lib/qrcode";
import { sendEmail, buildBadgeEmail } from "@/lib/email";
import { decrypt } from "@/lib/crypto";
import { generateBookingReference } from "@/lib/invoice";
import { rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const maxDuration = 30;

interface AttendeeInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
}

interface BookingBody {
  payerName?: string;
  payerEmail?: string;
  payerPhone?: string;
  companyName?: string;
  vatNumber?: string;
  billingAddress?: string;
  notes?: string;
  tierId?: string | null;
  attendees?: AttendeeInput[];
}

/**
 * GET — admin/staff list of group bookings for an event.
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

  const rows = await prisma.groupBooking.findMany({
    where: { eventId: event.id },
    orderBy: { createdAt: "desc" },
    include: {
      tier: { select: { name: true, price: true, currency: true } },
      _count: { select: { subscribers: true } },
    },
  });
  return NextResponse.json(rows);
}

/**
 * POST — public. Books N attendees for the same event in one go.
 * If a paid tier is selected, the booking is created with status=pending and
 * the response includes a paymentInitUrl the client must call separately
 * (kept simple: paid group bookings will plug into the existing /api/payments
 * flow via the booking reference). For free events / free tiers, the flow
 * confirms each attendee immediately.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const rl = await rateLimit(req, { name: "group-bookings", limit: 5, windowSec: 3600 });
  if (!rl.allowed) return rl.response!;

  const { slug } = await params;
  const event = await prisma.event.findUnique({ where: { slug } });
  if (!event) return NextResponse.json({ error: "Événement introuvable" }, { status: 404 });

  const body = (await req.json()) as BookingBody;
  if (!body.payerName || !body.payerEmail) {
    return NextResponse.json({ error: "Coordonnées du payeur requises" }, { status: 400 });
  }
  if (!Array.isArray(body.attendees) || body.attendees.length === 0) {
    return NextResponse.json({ error: "Au moins un participant est requis" }, { status: 400 });
  }
  if (body.attendees.length > 50) {
    return NextResponse.json({ error: "Maximum 50 participants par réservation" }, { status: 400 });
  }
  for (const a of body.attendees) {
    if (!a.firstName?.trim() || !a.lastName?.trim() || !a.email?.trim()) {
      return NextResponse.json({ error: "Prénom, nom et email obligatoires pour chaque participant" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email)) {
      return NextResponse.json({ error: `Email invalide : ${a.email}` }, { status: 400 });
    }
  }

  // Resolve tier for pricing
  let tier: { id: string; name: string; price: number; currency: string } | null = null;
  if (body.tierId) {
    const row = await prisma.eventTicketTier.findUnique({ where: { id: body.tierId } });
    if (!row || row.eventId !== event.id) {
      return NextResponse.json({ error: "Tarif invalide" }, { status: 400 });
    }
    tier = { id: row.id, name: row.name, price: row.price, currency: row.currency };
  }

  const unitPrice = tier?.price ?? event.ticketPrice ?? 0;
  const currency = tier?.currency ?? event.currency;
  const totalAmount = unitPrice * body.attendees.length;
  const isPaid = event.isPaid && totalAmount > 0;

  // Capacity check
  const confirmedCount = await prisma.subscriber.count({
    where: { eventId: event.id, status: { in: ["confirmed", "pending"] } },
  });
  if (confirmedCount + body.attendees.length > event.maxAttendees) {
    return NextResponse.json(
      { error: `Capacité insuffisante : il reste ${Math.max(0, event.maxAttendees - confirmedCount)} place(s).` },
      { status: 400 }
    );
  }

  // Create booking + subscribers in a transaction
  const reference = generateBookingReference();
  const booking = await prisma.$transaction(async (tx) => {
    const created = await tx.groupBooking.create({
      data: {
        reference,
        eventId: event.id,
        tierId: tier?.id ?? null,
        payerName: body.payerName!,
        payerEmail: body.payerEmail!,
        payerPhone: body.payerPhone || null,
        companyName: body.companyName || null,
        vatNumber: body.vatNumber || null,
        billingAddress: body.billingAddress || null,
        totalAmount,
        currency,
        status: isPaid ? "pending" : "confirmed",
        notes: body.notes || null,
      },
    });

    for (const a of body.attendees!) {
      // Skip duplicates silently — the unique (email, eventId) constraint
      // would otherwise abort the whole transaction.
      const existing = await tx.subscriber.findFirst({
        where: { email: a.email!, eventId: event.id },
        select: { id: true },
      });
      if (existing) continue;
      await tx.subscriber.create({
        data: {
          firstName: a.firstName!.trim(),
          lastName: a.lastName!.trim(),
          email: a.email!.trim(),
          phone: a.phone || null,
          company: a.company || body.companyName || null,
          jobTitle: a.jobTitle || null,
          status: isPaid ? "pending" : "confirmed",
          eventId: event.id,
          tierId: tier?.id ?? null,
          groupBookingId: created.id,
        },
      });
    }

    return created;
  });

  // For free events: generate badges + send confirmation emails immediately
  if (!isPaid) {
    const subs = await prisma.subscriber.findMany({
      where: { groupBookingId: booking.id },
    });

    let streamPassword: string | null = null;
    if (event.streamPasswordEnc) {
      try {
        streamPassword = decrypt(event.streamPasswordEnc);
      } catch {
        streamPassword = null;
      }
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
    for (const sub of subs) {
      const badgeCode = generateBadgeCode();
      const qrContent = `${appUrl}/api/scan?code=${badgeCode}`;
      const qrData = await generateQRDataURL(qrContent);
      const badgeNumber = await prisma.badge.count({ where: { eventId: event.id } }) + 1;
      await prisma.badge.create({
        data: { code: badgeCode, badgeNumber, qrData, subscriberId: sub.id, eventId: event.id },
      });
      const html = buildBadgeEmail(
        `${sub.firstName} ${sub.lastName}`,
        event.title,
        badgeCode,
        qrData,
        {
          format: (event.format as "IN_PERSON" | "ONLINE" | "HYBRID") || "IN_PERSON",
          streamUrl: event.streamUrl,
          streamPassword,
          platform: event.platform,
          streamInstructions: event.streamInstructions,
        }
      );
      sendEmail({
        to: sub.email,
        subject: `Votre badge pour ${event.title}`,
        html,
      }).catch((err) => console.error("[group-booking] email failed:", err));
    }
  }

  return NextResponse.json(
    {
      bookingId: booking.id,
      reference: booking.reference,
      status: booking.status,
      totalAmount: booking.totalAmount,
      currency: booking.currency,
      attendeeCount: body.attendees.length,
      requiresPayment: isPaid,
    },
    { status: 201 }
  );
}
