import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, passThrough } from "@/lib/requireRole";
import { getCinetPayCreds } from "@/lib/cinetpay";

export const runtime = "nodejs";

/**
 * POST /api/payments/settings/test
 * Runs a no-op CinetPay status check to verify the configured creds work.
 */
export async function POST(req: NextRequest) {
  try {
    requireAdmin(req);
  } catch (e) {
    return passThrough(e);
  }

  const creds = await getCinetPayCreds();
  if (!creds.apiKey || !creds.siteId) {
    return NextResponse.json(
      { ok: false, error: "API key et Site ID sont requis." },
      { status: 400 }
    );
  }

  // CinetPay returns a 4xx with code != 00 for unknown transactions, but the
  // response also tells us whether the apikey/site_id are recognised.
  try {
    const res = await fetch("https://api-checkout.cinetpay.com/v2/payment/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apikey: creds.apiKey,
        site_id: creds.siteId,
        transaction_id: "QE-TEST-PROBE-DOES-NOT-EXIST",
      }),
    });
    const data = await res.json().catch(() => ({}));
    // Code 627 = transaction inconnue (creds OK). Anything else is interesting.
    const credsOk =
      data?.code === "627" ||
      data?.code === "601" ||
      data?.message?.toLowerCase().includes("transaction") ||
      data?.message?.toLowerCase().includes("inconnu");

    return NextResponse.json({
      ok: credsOk,
      mode: creds.mode,
      providerCode: data?.code,
      providerMessage: data?.message || "Aucune réponse",
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Échec du test" },
      { status: 502 }
    );
  }
}
