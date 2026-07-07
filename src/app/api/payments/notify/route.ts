import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  checkPaymentStatus,
  getPaymentMethodLabel,
  verifyWebhookSignature,
  getCinetPayCreds,
} from "@/lib/cinetpay";
import { decrypt } from "@/lib/crypto";
import { generateBadgeCode, generateQRDataURL } from "@/lib/qrcode";
import { sendEmail, buildBadgeEmail } from "@/lib/email";
import { buildBadgeAttachments } from "@/lib/badgeAttachments";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

/**
 * CinetPay sends webhook notifications as application/x-www-form-urlencoded
 * (cpm_* fields) and includes an HMAC-SHA256 token in the `x-token` header.
 * We:
 *   1. Read fields from form-data (with a JSON fallback for older sandboxes
 *      and for our own tests).
 *   2. Verify the HMAC signature against the merchant's secret key.
 *   3. Look up the payment, verify the amount matches what CinetPay reports.
 *   4. Re-check status with the CinetPay API (defence-in-depth).
 *   5. Create the subscriber + badge only after all checks pass.
 */
export async function POST(req: NextRequest) {
  // ---- 1. Parse form-data or JSON ----
  let fields: Record<string, string> = {};
  const contentType = req.headers.get("content-type") || "";
  try {
    if (contentType.includes("application/json")) {
      fields = (await req.json()) as Record<string, string>;
    } else {
      const formData = await req.formData();
      formData.forEach((v, k) => {
        fields[k] = typeof v === "string" ? v : "";
      });
    }
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const cpm_trans_id = fields.cpm_trans_id;
  if (!cpm_trans_id) {
    return NextResponse.json({ error: "Missing transaction ID" }, { status: 400 });
  }

  // ---- 2. Verify HMAC signature ----
  // CinetPay puts it in the `x-token` header in newer integrations and in the
  // `token` body field in older ones — accept either.
  const headerToken = req.headers.get("x-token") || req.headers.get("X-Token") || null;
  const bodyToken = fields.token || null;
  const token = headerToken || bodyToken;

  const creds = await getCinetPayCreds();
  if (creds.secretKey) {
    if (!verifyWebhookSignature(fields, token, creds.secretKey)) {
      logger.warn("payments.notify", "invalid signature", { txId: cpm_trans_id });
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }
  } else if (process.env.NODE_ENV === "production") {
    logger.error("payments.notify", "webhook secret not configured", { txId: cpm_trans_id });
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 503 }
    );
  } else {
    logger.warn("payments.notify", "signature skipped — secret key not set (dev only)");
  }

  // ---- 3. Look up payment ----
  const payment = await prisma.payment.findUnique({
    where: { transactionId: cpm_trans_id },
    include: { event: true },
  });

  if (!payment) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  // Idempotency: if already completed, just acknowledge.
  if (payment.status === "completed") {
    return NextResponse.json({ success: true, idempotent: true });
  }

  // ---- 4. Re-check status with CinetPay (don't trust the webhook body) ----
  const result = await checkPaymentStatus(cpm_trans_id);

  if (result.data.status === "ACCEPTED") {
    // Verify the amount the gateway reports matches what we asked for.
    // CinetPay returns `data.amount` as a string.
    const reported = Number(result.data.amount);
    if (!Number.isFinite(reported) || reported !== payment.amount) {
      logger.error("payments.notify", "amount mismatch", {
        txId: cpm_trans_id,
        expected: payment.amount,
        reported: result.data.amount,
      });
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "failed", method: result.data.payment_method },
      });
      return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
    }

    // Verify the currency matches too.
    if (result.data.currency && result.data.currency !== payment.currency) {
      logger.error("payments.notify", "currency mismatch", {
        txId: cpm_trans_id,
        expected: payment.currency,
        reported: result.data.currency,
      });
      return NextResponse.json({ error: "Currency mismatch" }, { status: 400 });
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "completed",
        method: getPaymentMethodLabel(result.data.payment_method),
      },
    });

    // ---- 5. Create subscriber + badge (idempotent on email+event) ----
    let meta: Record<string, string | undefined> = {};
    try {
      meta = JSON.parse(payment.metadata || "{}");
    } catch {
      meta = {};
    }
    const email = meta.email || payment.payerEmail || "";
    const existing = email
      ? await prisma.subscriber.findFirst({ where: { email, eventId: payment.eventId } })
      : null;

    if (!existing) {
      const subscriber = await prisma.subscriber.create({
        data: {
          firstName: meta.firstName || payment.payerName?.split(" ")[0] || "Participant",
          lastName: meta.lastName || payment.payerName?.split(" ").slice(1).join(" ") || "",
          email: email,
          phone: meta.phone || payment.payerPhone,
          company: meta.company || null,
          jobTitle: meta.jobTitle || null,
          status: "confirmed",
          paymentId: payment.id,
          tierId: payment.tierId ?? null,
          eventId: payment.eventId,
        },
      });

      const badgeCode = generateBadgeCode();
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const qrContent = `${appUrl}/api/scan?code=${badgeCode}`;
      const qrData = await generateQRDataURL(qrContent);
      const badgeNumber = await prisma.badge.count({ where: { eventId: payment.eventId } }) + 1;

      await prisma.badge.create({
        data: { code: badgeCode, badgeNumber, qrData, subscriberId: subscriber.id, eventId: payment.eventId },
      });

      let streamPassword: string | null = null;
      if (payment.event.streamPasswordEnc) {
        try {
          streamPassword = decrypt(payment.event.streamPasswordEnc);
        } catch {
          streamPassword = null;
        }
      }

      const format = (payment.event.format as "IN_PERSON" | "ONLINE" | "HYBRID") || "IN_PERSON";
      const emailHtml = buildBadgeEmail(
        `${subscriber.firstName} ${subscriber.lastName}`,
        payment.event.title,
        badgeCode,
        {
          format,
          streamUrl: payment.event.streamUrl,
          streamPassword,
          platform: payment.event.platform,
          streamInstructions: payment.event.streamInstructions,
        }
      );
      buildBadgeAttachments(format, {
        code: badgeCode,
        badgeNumber,
        type: "STANDARD",
        qrData,
        subscriber: { firstName: subscriber.firstName, lastName: subscriber.lastName, jobTitle: subscriber.jobTitle, company: subscriber.company },
        event: { title: payment.event.title, date: payment.event.date, city: payment.event.city, themeColor: payment.event.themeColor, logoUrl: payment.event.logoUrl },
      }).then((attachments) =>
        sendEmail({
          to: subscriber.email,
          subject: `Votre badge pour ${payment.event.title} est prêt !`,
          html: emailHtml,
          attachments,
        })
      ).catch((err) => {
        logger.error("payments.notify", "badge email failed", { error: err, subscriberId: subscriber.id });
      });
    }
  } else if (result.data.status === "REFUSED" || result.data.status === "ERROR") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "failed", method: result.data.payment_method },
    });
  }

  return NextResponse.json({ success: true });
}
