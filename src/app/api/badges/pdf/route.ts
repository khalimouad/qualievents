import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import PDFDocument from "pdfkit";

// 4 in × 6 in @ 72 dpi
const W = 288;
const H = 432;
const STRIPE = 8;   // left accent stripe
const CX = STRIPE;  // content area x start
const CW = W - STRIPE; // content area width
const CENTER_X = CX + CW / 2;

const HDR_H = 100;
const FTR_H = 38;
const FTR_Y = H - FTR_H;

// Logo circle at header/body boundary
const LOGO_R = 30;
const LOGO_RING_R = 35;
const LOGO_CY = HDR_H; // center Y at the seam
const LOGO_CX = CENTER_X;

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.json({ error: "Code requis" }, { status: 400 });

  const badge = await prisma.badge.findUnique({
    where: { code: code.toUpperCase() },
    include: {
      subscriber: true,
      event: {
        select: { title: true, date: true, venue: true, city: true, themeColor: true, logoUrl: true },
      },
    },
  });

  if (!badge) return NextResponse.json({ error: "Badge introuvable" }, { status: 404 });

  const accent = badge.event.themeColor || "#E8C547";
  const eventDate = new Date(badge.event.date).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });

  const qrBuffer = Buffer.from(badge.qrData.split(",")[1], "base64");

  let logoBuffer: Buffer | null = null;
  if (badge.event.logoUrl) {
    try {
      const res = await fetch(badge.event.logoUrl);
      if (res.ok) logoBuffer = Buffer.from(await res.arrayBuffer());
    } catch { /* fall back to initials */ }
  }

  const fullName = `${badge.subscriber.firstName} ${badge.subscriber.lastName}`;
  const initials = badge.event.title.slice(0, 2).toUpperCase();

  const pdf = await new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({
      size: [W, H],
      margin: 0,
      info: { Title: `Badge — ${fullName}` },
    });
    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(c as Buffer));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // ── Left accent stripe ────────────────────────────
    doc.rect(0, 0, STRIPE, H).fill(accent);

    // ── Header (dark navy) ────────────────────────────
    doc.rect(CX, 0, CW, HDR_H).fill("#0d1827");

    // Accent line at bottom of header
    doc.rect(CX, HDR_H - 3, CW, 3).fill(accent);

    // QUALIEVENTS label
    doc.fillColor("rgba(255,255,255,0.3)", 1).font("Helvetica").fontSize(7)
      .text("QUALIEVENTS", CX, 14, { width: CW, align: "center", characterSpacing: 3 });

    // Event title
    doc.fillColor("white", 1).font("Helvetica-Bold").fontSize(12)
      .text(badge.event.title, CX + 12, 30, { width: CW - 24, align: "center" });

    // Date · City
    doc.fillColor("rgba(255,255,255,0.45)", 1).font("Helvetica").fontSize(8)
      .text(`${eventDate}  ·  ${badge.event.city}`, CX + 12, 60, { width: CW - 24, align: "center" });

    // ── Body (white) ──────────────────────────────────
    doc.rect(CX, HDR_H, CW, FTR_Y - HDR_H).fill("#ffffff");

    // Logo white ring
    doc.circle(LOGO_CX, LOGO_CY, LOGO_RING_R).fill("#ffffff");

    if (logoBuffer) {
      doc.save();
      doc.circle(LOGO_CX, LOGO_CY, LOGO_R).clip();
      doc.image(logoBuffer, LOGO_CX - LOGO_R, LOGO_CY - LOGO_R, { width: LOGO_R * 2, height: LOGO_R * 2 });
      doc.restore();
    } else {
      doc.circle(LOGO_CX, LOGO_CY, LOGO_R).fill("#0d1827");
      doc.fillColor(accent, 1).font("Helvetica-Bold").fontSize(17)
        .text(initials, LOGO_CX - LOGO_R, LOGO_CY - 10, { width: LOGO_R * 2, align: "center" });
    }

    // Badge number
    const badgeNumY = LOGO_CY + LOGO_RING_R + 8;
    doc.fillColor(accent, 1).font("Helvetica-Bold").fontSize(10)
      .text(`#${String(badge.badgeNumber).padStart(3, "0")}`, CX, badgeNumY, {
        width: CW, align: "center", characterSpacing: 2,
      });

    // QR code card
    const qrSize = 118;
    const qrX = CX + (CW - qrSize) / 2;
    const qrY = badgeNumY + 18;
    const cardPad = 9;
    doc.roundedRect(qrX - cardPad, qrY - cardPad, qrSize + cardPad * 2, qrSize + cardPad * 2, 8).fill("#f8fafc");
    doc.image(qrBuffer, qrX, qrY, { width: qrSize, height: qrSize });

    // "Scan at entry" micro-label
    const scanLabelY = qrY + qrSize + cardPad + 5;
    doc.fillColor("#94a3b8", 1).font("Helvetica").fontSize(6.5)
      .text("SCANNEZ À L'ENTRÉE", CX, scanLabelY, { width: CW, align: "center", characterSpacing: 1.5 });

    // Thin divider
    const dividerY = scanLabelY + 13;
    doc.moveTo(CX + 20, dividerY).lineTo(CX + CW - 20, dividerY).lineWidth(0.5).strokeColor("#e2e8f0").stroke();

    // Name
    const nameY = dividerY + 11;
    doc.fillColor("#0f172a", 1).font("Helvetica-Bold").fontSize(16)
      .text(fullName, CX + 8, nameY, { width: CW - 16, align: "center" });

    let textY = nameY + 22;

    if (badge.subscriber.jobTitle) {
      doc.fillColor(accent, 1).font("Helvetica-Bold").fontSize(9)
        .text(badge.subscriber.jobTitle, CX + 8, textY, { width: CW - 16, align: "center", characterSpacing: 0.3 });
      textY += 13;
    }

    if (badge.subscriber.company) {
      doc.fillColor("#64748b", 1).font("Helvetica").fontSize(9)
        .text(badge.subscriber.company, CX + 8, textY, { width: CW - 16, align: "center" });
    }

    // ── Footer (dark) ─────────────────────────────────
    doc.rect(CX, FTR_Y, CW, FTR_H).fill("#0d1827");

    // Badge code left, brand right
    doc.fillColor("rgba(255,255,255,0.25)", 1).font("Helvetica").fontSize(7)
      .text(badge.code.slice(0, 16), CX + 10, FTR_Y + 14, { width: CW / 2 - 10, align: "left", characterSpacing: 0.5 });

    doc.fillColor("rgba(255,255,255,0.3)", 1).font("Helvetica-Bold").fontSize(7)
      .text("QualiEvents", CX + CW / 2, FTR_Y + 14, { width: CW / 2 - 10, align: "right" });

    doc.end();
  });

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="badge-${code.toUpperCase()}.pdf"`,
    },
  });
}
