import PDFDocument from "pdfkit";

export interface InvoiceLine {
  label: string;
  unitPrice: number; // minor units
  quantity: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  reference: string;
  issuedAt: Date;
  currency: string;
  // Issuer (your organisation)
  organizationName: string;
  organizationAddress?: string | null;
  organizationVat?: string | null;
  organizationEmail?: string | null;
  // Buyer
  payerName: string;
  payerEmail: string;
  payerPhone?: string | null;
  companyName?: string | null;
  vatNumber?: string | null;
  billingAddress?: string | null;
  // Subject
  eventTitle: string;
  eventDate: Date;
  eventLocation?: string | null;
  // Line items
  lines: InvoiceLine[];
  notes?: string | null;
  themeColor?: string | null;
}

const fmt = (cents: number, currency: string) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(cents);

export async function renderInvoicePdf(data: InvoiceData): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margins: { top: 48, bottom: 48, left: 48, right: 48 },
        info: {
          Title: `Facture ${data.invoiceNumber}`,
          Author: data.organizationName,
          Subject: `Facture pour ${data.eventTitle}`,
        },
      });

      const chunks: Buffer[] = [];
      doc.on("data", (c) => chunks.push(c as Buffer));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const themeColor = data.themeColor || "#FF7A00";
      const ink = "#1a120b";
      const inkSoft = "#4a3a2c";
      const inkMuted = "#8a7560";

      // ---- Header band ----
      doc.rect(0, 0, doc.page.width, 6).fill(themeColor);

      // ---- Issuer ----
      doc.fillColor(ink).font("Helvetica-Bold").fontSize(20).text(data.organizationName, 48, 36);
      if (data.organizationAddress) {
        doc.fillColor(inkSoft).font("Helvetica").fontSize(9).text(data.organizationAddress, 48, 60, { width: 220 });
      }
      const issuerExtras: string[] = [];
      if (data.organizationVat) issuerExtras.push(`TVA : ${data.organizationVat}`);
      if (data.organizationEmail) issuerExtras.push(data.organizationEmail);
      if (issuerExtras.length) {
        doc.text(issuerExtras.join(" · "), 48, doc.y, { width: 220 });
      }

      // ---- Title ----
      doc.fillColor(themeColor).font("Helvetica-Bold").fontSize(28).text("FACTURE", 320, 36, { width: 230, align: "right" });
      doc.fillColor(inkMuted).font("Helvetica").fontSize(9).text(`N° ${data.invoiceNumber}`, 320, 70, { width: 230, align: "right" });
      doc.text(`Référence : ${data.reference}`, 320, 84, { width: 230, align: "right" });
      doc.text(`Date : ${data.issuedAt.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`, 320, 98, { width: 230, align: "right" });

      // ---- Buyer block ----
      let y = 150;
      doc.fillColor(inkMuted).font("Helvetica-Bold").fontSize(8).text("FACTURÉ À", 48, y, { characterSpacing: 1.5 });
      y += 14;
      doc.fillColor(ink).font("Helvetica-Bold").fontSize(12).text(data.companyName || data.payerName, 48, y);
      y += 16;
      doc.fillColor(inkSoft).font("Helvetica").fontSize(10);
      if (data.companyName) {
        doc.text(`À l'attention de ${data.payerName}`, 48, y);
        y += 13;
      }
      if (data.billingAddress) {
        doc.text(data.billingAddress, 48, y, { width: 240 });
        y = doc.y;
      }
      if (data.vatNumber) {
        doc.text(`TVA : ${data.vatNumber}`, 48, y);
        y += 13;
      }
      doc.text(data.payerEmail, 48, y);
      if (data.payerPhone) {
        y += 13;
        doc.text(data.payerPhone, 48, y);
      }

      // ---- Subject (event) ----
      let yEvent = 150;
      doc.fillColor(inkMuted).font("Helvetica-Bold").fontSize(8).text("OBJET", 320, yEvent, { width: 230, align: "right", characterSpacing: 1.5 });
      yEvent += 14;
      doc.fillColor(ink).font("Helvetica-Bold").fontSize(12).text(data.eventTitle, 320, yEvent, { width: 230, align: "right" });
      yEvent = doc.y + 4;
      doc.fillColor(inkSoft).font("Helvetica").fontSize(10);
      doc.text(data.eventDate.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }), 320, yEvent, { width: 230, align: "right" });
      if (data.eventLocation) {
        yEvent = doc.y;
        doc.text(data.eventLocation, 320, yEvent, { width: 230, align: "right" });
      }

      // ---- Line items table ----
      const tableTop = Math.max(y, doc.y) + 40;
      const colX = { label: 48, qty: 360, unit: 410, total: 490 };

      doc.fillColor(themeColor).rect(48, tableTop, doc.page.width - 96, 26).fill();
      doc.fillColor("#fff").font("Helvetica-Bold").fontSize(9);
      doc.text("DÉSIGNATION", colX.label + 8, tableTop + 9, { characterSpacing: 1 });
      doc.text("QTÉ", colX.qty, tableTop + 9, { width: 40, align: "right" });
      doc.text("PU", colX.unit, tableTop + 9, { width: 70, align: "right" });
      doc.text("TOTAL", colX.total, tableTop + 9, { width: doc.page.width - 48 - colX.total, align: "right" });

      let lineY = tableTop + 32;
      let subtotal = 0;
      doc.font("Helvetica").fontSize(10).fillColor(ink);
      for (const line of data.lines) {
        const lineTotal = line.unitPrice * line.quantity;
        subtotal += lineTotal;
        doc.text(line.label, colX.label + 8, lineY, { width: colX.qty - colX.label - 16 });
        const labelHeight = doc.heightOfString(line.label, { width: colX.qty - colX.label - 16 });
        doc.text(String(line.quantity), colX.qty, lineY, { width: 40, align: "right" });
        doc.text(fmt(line.unitPrice, data.currency), colX.unit, lineY, { width: 70, align: "right" });
        doc.text(fmt(lineTotal, data.currency), colX.total, lineY, { width: doc.page.width - 48 - colX.total, align: "right" });
        lineY += Math.max(labelHeight, 14) + 8;
        // Light separator
        doc.moveTo(48, lineY - 4).lineTo(doc.page.width - 48, lineY - 4).strokeColor("#f2e5d5").lineWidth(0.5).stroke();
      }

      // ---- Total ----
      lineY += 12;
      doc.fillColor(inkSoft).font("Helvetica").fontSize(10).text("Total", colX.unit - 40, lineY, { width: 110, align: "right" });
      doc.fillColor(themeColor).font("Helvetica-Bold").fontSize(16).text(fmt(subtotal, data.currency), colX.total, lineY - 4, { width: doc.page.width - 48 - colX.total, align: "right" });

      lineY += 24;
      doc.fillColor(inkMuted).font("Helvetica-Oblique").fontSize(8).text("TVA non applicable, art. 293 B du CGI (à adapter selon votre régime).", 48, lineY, { width: doc.page.width - 96 });

      // ---- Notes ----
      if (data.notes) {
        lineY = Math.max(lineY + 24, doc.y + 24);
        doc.fillColor(inkMuted).font("Helvetica-Bold").fontSize(8).text("NOTES", 48, lineY, { characterSpacing: 1.5 });
        lineY += 14;
        doc.fillColor(inkSoft).font("Helvetica").fontSize(10).text(data.notes, 48, lineY, { width: doc.page.width - 96 });
      }

      // ---- Footer ----
      const footerY = doc.page.height - 48;
      doc.fillColor(inkMuted).font("Helvetica").fontSize(8)
        .text(
          `${data.organizationName} — Facture ${data.invoiceNumber} émise le ${data.issuedAt.toLocaleDateString("fr-FR")}`,
          48,
          footerY - 12,
          { width: doc.page.width - 96, align: "center" }
        );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Sequential, human-readable invoice number scoped by year.
 * Format: INV-YYYY-NNNNNN where NNNNNN is the count of invoices issued
 * this calendar year + 1.
 */
export function buildInvoiceNumber(yearCount: number, now = new Date()): string {
  const year = now.getFullYear();
  return `INV-${year}-${String(yearCount + 1).padStart(6, "0")}`;
}

/** Short, unguessable booking reference. e.g. QE-GB-K3F8H7. */
export function generateBookingReference(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `QE-GB-${s}`;
}
