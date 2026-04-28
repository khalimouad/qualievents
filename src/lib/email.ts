import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: `"QualiEvents" <${process.env.SMTP_USER || "noreply@qualievents.com"}>`,
      to,
      subject,
      html,
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
        <h1 style="color: #e94560; margin: 0; font-size: 28px;">QualiEvents</h1>
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
          QualiEvents - Premium Event Management
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

export function buildBadgeEmail(
  name: string,
  eventTitle: string,
  badgeCode: string,
  qrDataUrl: string,
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
  const inPersonBlock = !isOnline
    ? `
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="color: #666; margin: 0 0 5px;">Code du badge :</p>
        <p style="font-size: 32px; font-weight: bold; color: #ff7a00; letter-spacing: 4px; margin: 0;">${badgeCode}</p>
      </div>
      <img src="${qrDataUrl}" alt="QR Code" style="width: 200px; height: 200px;" />
      <p style="color: #666; font-size: 14px;">Présentez ce QR code à l'entrée de l'événement.</p>
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
        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">QualiEvents</h1>
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
        <h1 style="color: #e94560; margin: 0; font-size: 24px;">QualiEvents Newsletter</h1>
      </div>
      <div style="background: #ffffff; padding: 30px; border: 1px solid #eee; border-radius: 0 0 12px 12px;">
        ${content}
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="color: #999; font-size: 12px; text-align: center;">
          QualiEvents - Premium Event Management
        </p>
      </div>
    </body>
    </html>
  `;
}
