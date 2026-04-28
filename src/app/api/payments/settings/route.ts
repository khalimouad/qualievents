import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encrypt, decrypt, maskSecret } from "@/lib/crypto";
import { requireAdmin, passThrough } from "@/lib/requireRole";
import { invalidateCredsCache } from "@/lib/cinetpay";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";

interface PublicSettings {
  id: string;
  provider: string;
  enabled: boolean;
  mode: "TEST" | "PRODUCTION";
  apiKeyMasked: string;
  siteIdMasked: string;
  secretKeyMasked: string;
  notifyUrl: string | null;
  returnUrl: string | null;
  currency: string;
  updatedAt: string;
  updatedById: string | null;
}

function maskRow(row: {
  id: string;
  provider: string;
  enabled: boolean;
  mode: string;
  apiKeyEnc: string | null;
  siteIdEnc: string | null;
  secretKeyEnc: string | null;
  notifyUrl: string | null;
  returnUrl: string | null;
  currency: string;
  updatedAt: Date;
  updatedById: string | null;
}): PublicSettings {
  const safeDecrypt = (v: string | null) => {
    if (!v) return "";
    try {
      return decrypt(v);
    } catch {
      return "";
    }
  };
  return {
    id: row.id,
    provider: row.provider,
    enabled: row.enabled,
    mode: row.mode === "PRODUCTION" ? "PRODUCTION" : "TEST",
    apiKeyMasked: maskSecret(safeDecrypt(row.apiKeyEnc)),
    siteIdMasked: maskSecret(safeDecrypt(row.siteIdEnc)),
    secretKeyMasked: maskSecret(safeDecrypt(row.secretKeyEnc)),
    notifyUrl: row.notifyUrl,
    returnUrl: row.returnUrl,
    currency: row.currency,
    updatedAt: row.updatedAt.toISOString(),
    updatedById: row.updatedById,
  };
}

export async function GET(req: NextRequest) {
  try {
    requireAdmin(req);
  } catch (e) {
    return passThrough(e);
  }
  let row = await prisma.paymentSettings.findFirst({ where: { provider: "cinetpay" } });
  if (!row) {
    row = await prisma.paymentSettings.create({ data: { provider: "cinetpay" } });
  }
  return NextResponse.json(maskRow(row));
}

export async function PUT(req: NextRequest) {
  let session;
  try {
    session = requireAdmin(req);
  } catch (e) {
    return passThrough(e);
  }

  const body = await req.json();
  let row = await prisma.paymentSettings.findFirst({ where: { provider: "cinetpay" } });
  if (!row) {
    row = await prisma.paymentSettings.create({ data: { provider: "cinetpay" } });
  }

  const data: Record<string, unknown> = {
    updatedById: session.userId,
  };

  if (typeof body.enabled === "boolean") data.enabled = body.enabled;
  if (body.mode === "TEST" || body.mode === "PRODUCTION") data.mode = body.mode;
  if (typeof body.notifyUrl === "string") data.notifyUrl = body.notifyUrl || null;
  if (typeof body.returnUrl === "string") data.returnUrl = body.returnUrl || null;
  if (typeof body.currency === "string" && body.currency.trim()) data.currency = body.currency.trim();

  // Secrets are only updated if the field is non-empty (empty = "leave as is").
  if (typeof body.apiKey === "string" && body.apiKey.trim()) data.apiKeyEnc = encrypt(body.apiKey.trim());
  if (typeof body.siteId === "string" && body.siteId.trim()) data.siteIdEnc = encrypt(body.siteId.trim());
  if (typeof body.secretKey === "string" && body.secretKey.trim()) data.secretKeyEnc = encrypt(body.secretKey.trim());

  const updated = await prisma.paymentSettings.update({ where: { id: row.id }, data });
  invalidateCredsCache();
  audit(req, {
    action: "payment.settings.update",
    resource: `PaymentSettings:${updated.id}`,
    metadata: {
      // Don't log the secrets — only which fields changed.
      changedFields: Object.keys(data).filter((k) => k !== "updatedById"),
      mode: updated.mode,
      enabled: updated.enabled,
    },
  });
  return NextResponse.json(maskRow(updated));
}
