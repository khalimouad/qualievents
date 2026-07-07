import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";

interface SmtpConfig {
  host: string;
  port: number;
  user: string | undefined;
  pass: string | undefined;
  senderName: string;
  senderEmail: string;
}

async function getSmtpConfig(): Promise<SmtpConfig> {
  try {
    const row = await prisma.emailSettings.findFirst();
    if (row && (row.smtpUser || row.smtpPassEnc)) {
      let pass: string | undefined;
      if (row.smtpPassEnc) {
        try { pass = decrypt(row.smtpPassEnc); } catch { pass = undefined; }
      }
      return {
        host: row.smtpHost,
        port: row.smtpPort,
        user: row.smtpUser ?? undefined,
        pass,
        senderName: row.senderName,
        senderEmail: row.senderEmail || row.smtpUser || "noreply@qualivoire.com",
      };
    }
  } catch {
    // DB unavailable — fall through to env vars
  }
  return {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    senderName: "Qualivoire Connect",
    senderEmail: process.env.SMTP_USER || "noreply@qualivoire.com",
  };
}

export interface EmailAttachment {
  filename: string;
  content: Buffer;
  contentType?: string;
  /** Content-ID for inline images referenced in the HTML as `cid:<cid>`. */
  cid?: string;
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  /**
   * Optional one-click unsubscribe URL (RFC 8058 / 2369).
   * Adds List-Unsubscribe headers for Gmail / Apple Mail / Outlook.
   */
  unsubscribeUrl?: string;
  attachments?: EmailAttachment[];
}

export async function sendEmail({ to, subject, html, unsubscribeUrl, attachments }: SendEmailOptions) {
  try {
    const cfg = await getSmtpConfig();
    const transporter = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.port === 465,
      auth: cfg.user ? { user: cfg.user, pass: cfg.pass } : undefined,
    });
    const headers: Record<string, string> = {};
    if (unsubscribeUrl) {
      headers["List-Unsubscribe"] = `<${unsubscribeUrl}>`;
      headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
    }
    const info = await transporter.sendMail({
      from: `"${cfg.senderName}" <${cfg.senderEmail}>`,
      to,
      subject,
      html,
      headers: Object.keys(headers).length ? headers : undefined,
      attachments,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error };
  }
}

export function buildInvitationEmail(name: string, eventTitle: string, eventDate: string, registrationUrl: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: #e94560; margin: 0; font-size: 28px;">Qualivoire Connect</h1>
        <p style="color: #ffffff; margin-top: 10px; font-size: 14px;">You're Invited!</p>
      </div>
      <div style="background: #ffffff; padding: 30px; border: 1px solid #eee; border-radius: 0 0 12px 12px;">
        <h2 style="color: #1a1a2e;">Hello ${name},</h2>
        <p style="color: #333; line-height: 1.6;">
          We are delighted to invite you to <strong>${eventTitle}</strong> on <strong>${eventDate}</strong>.
        </p>
        <p style="color: #333; line-height: 1.6;">
          Join industry leaders and innovators for an unforgettable experience filled with insights, networking, and inspiration.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${registrationUrl}" style="background: #e94560; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
            Register Now
          </a>
        </div>
        <p style="color: #999; font-size: 12px; text-align: center;">
          Qualivoire Connect - Premium Event Management
        </p>
      </div>
    </body>
    </html>
  `;
}

export interface BadgeEmailExtras {
  format?: "IN_PERSON" | "ONLINE" | "HYBRID";
  streamUrl?: string | null;
  streamPassword?: string | null;
  platform?: string | null;
  streamInstructions?: string | null;
}

/**
 * Content-ID used to embed the QR code as an inline attachment. Gmail and
 * most other clients strip `data:` URIs from received-mail <img> tags, so
 * the QR must be sent as a real attachment referenced via `cid:`.
 */
export const BADGE_QR_CID = "badge-qrcode";

export function buildBadgeEmail(
  name: string,
  eventTitle: string,
  badgeCode: string,
  extras: BadgeEmailExtras = {}
) {
  const { format = "IN_PERSON", streamUrl, streamPassword, platform, streamInstructions } = extras;
  const isOnline = format === "ONLINE";
  const hasStream = !!streamUrl && format !== "IN_PERSON";

  const streamBlock = hasStream
    ? `
      <div style="background: #fff5e6; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff7a00; text-align: left;">
        <p style="margin: 0 0 8px; color: #1a120b; font-weight: 600;">🎥 Lien de visioconférence${platform ? ` — ${platform}` : ""}</p>
        <p style="margin: 0 0 12px;"><a href="${streamUrl}" style="color: #ff7a00; word-break: break-all;">${streamUrl}</a></p>
        ${streamPassword ? `<p style="margin: 0 0 8px; color: #4a3a2c; font-size: 14px;">Mot de passe : <code style="background:#fff;padding:2px 8px;border-radius:4px;border:1px solid #f2e5d5;font-family:monospace;">${streamPassword}</code></p>` : ""}
        ${streamInstructions ? `<p style="margin: 8px 0 0; color: #4a3a2c; font-size: 14px; white-space: pre-line;">${streamInstructions.replace(/</g, "&lt;")}</p>` : ""}
      </div>
    `
    : "";

  // For pure-online events the QR code isn't strictly useful for door check-in,
  // but we keep it because some operators still scan online attendees on a
  // welcome page; the server-side scanner already handles both cases.
  //
  // The QR is sent as an inline `cid:` attachment rather than a `data:` URI —
  // Gmail and most other mail clients strip base64 data URIs from received
  // mail, which left the image broken. The long alphanumeric code is kept
  // only as a small fallback for manual entry if the QR can't be scanned.
  const inPersonBlock = !isOnline
    ? `
      <img src="cid:${BADGE_QR_CID}" alt="QR Code" style="width: 220px; height: 220px;" />
      <p style="color: #666; font-size: 14px; margin: 12px 0 20px;">Présentez ce QR code à l'entrée de l'événement.</p>
      <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; margin: 0 0 10px;">
        <p style="color: #666; margin: 0 0 4px; font-size: 12px;">Code de secours (si le QR ne peut pas être scanné) :</p>
        <p style="font-size: 14px; font-weight: bold; color: #ff7a00; letter-spacing: 1px; margin: 0; font-family: monospace;">${badgeCode}</p>
      </div>
    `
    : `
      <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p style="color: #666; margin: 0 0 4px; font-size: 13px;">Code de référence :</p>
        <p style="font-size: 18px; font-weight: bold; color: #4a3a2c; letter-spacing: 2px; margin: 0; font-family: monospace;">${badgeCode}</p>
      </div>
    `;

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #ff7a00 0%, #e56500 100%); padding: 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Qualivoire Connect</h1>
        <p style="color: #ffffff; margin-top: 10px;">${isOnline ? "Votre place est confirmée !" : "Votre badge est prêt !"}</p>
      </div>
      <div style="background: #ffffff; padding: 30px; border: 1px solid #eee; border-radius: 0 0 12px 12px; text-align: center;">
        <h2 style="color: #1a120b;">Bonjour ${name},</h2>
        <p style="color: #333;">${isOnline ? `Vous êtes inscrit·e à <strong>${eventTitle}</strong>.` : `Votre badge pour <strong>${eventTitle}</strong> est prêt.`}</p>
        ${streamBlock}
        ${inPersonBlock}
      </div>
    </body>
    </html>
  `;
}

export function buildNewsletterEmail(content: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: #e94560; margin: 0; font-size: 24px;">Qualivoire Connect Newsletter</h1>
      </div>
      <div style="background: #ffffff; padding: 30px; border: 1px solid #eee; border-radius: 0 0 12px 12px;">
        ${content}
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="color: #999; font-size: 12px; text-align: center;">
          Qualivoire Connect - Premium Event Management
        </p>
      </div>
    </body>
    </html>
  `;
}
