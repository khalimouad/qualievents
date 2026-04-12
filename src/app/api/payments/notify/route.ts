import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkPaymentStatus, getPaymentMethodLabel } from "@/lib/cinetpay";
import { generateBadgeCode, generateQRDataURL } from "@/lib/qrcode";
import { sendEmail, buildBadgeEmail } from "@/lib/email";

// POST: CinetPay webhook notification (called by CinetPay servers)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { cpm_trans_id } = body;

  if (!cpm_trans_id) {
    return NextResponse.json({ error: "Missing transaction ID" }, { status: 400 });
  }

  // Verify payment status with CinetPay
  const result = await checkPaymentStatus(cpm_trans_id);

  const payment = await prisma.payment.findUnique({
    where: { transactionId: cpm_trans_id },
    include: { event: true },
  });

  if (!payment) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  if (result.data.status === "ACCEPTED") {
    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "completed",
        method: getPaymentMethodLabel(result.data.payment_method),
      },
    });

    // Create subscriber + badge from stored metadata
    const meta = JSON.parse(payment.metadata || "{}");
    const existing = await prisma.subscriber.findFirst({
      where: { email: meta.email, eventId: payment.eventId },
    });

    if (!existing) {
      const subscriber = await prisma.subscriber.create({
        data: {
          firstName: meta.firstName || payment.payerName?.split(" ")[0] || "Participant",
          lastName: meta.lastName || payment.payerName?.split(" ").slice(1).join(" ") || "",
          email: meta.email || payment.payerEmail || "",
          phone: meta.phone || payment.payerPhone,
          company: meta.company || null,
          jobTitle: meta.jobTitle || null,
          status: "confirmed",
          paymentId: payment.id,
          eventId: payment.eventId,
        },
      });

      // Generate badge
      const badgeCode = generateBadgeCode();
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const qrContent = `${appUrl}/api/scan?code=${badgeCode}`;
      const qrData = await generateQRDataURL(qrContent);

      await prisma.badge.create({
        data: { code: badgeCode, qrData, subscriberId: subscriber.id, eventId: payment.eventId },
      });

      // Send confirmation email
      const emailHtml = buildBadgeEmail(
        `${subscriber.firstName} ${subscriber.lastName}`,
        payment.event.title,
        badgeCode,
        qrData
      );
      sendEmail({
        to: subscriber.email,
        subject: `Votre badge pour ${payment.event.title} est prêt !`,
        html: emailHtml,
      }).catch(() => {});
    }
  } else if (result.data.status === "REFUSED" || result.data.status === "ERROR") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "failed", method: result.data.payment_method },
    });
  }

  return NextResponse.json({ success: true });
}
