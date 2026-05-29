import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";

// 4 in × 6 in at 72 dpi
const W = 288;
const H = 432;
const HEADER_H = 96;
const FOOTER_H = 40;

function blendWithWhite(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const ro = Math.round(r * alpha + 255 * (1 - alpha));
  const go = Math.round(g * alpha + 255 * (1 - alpha));
  const bo = Math.round(b * alpha + 255 * (1 - alpha));
  return `#${ro.toString(16).padStart(2, "0")}${go.toString(16).padStart(2, "0")}${bo.toString(16).padStart(2, "0")}`;
}

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

  const themeColor = badge.event.themeColor || "#E8C547";
  const eventDate = new Date(badge.event.date).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });

  const qrDataUrl = await QRCode.toDataURL(badge.qrData, {
    width: 200, margin: 1, errorCorrectionLevel: "M",
    color: { dark: "#0f172a", light: "#ffffff" },
  });
  const qrBuffer = Buffer.from(qrDataUrl.split(",")[1], "base64");

  let logoBuffer: Buffer | null = null;
  if (badge.event.logoUrl) {
    try {
      const res = await fetch(badge.event.logoUrl);
      if (res.ok) logoBuffer = Buffer.from(await res.arrayBuffer());
    } catch { /* fall back to initials */ }
  }

  const pdf = await new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({
      size: [W, H],
      margin: 0,
      info: { Title: `Badge — ${badge.subscriber.firstName} ${badge.subscriber.lastName}` },
    });
    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(c as Buffer));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const bodyY = HEADER_H;
    const footerY = H - FOOTER_H;

    // ── Header (dark navy) ─────────────────────────────
    doc.rect(0, 0, W, HEADER_H).fill("#0f172a");
    doc.rect(0, HEADER_H - 3, W, 3).fill(themeColor);

    doc.fillColor("white", 0.45).font("Helvetica").fontSize(7)
      .text("QUALIEVENTS", 0, 16, { width: W, align: "center", characterSpacing: 2 });

    doc.fillColor("white", 1).font("Helvetica-Bold").fontSize(12)
      .text(badge.event.title, 20, 32, { width: W - 40, align: "center" });

    doc.fillColor("white", 0.55).font("Helvetica").fontSize(8)
      .text(`${eventDate} · ${badge.event.city}`, 20, 58, { width: W - 40, align: "center" });

    // ── Body (white) ───────────────────────────────────
    doc.fillColor("#ffffff", 1);
    doc.rect(0, bodyY, W, footerY - bodyY).fill("#ffffff");

    // Logo / initials (52×52 rounded, centered)
    const logoSize = 52;
    const logoX = (W - logoSize) / 2;
    const logoY = bodyY + 16;

    if (logoBuffer) {
      doc.save();
      doc.roundedRect(logoX, logoY, logoSize, logoSize, 10).clip();
      doc.image(logoBuffer, logoX, logoY, { width: logoSize, height: logoSize });
      doc.restore();
    } else {
      const bgColor = blendWithWhite(themeColor, 0.15);
      doc.roundedRect(logoX, logoY, logoSize, logoSize, 10).fill(bgColor);
      doc.fillColor(themeColor, 1).font("Helvetica-Bold").fontSize(20)
        .text(badge.event.title.slice(0, 2).toUpperCase(), logoX, logoY + (logoSize - 24) / 2, {
          width: logoSize, align: "center",
        });
    }

    // Badge number in theme color
    doc.fillColor(themeColor, 1).font("Helvetica-Bold").fontSize(11)
      .text(`#${String(badge.badgeNumber).padStart(3, "0")}`, 0, logoY + logoSize + 8, {
        width: W, align: "center", characterSpacing: 2,
      });

    // QR code with light card background
    const qrSize = 116;
    const qrX = (W - qrSize) / 2;
    const qrY = logoY + logoSize + 28;
    doc.roundedRect(qrX - 8, qrY - 8, qrSize + 16, qrSize + 16, 8).fill("#f8fafc");
    doc.image(qrBuffer, qrX, qrY, { width: qrSize, height: qrSize });

    // Name
    const nameY = qrY + qrSize + 18;
    doc.fillColor("#0f172a", 1).font("Helvetica-Bold").fontSize(16)
      .text(`${badge.subscriber.firstName} ${badge.subscriber.lastName}`, 20, nameY, {
        width: W - 40, align: "center",
      });

    let textY = nameY + 22;
    if (badge.subscriber.company) {
      doc.fillColor("#64748b", 1).font("Helvetica").fontSize(10)
        .text(badge.subscriber.company, 20, textY, { width: W - 40, align: "center" });
      textY += 15;
    }
    if (badge.subscriber.jobTitle) {
      doc.fillColor(themeColor, 1).font("Helvetica-Bold").fontSize(9)
        .text(badge.subscriber.jobTitle, 20, textY, { width: W - 40, align: "center" });
    }

    // ── Footer (dark) ──────────────────────────────────
    doc.rect(0, footerY, W, FOOTER_H).fill("#0f172a");
    doc.fillColor("white", 0.4).font("Helvetica").fontSize(8)
      .text("QualiEvents · Présentez ce badge à l'entrée", 0, footerY + 14, {
        width: W, align: "center",
      });

    doc.end();
  });

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="badge-${code.toUpperCase()}.pdf"`,
    },
  });
}
