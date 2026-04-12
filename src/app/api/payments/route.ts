import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { initPayment, isConfigured } from "@/lib/cinetpay";
import { v4 as uuidv4 } from "uuid";

// POST: Initialize a payment for an event registration
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { eventId, firstName, lastName, email, phone } = body;

  if (!eventId || !firstName || !lastName || !email) {
    return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
  }

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) return NextResponse.json({ error: "Événement introuvable" }, { status: 404 });
  if (!event.isPaid || !event.ticketPrice) {
    return NextResponse.json({ error: "Cet événement est gratuit" }, { status: 400 });
  }

  if (!isConfigured()) {
    return NextResponse.json({ error: "Paiement non configuré. Ajoutez CINETPAY_API_KEY et CINETPAY_SITE_ID dans .env" }, { status: 500 });
  }

  const transactionId = `QE-${uuidv4().split("-")[0].toUpperCase()}`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Create payment record
  const payment = await prisma.payment.create({
    data: {
      transactionId,
      amount: event.ticketPrice,
      currency: event.currency,
      status: "pending",
      payerName: `${firstName} ${lastName}`,
      payerEmail: email,
      payerPhone: phone || null,
      eventId: event.id,
      metadata: JSON.stringify({ firstName, lastName, email, phone, company: body.company, jobTitle: body.jobTitle }),
    },
  });

  try {
    const result = await initPayment({
      transactionId,
      amount: event.ticketPrice,
      currency: event.currency,
      description: `Inscription: ${event.title}`,
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
