import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateBadgeCode, generateQRDataURL } from "@/lib/qrcode";

// POST: Import subscribers from CSV text
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { eventId, csv } = body;

  if (!eventId || !csv) {
    return NextResponse.json({ error: "eventId et csv requis" }, { status: 400 });
  }

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) return NextResponse.json({ error: "Événement introuvable" }, { status: 404 });

  const lines = csv.trim().split("\n").filter(Boolean);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let cur = "";
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') {
        if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
        else { inQ = !inQ; }
      } else if (line[i] === ',' && !inQ) {
        result.push(cur.trim());
        cur = "";
      } else {
        cur += line[i];
      }
    }
    result.push(cur.trim());
    return result;
  }

  for (const line of lines) {
    const parts = parseCSVLine(line);
    if (parts.length < 3) {
      errors.push(`Ligne invalide: ${line.slice(0, 50)}`);
      continue;
    }

    const [firstName, lastName, email, phone, company, jobTitle] = parts;

    if (!firstName || !lastName || !email) {
      errors.push(`Champs manquants: ${line.slice(0, 50)}`);
      continue;
    }

    // Check duplicate
    const existing = await prisma.subscriber.findFirst({
      where: { email, eventId },
    });
    if (existing) {
      skipped++;
      continue;
    }

    const subscriber = await prisma.subscriber.create({
      data: {
        firstName,
        lastName,
        email,
        phone: phone || null,
        company: company || null,
        jobTitle: jobTitle || null,
        status: "confirmed",
        eventId,
      },
    });

    // Generate badge
    const badgeCode = generateBadgeCode();
    const qrContent = `${appUrl}/api/scan?code=${badgeCode}`;
    const qrData = await generateQRDataURL(qrContent);
    const badgeNumber = await prisma.badge.count({ where: { eventId } }) + 1;

    await prisma.badge.create({
      data: { code: badgeCode, badgeNumber, qrData, subscriberId: subscriber.id, eventId },
    });

    imported++;
  }

  return NextResponse.json({
    imported,
    skipped,
    errors: errors.length > 0 ? errors : undefined,
    total: lines.length,
  });
}
