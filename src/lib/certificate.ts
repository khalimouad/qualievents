import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import crypto from "crypto";

export type CertificationType = "PARTICIPATION" | "CERTIFIED";

export interface CertificateData {
  /** Public verification code printed on the PDF + encoded in the QR. */
  verificationCode: string;
  type: CertificationType;
  attendeeName: string;
  eventTitle: string;
  eventTagline?: string | null;
  eventDate: Date;
  eventEndDate?: Date | null;
  eventVenue?: string | null;
  eventCity?: string | null;
  eventCountry?: string | null;
  eventFormat?: "IN_PERSON" | "ONLINE" | "HYBRID";
  themeColor?: string | null;
  organizationName: string;
  /** Public URL where the verification page lives, e.g. https://app.com/verify/ABC123. */
  verifyUrl: string;
  /** Optional: only for type=CERTIFIED. */
  examPassed?: boolean | null;
  issuedAt: Date;
}

/** Cryptographically-strong, human-friendly verification code. */
export function generateVerificationCode(): string {
  // 12 alphanumeric chars (~71 bits of entropy) — readable, unguessable.
  const alphabet = "ABCDEFGHIJKLMNPQRSTUVWXYZ23456789"; // skip ambiguous 0/O/1/I
  const bytes = crypto.randomBytes(12);
  let out = "";
  for (let i = 0; i < 12; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;
// Landscape orientation — diplomas are wider than tall.
const PAGE_W = A4_HEIGHT;
const PAGE_H = A4_WIDTH;

function toPosixDate(d: Date): string {
  return d.toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

/**
 * Render the certificate PDF as a Buffer. PDFKit + QRCode are both fully
 * server-side; works on any Node runtime.
 */
export async function renderCertificatePdf(data: CertificateData): Promise<Buffer> {
  const qrDataUrl = await QRCode.toDataURL(data.verifyUrl, {
    width: 256,
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#1a120b", light: "#ffffff" },
  });
  const qrBuffer = Buffer.from(qrDataUrl.split(",")[1], "base64");

  return new Promise<Buffer>((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        layout: "landscape",
        margins: { top: 40, bottom: 40, left: 40, right: 40 },
        info: {
          Title: `Certificat — ${data.attendeeName}`,
          Author: data.organizationName,
          Subject: data.eventTitle,
          Keywords: `certificate,attestation,${data.eventTitle}`,
        },
      });

      const chunks: Buffer[] = [];
      doc.on("data", (c) => chunks.push(c as Buffer));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const themeColor = data.themeColor || "#FF7A00";
      const inkSecondary = "#4a3a2c";
      const inkPrimary = "#1a120b";

      // ---- Decorative double border ----
      doc.rect(20, 20, PAGE_W - 40, PAGE_H - 40)
        .lineWidth(1.5)
        .strokeColor(themeColor)
        .stroke();
      doc.rect(28, 28, PAGE_W - 56, PAGE_H - 56)
        .lineWidth(0.5)
        .strokeColor(themeColor)
        .stroke();

      // ---- Top-left organisation name ----
      doc.font("Helvetica-Bold")
        .fontSize(11)
        .fillColor(inkSecondary)
        .text(data.organizationName.toUpperCase(), 60, 50, { characterSpacing: 1.5 });

      // ---- Top-right verification code ----
      doc.font("Helvetica")
        .fontSize(8)
        .fillColor(inkSecondary)
        .text("Code de vérification", PAGE_W - 240, 50, { width: 180, align: "right", characterSpacing: 0.5 });
      doc.font("Helvetica-Bold")
        .fontSize(11)
        .fillColor(inkPrimary)
        .text(data.verificationCode, PAGE_W - 240, 64, { width: 180, align: "right", characterSpacing: 1.5 });

      // ---- Title ----
      const titleY = 130;
      const isCertified = data.type === "CERTIFIED";
      doc.font("Helvetica")
        .fontSize(13)
        .fillColor(themeColor)
        .text(isCertified ? "CERTIFICATION" : "ATTESTATION", 0, titleY, { width: PAGE_W, align: "center", characterSpacing: 8 });

      doc.font("Helvetica-Bold")
        .fontSize(36)
        .fillColor(inkPrimary)
        .text(isCertified ? "Certification de réussite" : "Attestation de participation", 0, titleY + 22, { width: PAGE_W, align: "center" });

      // ---- Body ----
      doc.font("Helvetica")
        .fontSize(13)
        .fillColor(inkSecondary)
        .text(isCertified ? "Le présent certificat atteste que" : "Le présent document atteste que", 0, titleY + 86, { width: PAGE_W, align: "center" });

      // Attendee name in big letters
      doc.font("Helvetica-Bold")
        .fontSize(30)
        .fillColor(themeColor)
        .text(data.attendeeName, 0, titleY + 112, { width: PAGE_W, align: "center" });

      // Underline under the name
      const nameWidth = Math.min(doc.widthOfString(data.attendeeName) + 60, PAGE_W - 200);
      doc.moveTo((PAGE_W - nameWidth) / 2, titleY + 152)
        .lineTo((PAGE_W + nameWidth) / 2, titleY + 152)
        .lineWidth(1)
        .strokeColor(themeColor)
        .stroke();

      // Event description sentence
      doc.font("Helvetica")
        .fontSize(13)
        .fillColor(inkSecondary)
        .text(
          isCertified
            ? "a satisfait aux exigences du programme de certification :"
            : "a participé au programme :",
          0,
          titleY + 168,
          { width: PAGE_W, align: "center" }
        );

      doc.font("Helvetica-Bold")
        .fontSize(20)
        .fillColor(inkPrimary)
        .text(data.eventTitle, 60, titleY + 196, { width: PAGE_W - 120, align: "center" });

      if (data.eventTagline) {
        doc.font("Helvetica-Oblique")
          .fontSize(11)
          .fillColor(inkSecondary)
          .text(data.eventTagline, 80, titleY + 224, { width: PAGE_W - 160, align: "center" });
      }

      // Date + venue line
      const dateLine = data.eventEndDate
        ? `du ${toPosixDate(data.eventDate)} au ${toPosixDate(data.eventEndDate)}`
        : `le ${toPosixDate(data.eventDate)}`;
      const venueLine =
        data.eventFormat === "ONLINE"
          ? "Événement en ligne (visioconférence)"
          : [data.eventVenue, data.eventCity, data.eventCountry].filter(Boolean).join(", ");

      doc.font("Helvetica")
        .fontSize(11)
        .fillColor(inkSecondary)
        .text(dateLine, 0, titleY + 254, { width: PAGE_W, align: "center" });

      if (venueLine) {
        doc.text(venueLine, 0, titleY + 270, { width: PAGE_W, align: "center" });
      }

      // ---- Bottom row: signature + QR ----
      const footerY = PAGE_H - 130;

      // Left: organization stamp / signature line
      doc.moveTo(80, footerY).lineTo(280, footerY).lineWidth(0.7).strokeColor(inkSecondary).stroke();
      doc.font("Helvetica")
        .fontSize(9)
        .fillColor(inkSecondary)
        .text(`Délivré le ${data.issuedAt.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}`, 80, footerY + 6, { width: 200 });
      doc.font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(inkPrimary)
        .text(data.organizationName, 80, footerY + 22, { width: 200 });

      // Right: QR code + verify URL
      doc.image(qrBuffer, PAGE_W - 160, footerY - 60, { width: 80, height: 80 });
      doc.font("Helvetica")
        .fontSize(8)
        .fillColor(inkSecondary)
        .text(
          `Vérifier l'authenticité :\n${data.verifyUrl}`,
          PAGE_W - 380,
          footerY - 30,
          { width: 200, align: "right" }
        );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
