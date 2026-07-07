import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateBadgePdf } from "@/lib/badgePdf";

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

  const pdf = await generateBadgePdf({
    code: badge.code,
    badgeNumber: badge.badgeNumber,
    type: badge.type,
    qrData: badge.qrData,
    subscriber: badge.subscriber,
    event: badge.event,
  });

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="badge-${code.toUpperCase()}.pdf"`,
    },
  });
}
