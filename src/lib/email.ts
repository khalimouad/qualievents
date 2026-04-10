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

export function buildBadgeEmail(name: string, eventTitle: string, badgeCode: string, qrDataUrl: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: #e94560; margin: 0; font-size: 28px;">QualiEvents</h1>
        <p style="color: #ffffff; margin-top: 10px;">Your Badge is Ready!</p>
      </div>
      <div style="background: #ffffff; padding: 30px; border: 1px solid #eee; border-radius: 0 0 12px 12px; text-align: center;">
        <h2 style="color: #1a1a2e;">Hello ${name},</h2>
        <p style="color: #333;">Your badge for <strong>${eventTitle}</strong> is ready.</p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #666; margin: 0 0 5px;">Your Badge Code:</p>
          <p style="font-size: 32px; font-weight: bold; color: #e94560; letter-spacing: 4px; margin: 0;">${badgeCode}</p>
        </div>
        <img src="${qrDataUrl}" alt="QR Code" style="width: 200px; height: 200px;" />
        <p style="color: #666; font-size: 14px;">Present this QR code or badge code at the event entrance.</p>
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
