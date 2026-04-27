/**
 * CinetPay Payment Gateway Integration
 * Supports: Orange Money, MTN Mobile Money, Wave, Moov Money, Visa/Mastercard
 * Region: Côte d'Ivoire / West Africa
 *
 * API Docs: https://docs.cinetpay.com
 */

import crypto from "crypto";
import { prisma } from "./prisma";
import { decrypt } from "./crypto";

const ENV_API_KEY = process.env.CINETPAY_API_KEY || "";
const ENV_SITE_ID = process.env.CINETPAY_SITE_ID || "";
const ENV_SECRET_KEY = process.env.CINETPAY_SECRET_KEY || "";

export interface CinetPayCreds {
  apiKey: string;
  siteId: string;
  secretKey: string;
  enabled: boolean;
  mode: "TEST" | "PRODUCTION";
}

let credsCache: { value: CinetPayCreds; loadedAt: number } | null = null;
const CACHE_TTL_MS = 60_000;

/**
 * Returns the CinetPay credentials, preferring the DB row (PaymentSettings)
 * over the legacy env vars. Cached in-memory for 60s to avoid hammering the DB.
 */
export async function getCinetPayCreds(): Promise<CinetPayCreds> {
  if (credsCache && Date.now() - credsCache.loadedAt < CACHE_TTL_MS) {
    return credsCache.value;
  }

  let value: CinetPayCreds = {
    apiKey: ENV_API_KEY,
    siteId: ENV_SITE_ID,
    secretKey: ENV_SECRET_KEY,
    enabled: !!(ENV_API_KEY && ENV_SITE_ID),
    mode: "PRODUCTION",
  };

  try {
    const row = await prisma.paymentSettings.findFirst({ where: { provider: "cinetpay" } });
    if (row) {
      const apiKey = row.apiKeyEnc ? decrypt(row.apiKeyEnc) : "";
      const siteId = row.siteIdEnc ? decrypt(row.siteIdEnc) : "";
      const secretKey = row.secretKeyEnc ? decrypt(row.secretKeyEnc) : "";
      value = {
        apiKey: apiKey || ENV_API_KEY,
        siteId: siteId || ENV_SITE_ID,
        secretKey: secretKey || ENV_SECRET_KEY,
        enabled: row.enabled,
        mode: (row.mode === "TEST" || row.mode === "PRODUCTION") ? row.mode : "TEST",
      };
    }
  } catch (err) {
    // DB unreachable — fall back to env-only.
    console.warn("[cinetpay] failed to read PaymentSettings, falling back to env:", err);
  }

  credsCache = { value, loadedAt: Date.now() };
  return value;
}

/** Invalidate the cache after a settings change so the new creds take effect immediately. */
export function invalidateCredsCache(): void {
  credsCache = null;
}

interface InitPaymentParams {
  transactionId: string;
  amount: number;
  currency?: string;
  description: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  returnUrl: string;
  notifyUrl: string;
  channels?: string; // MOBILE_MONEY, CREDIT_CARD, ALL
  metadata?: string;
}

interface CinetPayInitResponse {
  code: string;
  message: string;
  data: {
    payment_token: string;
    payment_url: string;
  };
}

interface CinetPayStatusResponse {
  code: string;
  message: string;
  data: {
    amount: string;
    currency: string;
    status: string; // ACCEPTED, REFUSED, ERROR
    payment_method: string;
    description: string;
    metadata: string;
    operator_id: string;
    payment_date: string;
  };
}

/**
 * Initialize a payment with CinetPay
 */
export async function initPayment(params: InitPaymentParams): Promise<CinetPayInitResponse> {
  const creds = await getCinetPayCreds();
  const body = {
    apikey: creds.apiKey,
    site_id: creds.siteId,
    transaction_id: params.transactionId,
    amount: params.amount,
    currency: params.currency || "XOF",
    description: params.description,
    customer_name: params.customerName,
    customer_email: params.customerEmail,
    customer_phone_number: params.customerPhone || "",
    return_url: params.returnUrl,
    notify_url: params.notifyUrl,
    channels: params.channels || "ALL",
    metadata: params.metadata || "",
    lang: "FR",
    // Côte d'Ivoire country code
    customer_country: "CI",
  };

  const res = await fetch("https://api-checkout.cinetpay.com/v2/payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return res.json();
}

/**
 * Check payment status
 */
export async function checkPaymentStatus(transactionId: string): Promise<CinetPayStatusResponse> {
  const creds = await getCinetPayCreds();
  const body = {
    apikey: creds.apiKey,
    site_id: creds.siteId,
    transaction_id: transactionId,
  };

  const res = await fetch("https://api-checkout.cinetpay.com/v2/payment/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return res.json();
}

/**
 * Get the human-readable payment method name
 */
export function getPaymentMethodLabel(method: string): string {
  const methods: Record<string, string> = {
    ORANGE_MONEY_CI: "Orange Money",
    MTN_MOBILE_MONEY_CI: "MTN Mobile Money",
    MOOV_MONEY_CI: "Moov Money",
    WAVE_CI: "Wave",
    VISA: "Visa",
    MASTERCARD: "Mastercard",
    OM: "Orange Money",
    MOMO: "MTN Mobile Money",
    FLOOZ: "Moov Money",
  };
  return methods[method] || method;
}

/** Synchronous env-only check kept for backward compat (call sites that can't await). */
export function isConfigured(): boolean {
  return !!(ENV_API_KEY && ENV_SITE_ID);
}

/** Async check that consults DB settings + env fallback. */
export async function isPaymentReady(): Promise<boolean> {
  const c = await getCinetPayCreds();
  return c.enabled && !!c.apiKey && !!c.siteId;
}

/**
 * Verify the HMAC-SHA256 token CinetPay attaches to webhook callbacks.
 * The token is computed server-side as HMAC(secretKey, fieldsConcatenated)
 * over a fixed list of `cpm_*` form fields.
 *
 * https://docs.cinetpay.com/api/1.0-fr/notification
 *
 * @param fields The form-data fields received from the notify POST
 * @param token  The value of the `x-token` header (or `token` field)
 * @param secret The merchant's secret key from the CinetPay back-office
 */
export function verifyWebhookSignature(
  fields: Record<string, string | undefined>,
  token: string | null,
  secret: string
): boolean {
  if (!secret || !token) return false;
  const ordered = [
    "cpm_site_id",
    "cpm_trans_id",
    "cpm_trans_date",
    "cpm_amount",
    "cpm_currency",
    "signature",
    "payment_method",
    "cel_phone_num",
    "cpm_phone_prefixe",
    "cpm_language",
    "cpm_version",
    "cpm_payment_config",
    "cpm_page_action",
    "cpm_custom",
    "cpm_designation",
    "cpm_error_message",
  ];
  const data = ordered.map((k) => fields[k] ?? "").join("");
  const expected = crypto.createHmac("sha256", secret).update(data).digest("hex");
  // constant-time compare
  if (expected.length !== token.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected, "utf8"), Buffer.from(token, "utf8"));
}

/** Async — true when a webhook secret is configured (DB row or env). */
export async function hasWebhookSecret(): Promise<boolean> {
  const c = await getCinetPayCreds();
  return !!c.secretKey;
}
