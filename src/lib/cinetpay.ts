/**
 * CinetPay Payment Gateway Integration
 * Supports: Orange Money, MTN Mobile Money, Wave, Moov Money, Visa/Mastercard
 * Region: Côte d'Ivoire / West Africa
 *
 * API Docs: https://docs.cinetpay.com
 */

const CINETPAY_API_KEY = process.env.CINETPAY_API_KEY || "";
const CINETPAY_SITE_ID = process.env.CINETPAY_SITE_ID || "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

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
  const body = {
    apikey: CINETPAY_API_KEY,
    site_id: CINETPAY_SITE_ID,
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
  const body = {
    apikey: CINETPAY_API_KEY,
    site_id: CINETPAY_SITE_ID,
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

export function isConfigured(): boolean {
  return !!(CINETPAY_API_KEY && CINETPAY_SITE_ID);
}
