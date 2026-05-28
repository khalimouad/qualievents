import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encrypt, decrypt, maskSecret } from "@/lib/crypto";
import { requireAdmin, passThrough } from "@/lib/requireRole";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";

function maskRow(row: {
  id: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string | null;
  smtpPassEnc: string | null;
  senderName: string;
  senderEmail: string | null;
  updatedAt: Date;
  updatedById: string | null;
}) {
  const safeDecrypt = (v: string | null) => {
    if (!v) return "";
    try { return decrypt(v); } catch { return ""; }
  };
  return {
    id: row.id,
    smtpHost: row.smtpHost,
    smtpPort: row.smtpPort,
    smtpUser: row.smtpUser || "",
    smtpPassMasked: maskSecret(safeDecrypt(row.smtpPassEnc)),
    senderName: row.senderName,
    senderEmail: row.senderEmail || "",
    updatedAt: row.updatedAt.toISOString(),
    updatedById: row.updatedById,
  };
}

export async function GET(req: NextRequest) {
  try { requireAdmin(req); } catch (e) { return passThrough(e); }

  const row = await prisma.emailSettings.findFirst();
  if (!row) {
    return NextResponse.json({
      id: null,
      smtpHost: process.env.SMTP_HOST || "smtp.gmail.com",
      smtpPort: parseInt(process.env.SMTP_PORT || "587"),
      smtpUser: process.env.SMTP_USER || "",
      smtpPassMasked: process.env.SMTP_PASS ? "••••••••" : "",
      senderName: "QualiEvents",
      senderEmail: "",
      updatedAt: null,
      updatedById: null,
    });
  }
  return NextResponse.json(maskRow(row));
}

export async function PUT(req: NextRequest) {
  try { requireAdmin(req); } catch (e) { return passThrough(e); }

  const body = await req.json();
  const { smtpHost, smtpPort, smtpUser, smtpPass, senderName, senderEmail } = body;

  const session = (req as NextRequest & { session?: { userId?: string } }).session;
  const updatedById = session?.userId ?? null;

  const data: Record<string, unknown> = {
    smtpHost: smtpHost || "smtp.gmail.com",
    smtpPort: parseInt(smtpPort) || 587,
    smtpUser: smtpUser || null,
    senderName: senderName || "QualiEvents",
    senderEmail: senderEmail || null,
    updatedById,
  };

  // Only update password if a new one was provided (non-empty)
  if (smtpPass && smtpPass.trim()) {
    data.smtpPassEnc = encrypt(smtpPass.trim());
  }

  const existing = await prisma.emailSettings.findFirst();
  const row = existing
    ? await prisma.emailSettings.update({ where: { id: existing.id }, data })
    : await prisma.emailSettings.create({ data: { ...data } as Parameters<typeof prisma.emailSettings.create>[0]["data"] });

  audit(req, { action: "email-settings.update", metadata: { smtpHost: data.smtpHost } });

  return NextResponse.json(maskRow(row));
}
