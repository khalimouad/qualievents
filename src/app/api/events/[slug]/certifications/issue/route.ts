import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { requireAuth, passThrough } from "@/lib/requireRole";
import { generateVerificationCode, renderCertificatePdf, type CertificationType } from "@/lib/certificate";
import { sendEmail } from "@/lib/email";
import { mediaUrl } from "@/lib/media";
import { audit } from "@/lib/audit";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const maxDuration = 60;

interface IssueBody {
  type?: CertificationType; // default: PARTICIPATION
  /** When provided, only issue/regenerate for these subscriber ids; otherwise issue for all confirmed. */
  subscriberIds?: string[];
  /** When true, also send an email with the PDF link to each recipient. */
  sendEmails?: boolean;
  /** When true, regenerate the PDF even if a certification row already exists. */
  regenerate?: boolean;
}

const fmtName = (s: { firstName: string; lastName: string }) => `${s.firstName} ${s.lastName}`.trim();

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    requireAuth(req);
  } catch (e) {
    return passThrough(e);
  }

  const { slug } = await params;
  const event = await prisma.event.findUnique({ where: { slug } });
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  const body: IssueBody = await req.json().catch(() => ({}));
  const type: CertificationType = body.type === "CERTIFIED" ? "CERTIFIED" : "PARTICIPATION";
  const sendEmails = body.sendEmails !== false; // default true
  const regenerate = body.regenerate === true;

  // Resolve target subscribers
  const subs = await prisma.subscriber.findMany({
    where: {
      eventId: event.id,
      status: "confirmed",
      ...(body.subscriberIds && body.subscriberIds.length > 0 ? { id: { in: body.subscriberIds } } : {}),
    },
    select: { id: true, firstName: true, lastName: true, email: true },
  });

  if (subs.length === 0) {
    return NextResponse.json(
      { issued: 0, skipped: 0, failed: 0, message: "Aucun inscrit confirmé à certifier." },
      { status: 200 }
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
  const orgName = process.env.ORG_NAME || "Qualivoire Connect";

  let issued = 0;
  let skipped = 0;
  let failed = 0;
  const errors: { subscriberId: string; error: string }[] = [];

  for (const s of subs) {
    try {
      const existing = await prisma.certification.findUnique({ where: { subscriberId: s.id } });
      if (existing && !regenerate) {
        skipped++;
        continue;
      }

      const verificationCode = existing?.verificationCode || generateVerificationCode();
      const verifyUrl = `${baseUrl}/verify/${verificationCode}`;

      const pdfBuffer = await renderCertificatePdf({
        verificationCode,
        type,
        attendeeName: fmtName(s),
        eventTitle: event.title,
        eventTagline: event.tagline,
        eventDate: event.date,
        eventEndDate: event.endDate,
        eventVenue: event.venue,
        eventCity: event.city,
        eventCountry: event.country,
        eventFormat: (event.format as "IN_PERSON" | "ONLINE" | "HYBRID") || "IN_PERSON",
        themeColor: event.themeColor,
        organizationName: orgName,
        verifyUrl,
        examPassed: type === "CERTIFIED" ? (existing?.examPassed ?? null) : null,
        issuedAt: new Date(),
      });

      // Uploaded to a private Vercel Blob store — served back out through
      // /api/media, which is publicly reachable. Authenticity is ensured by
      // the verification code printed on the document, not by store access.
      const filename = `certifications/${event.slug}/${verificationCode}.pdf`;
      await put(filename, pdfBuffer, {
        access: "private",
        contentType: "application/pdf",
        addRandomSuffix: false,
        allowOverwrite: true,
      });
      const pdfUrl = mediaUrl(filename);

      const issuedAt = new Date();
      const cert = await prisma.certification.upsert({
        where: { subscriberId: s.id },
        update: { type, pdfUrl, verificationCode, issuedAt, revoked: false },
        create: {
          eventId: event.id,
          subscriberId: s.id,
          type,
          pdfUrl,
          verificationCode,
          issuedAt,
        },
      });

      issued++;

      if (sendEmails && s.email) {
        const subject =
          type === "CERTIFIED"
            ? `Votre certification — ${event.title}`
            : `Votre attestation de participation — ${event.title}`;
        const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
        <body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <div style="background:linear-gradient(135deg,#ff7a00 0%,#e56500 100%);padding:30px;border-radius:12px 12px 0 0;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:24px;">${type === "CERTIFIED" ? "Certification délivrée" : "Attestation délivrée"}</h1>
          </div>
          <div style="background:#fff;padding:30px;border:1px solid #eee;border-radius:0 0 12px 12px;">
            <p>Bonjour ${s.firstName},</p>
            <p>Votre ${type === "CERTIFIED" ? "certification" : "attestation"} pour <strong>${event.title}</strong> est disponible.</p>
            <p style="text-align:center;margin:24px 0;">
              <a href="${cert.pdfUrl}" style="display:inline-block;padding:12px 24px;background:#ff7a00;color:#fff;text-decoration:none;border-radius:9999px;font-weight:600;">
                📄 Télécharger le PDF
              </a>
            </p>
            <p style="font-size:12px;color:#666;">
              Code de vérification :
              <code style="font-family:monospace;background:#f6f4f0;padding:2px 6px;border-radius:4px;">${cert.verificationCode}</code><br/>
              Vérifiez l'authenticité : <a href="${verifyUrl}">${verifyUrl}</a>
            </p>
          </div>
        </body></html>`;
        sendEmail({ to: s.email, subject, html }).catch((err) =>
          logger.error("certification", "delivery email failed", {
            error: err,
            subscriberId: s.id,
            email: s.email,
          })
        );
      }
    } catch (err) {
      failed++;
      errors.push({
        subscriberId: s.id,
        error: err instanceof Error ? err.message : String(err),
      });
      logger.error("certification", "generation failed", { error: err, subscriberId: s.id });
    }
  }

  audit(req, {
    action: "certification.issue",
    resource: `Event:${event.slug}`,
    metadata: { type, issued, skipped, failed, sendEmails, regenerate },
  });
  return NextResponse.json({ issued, skipped, failed, errors });
}
