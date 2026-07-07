import { generateBadgePdf, type BadgePdfInput } from "@/lib/badgePdf";
import { BADGE_QR_CID, type EmailAttachment } from "@/lib/email";

/**
 * Builds the inline QR (cid) + PDF badge attachments for a confirmation
 * email. Returns an empty array for ONLINE events, which have no physical
 * badge to scan or print.
 */
export async function buildBadgeAttachments(
  format: "IN_PERSON" | "ONLINE" | "HYBRID",
  input: BadgePdfInput
): Promise<EmailAttachment[]> {
  if (format === "ONLINE") return [];

  const attachments: EmailAttachment[] = [
    {
      filename: "qrcode.png",
      content: Buffer.from(input.qrData.split(",")[1], "base64"),
      contentType: "image/png",
      cid: BADGE_QR_CID,
    },
  ];

  try {
    const pdf = await generateBadgePdf(input);
    attachments.push({
      filename: `badge-${input.code}.pdf`,
      content: pdf,
      contentType: "application/pdf",
    });
  } catch (error) {
    console.error("Badge PDF generation failed:", error);
  }

  return attachments;
}
