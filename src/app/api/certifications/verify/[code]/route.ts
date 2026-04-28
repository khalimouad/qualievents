import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Public verification endpoint. Returns enough context to confirm a
 * certificate's authenticity but does NOT expose the holder's email or any
 * other PII beyond the name (which is already printed on the PDF).
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const cert = await prisma.certification.findUnique({
    where: { verificationCode: code.toUpperCase() },
    include: {
      subscriber: { select: { firstName: true, lastName: true } },
      event: { select: { title: true, date: true, endDate: true, city: true, country: true, format: true } },
    },
  });

  if (!cert) {
    return NextResponse.json({ valid: false, error: "Code introuvable" }, { status: 404 });
  }

  if (cert.revoked) {
    return NextResponse.json({ valid: false, revoked: true, error: "Ce certificat a été révoqué" }, { status: 200 });
  }

  return NextResponse.json({
    valid: true,
    type: cert.type,
    examPassed: cert.examPassed,
    issuedAt: cert.issuedAt,
    holderName: `${cert.subscriber.firstName} ${cert.subscriber.lastName}`.trim(),
    event: cert.event,
  });
}
