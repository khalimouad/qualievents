import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Generate a printable badge HTML (can be printed as PDF via browser)
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.json({ error: "Code requis" }, { status: 400 });

  const badge = await prisma.badge.findUnique({
    where: { code: code.toUpperCase() },
    include: {
      subscriber: true,
      event: { select: { title: true, date: true, venue: true, city: true, themeColor: true } },
    },
  });

  if (!badge) return NextResponse.json({ error: "Badge introuvable" }, { status: 404 });

  const themeColor = badge.event.themeColor || "#e94560";
  const eventDate = new Date(badge.event.date).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Badge - ${badge.subscriber.firstName} ${badge.subscriber.lastName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: 4in 6in; margin: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; width: 4in; height: 6in; display: flex; flex-direction: column; }
    .badge { width: 100%; height: 100%; border: 2px solid #e2e8f0; border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; }
    .header { background: linear-gradient(135deg, #0f172a, ${themeColor}); padding: 20px; text-align: center; color: white; }
    .header h1 { font-size: 14px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 4px; }
    .header p { font-size: 11px; opacity: 0.7; }
    .body { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; text-align: center; }
    .qr { width: 160px; height: 160px; margin-bottom: 16px; }
    .name { font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 4px; }
    .company { font-size: 13px; color: #64748b; margin-bottom: 2px; }
    .title { font-size: 12px; color: ${themeColor}; font-weight: 600; }
    .badge-num { font-size: 13px; font-weight: 800; color: ${themeColor}; font-family: monospace; letter-spacing: 0.05em; margin-bottom: 12px; }
    .code-box { background: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 10px; padding: 10px 20px; margin-top: 16px; }
    .code { font-size: 14px; font-weight: 700; letter-spacing: 0.1em; color: #64748b; font-family: monospace; }
    .code-label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.15em; color: #94a3b8; margin-bottom: 4px; }
    .footer { background: #f8fafc; padding: 12px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
    @media print { body { width: 4in; height: 6in; } .badge { border: none; } }
  </style>
</head>
<body>
  <div class="badge">
    <div class="header">
      <h1>${badge.event.title}</h1>
      <p>${eventDate} · ${badge.event.venue}, ${badge.event.city}</p>
    </div>
    <div class="body">
      <div class="badge-num">#${String(badge.badgeNumber).padStart(3, "0")}</div>
      <img src="${badge.qrData}" alt="QR" class="qr" />
      <div class="name">${badge.subscriber.firstName} ${badge.subscriber.lastName}</div>
      ${badge.subscriber.company ? `<div class="company">${badge.subscriber.company}</div>` : ""}
      ${badge.subscriber.jobTitle ? `<div class="title">${badge.subscriber.jobTitle}</div>` : ""}
      <div class="code-box">
        <div class="code-label">Code du badge</div>
        <div class="code">${badge.code}</div>
      </div>
    </div>
    <div class="footer">QualiEvents · Présentez ce badge à l'entrée</div>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
