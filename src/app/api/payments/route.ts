import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { initPayment, isPaymentReady } from "@/lib/cinetpay";
import { v4 as uuidv4 } from "uuid";

// POST: Initialize a payment for an event registration
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { eventId, firstName, lastName, email, phone, tierId } = body;

  if (!eventId || !firstName || !lastName || !email) {
    return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
  }

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) return NextResponse.json({ error: "Événement introuvable" }, { status: 404 });

  // Resolve the price + currency from the selected tier if any, otherwise
  // fall back to the legacy event-level ticketPrice/currency.
  let amount = event.ticketPrice ?? 0;
  let currency = event.currency;
  let tier: { id: string; name: string; price: number; currency: string } | null = null;

  if (tierId) {
    const row = await prisma.eventTicketTier.findUnique({ where: { id: tierId } });
    if (!row || row.eventId !== event.id) {
      return NextResponse.json({ error: "Tarif invalide" }, { status: 400 });
    }
    if (!row.available) {
      return NextResponse.json({ error: "Ce tarif n'est plus disponible" }, { status: 400 });
    }
    const now = Date.now();
    if (row.availableFrom && new Date(row.availableFrom).getTime() > now) {
      return NextResponse.json({ error: "Ce tarif n'est pas encore disponible" }, { status: 400 });
    }
    if (row.availableUntil && new Date(row.availableUntil).getTime() < now) {
      return NextResponse.json({ error: "Ce tarif n'est plus disponible" }, { status: 400 });
    }
    if (row.capacity != null) {
      const sold = await prisma.subscriber.count({ where: { tierId: row.id } });
      if (sold >= row.capacity) {
        return NextResponse.json({ error: "Ce tarif est complet" }, { status: 400 });
      }
    }
    tier = { id: row.id, name: row.name, price: row.price, currency: row.currency };
    amount = row.price;
    currency = row.currency;
  }

  if (!event.isPaid || amount <= 0) {
    return NextResponse.json({ error: "Cet événement (ou ce tarif) est gratuit" }, { status: 400 });
  }

  if (!(await isPaymentReady())) {
    return NextResponse.json({ error: "Paiement non configuré. Configurez le fournisseur dans Paramètres → Paiements." }, { status: 500 });
  }

  const transactionId = `QE-${uuidv4().split("-")[0].toUpperCase()}`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Create payment record
  const payment = await prisma.payment.create({
    data: {
      transactionId,
      amount,
      currency,
      status: "pending",
      payerName: `${firstName} ${lastName}`,
      payerEmail: email,
      payerPhone: phone || null,
      eventId: event.id,
      tierId: tier?.id ?? null,
      metadata: JSON.stringify({ firstName, lastName, email, phone, company: body.company, jobTitle: body.jobTitle, tierId: tier?.id ?? null }),
    },
  });

  try {
    const result = await initPayment({
      transactionId,
      amount,
      currency,
      description: tier ? `${event.title} — ${tier.name}` : `Inscription: ${event.title}`,
      customerName: `${firstName} ${lastName}`,
      customerEmail: email,
      customerPhone: phone,
      returnUrl: `${appUrl}/events/${event.slug}/checkout?tx=${transactionId}`,
      notifyUrl: `${appUrl}/api/payments/notify`,
      channels: "ALL",
      metadata: payment.id,
    });

    if (result.code === "201") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { cinetpayPayId: result.data.payment_token },
      });

      return NextResponse.json({
        paymentUrl: result.data.payment_url,
        transactionId,
      });
    } else {
      return NextResponse.json({ error: result.message || "Échec d'initialisation du paiement" }, { status: 400 });
    }
  } catch (e) {
    return NextResponse.json({ error: "Erreur de connexion au service de paiement" }, { status: 500 });
  }
}

// GET: List payments for an event
export async function GET(req: NextRequest) {
  const eventId = req.nextUrl.searchParams.get("eventId");
  if (!eventId) return NextResponse.json({ error: "eventId requis" }, { status: 400 });

  const payments = await prisma.payment.findMany({
    where: { eventId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(payments);
}
