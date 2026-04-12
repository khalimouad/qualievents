import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkPaymentStatus, getPaymentMethodLabel } from "@/lib/cinetpay";

// POST: Check payment status (called from checkout page)
export async function POST(req: NextRequest) {
  const { transactionId } = await req.json();
  if (!transactionId) return NextResponse.json({ error: "Missing transaction ID" }, { status: 400 });

  const payment = await prisma.payment.findUnique({ where: { transactionId } });
  if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

  // If already completed/failed, return cached status
  if (payment.status !== "pending") {
    return NextResponse.json({ status: payment.status, method: payment.method });
  }

  // Check with CinetPay
  const result = await checkPaymentStatus(transactionId);

  if (result.data.status === "ACCEPTED") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "completed", method: getPaymentMethodLabel(result.data.payment_method) },
    });
    return NextResponse.json({ status: "completed", method: getPaymentMethodLabel(result.data.payment_method) });
  } else if (result.data.status === "REFUSED" || result.data.status === "ERROR") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "failed" },
    });
    return NextResponse.json({ status: "failed" });
  }

  return NextResponse.json({ status: "pending" });
}
