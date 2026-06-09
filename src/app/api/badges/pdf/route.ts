import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import PDFDocument from "pdfkit";

// 4 in × 6 in @ 72 dpi
const W = 288;
const H = 432;
const STRIPE = 8;
const CX = STRIPE;
const CW = W - STRIPE;
const CENTER_X = CX + CW / 2;

const HDR_H = 110;
const FTR_H = 38;
const FTR_Y = H - FTR_H;

const LOGO_R = 30;
const LOGO_RING_R = 35;
const LOGO_CY = HDR_H;
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

  const isVip = badge.type === "VIP";
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

  // Standard: navy header, event themeColor accent
  // VIP: deep black header, gold accent
  const accent = isVip ? "#FFD700" : (badge.event.themeColor || "#E8C547");
  const headerBg = isVip ? "#0a0a0a" : "#0d1827";
  const bodyBg = isVip ? "#fffdf0" : "#ffffff";
  const stripeBg = isVip ? "#FFD700" : accent;

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

    // ── Left accent stripe ─────────────────────────────
    doc.rect(0, 0, STRIPE, H).fill(stripeBg);

    // ── Header ────────────────────────────────────────
    doc.rect(CX, 0, CW, HDR_H).fill(headerBg);

    // Accent line at bottom of header
    doc.rect(CX, HDR_H - 3, CW, 3).fill(accent);

    if (isVip) {
      // VIP pill in header top-right
      doc.roundedRect(CX + CW - 48, 10, 38, 14, 7).fill("#FFD700");
      doc.fillColor("#000000", 1).font("Helvetica-Bold").fontSize(7)
        .text("V I P", CX + CW - 48, 14, { width: 38, align: "center", characterSpacing: 1.5 });

      // QUALIVOIRE CONNECT label (left-aligned to not overlap VIP pill)
      doc.fillColor("rgba(255,215,0,0.4)", 1).font("Helvetica").fontSize(7)
        .text("QUALIVOIRE CONNECT", CX + 10, 14, { width: CW - 60, align: "left", characterSpacing: 3 });
    } else {
      // QUALIVOIRE CONNECT label centred
      doc.fillColor("rgba(255,255,255,0.3)", 1).font("Helvetica").fontSize(7)
        .text("QUALIVOIRE CONNECT", CX, 14, { width: CW, align: "center", characterSpacing: 3 });
    }

    // Event title
    doc.fillColor("white", 1).font("Helvetica-Bold").fontSize(11)
      .text(badge.event.title, CX + 12, 32, { width: CW - 24, align: "center" });

    // Date · City
    const dateColor = isVip ? "rgba(255,215,0,0.55)" : "rgba(255,255,255,0.45)";
    doc.fillColor(dateColor, 1).font("Helvetica").fontSize(8)
      .text(`${eventDate}  ·  ${badge.event.city}`, CX + 12, 62, { width: CW - 24, align: "center" });

    // ── Body ──────────────────────────────────────────
    doc.rect(CX, HDR_H, CW, FTR_Y - HDR_H).fill(bodyBg);

    // VIP: subtle gold diagonal watermark lines
    if (isVip) {
      doc.save();
      doc.rect(CX, HDR_H, CW, FTR_Y - HDR_H).clip();
      doc.lineWidth(0.4).strokeColor("rgba(255,215,0,0.08)");
      for (let i = -H; i < W + H; i += 22) {
        doc.moveTo(CX + i, HDR_H).lineTo(CX + i + H, FTR_Y).stroke();
      }
      doc.restore();
    }

    // Logo ring
    const ringColor = isVip ? "#FFD700" : "#ffffff";
    doc.circle(LOGO_CX, LOGO_CY, LOGO_RING_R).fill(ringColor);

    if (logoBuffer) {
      doc.save();
      doc.circle(LOGO_CX, LOGO_CY, LOGO_R).clip();
      doc.image(logoBuffer, LOGO_CX - LOGO_R, LOGO_CY - LOGO_R, { width: LOGO_R * 2, height: LOGO_R * 2 });
      doc.restore();
    } else {
      doc.circle(LOGO_CX, LOGO_CY, LOGO_R).fill(headerBg);
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
    const qrSize = 114;
    const qrX = CX + (CW - qrSize) / 2;
    const qrY = badgeNumY + 16;
    const cardPad = 9;
    const cardBg = isVip ? "#fffae6" : "#f8fafc";
    const cardBorder = isVip ? "#FFD700" : undefined;
    if (cardBorder) {
      doc.roundedRect(qrX - cardPad, qrY - cardPad, qrSize + cardPad * 2, qrSize + cardPad * 2, 8)
        .lineWidth(1).fillAndStroke(cardBg, cardBorder);
    } else {
      doc.roundedRect(qrX - cardPad, qrY - cardPad, qrSize + cardPad * 2, qrSize + cardPad * 2, 8).fill(cardBg);
    }
    doc.image(qrBuffer, qrX, qrY, { width: qrSize, height: qrSize });

    // Scan label
    const scanLabelY = qrY + qrSize + cardPad + 5;
    const scanColor = isVip ? "#b8860b" : "#94a3b8";
    doc.fillColor(scanColor, 1).font("Helvetica").fontSize(6.5)
      .text("SCANNEZ À L'ENTRÉE", CX, scanLabelY, { width: CW, align: "center", characterSpacing: 1.5 });

    // Divider
    const dividerY = scanLabelY + 13;
    const dividerColor = isVip ? "#f0d060" : "#e2e8f0";
    doc.moveTo(CX + 20, dividerY).lineTo(CX + CW - 20, dividerY).lineWidth(0.5).strokeColor(dividerColor).stroke();

    // Name
    const nameY = dividerY + 11;
    const nameColor = isVip ? "#1a1200" : "#0f172a";
    doc.fillColor(nameColor, 1).font("Helvetica-Bold").fontSize(16)
      .text(fullName, CX + 8, nameY, { width: CW - 16, align: "center" });

    let textY = nameY + 22;

    if (badge.subscriber.jobTitle) {
      doc.fillColor(accent, 1).font("Helvetica-Bold").fontSize(9)
        .text(badge.subscriber.jobTitle, CX + 8, textY, { width: CW - 16, align: "center", characterSpacing: 0.3 });
      textY += 13;
    }

    if (badge.subscriber.company) {
      const companyColor = isVip ? "#8a6b00" : "#64748b";
      doc.fillColor(companyColor, 1).font("Helvetica").fontSize(9)
        .text(badge.subscriber.company, CX + 8, textY, { width: CW - 16, align: "center" });
    }

    // ── Footer ────────────────────────────────────────
    doc.rect(CX, FTR_Y, CW, FTR_H).fill(headerBg);

    // Gold top line on VIP footer
    if (isVip) {
      doc.rect(CX, FTR_Y, CW, 1.5).fill("#FFD700");
    }

    const codeColor = isVip ? "rgba(255,215,0,0.35)" : "rgba(255,255,255,0.25)";
    const brandColor = isVip ? "rgba(255,215,0,0.55)" : "rgba(255,255,255,0.3)";

    doc.fillColor(codeColor, 1).font("Helvetica").fontSize(7)
      .text(badge.code.slice(0, 16), CX + 10, FTR_Y + 14, { width: CW / 2 - 10, align: "left", characterSpacing: 0.5 });

    doc.fillColor(brandColor, 1).font("Helvetica-Bold").fontSize(7)
      .text("Qualivoire Connect", CX + CW / 2, FTR_Y + 14, { width: CW / 2 - 10, align: "right" });

    doc.end();
  });

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="badge-${code.toUpperCase()}.pdf"`,
    },
  });
}
