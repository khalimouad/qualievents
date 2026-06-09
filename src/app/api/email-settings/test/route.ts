import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, passThrough } from "@/lib/requireRole";
import { sendEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try { requireAdmin(req); } catch (e) { return passThrough(e); }

  const { to } = await req.json();
  if (!to) return NextResponse.json({ error: "Adresse email requise" }, { status: 400 });

  const result = await sendEmail({
    to,
    subject: "Test SMTP — Qualivoire Connect",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;">
        <h2 style="color:#1a1a2e;">Test de configuration SMTP</h2>
        <p style="color:#333;">Si vous recevez cet email, votre configuration SMTP fonctionne correctement.</p>
        <p style="color:#999;font-size:12px;margin-top:24px;">Qualivoire Connect — envoyé depuis les paramètres admin</p>
      </div>
    `,
  });

  if (!result.success) {
    return NextResponse.json({ ok: false, error: String(result.error) }, { status: 500 });
  }
  return NextResponse.json({ ok: true, messageId: result.messageId });
}
