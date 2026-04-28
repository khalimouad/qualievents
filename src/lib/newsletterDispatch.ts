import { prisma } from "./prisma";
import { sendEmail, buildNewsletterEmail } from "./email";
import {
  applyVariables,
  applyVariablesToDoc,
  parseContent,
  renderToHtml,
  type SubstitutionContext,
} from "./newsletter";
import { unsubscribeUrl } from "./unsubscribe";

/** How many recipients each /process tick handles. Tune so each tick fits the
 * Vercel function maxDuration with margin. ~25 sends ≈ 5–10s on Gmail SMTP. */
export const CHUNK_SIZE = 25;

/** Stalled-job recovery threshold. */
export const STALL_MS = 5 * 60 * 1000;

interface ProcessResult {
  jobId: string;
  status: "pending" | "running" | "completed" | "failed";
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  cursor: number;
  done: boolean;
  errorMessage?: string;
}

/**
 * Process the next CHUNK_SIZE recipients for a job. Idempotent: re-running on
 * an already-completed job is a no-op. Concurrency: relies on the application
 * being single-tenant in practice; if you need stricter isolation, add a row
 * SELECT FOR UPDATE here.
 */
export async function tickNewsletterJob(jobId: string, baseUrl: string): Promise<ProcessResult> {
  const job = await prisma.newsletterJob.findUnique({
    where: { id: jobId },
    include: {
      newsletter: {
        include: {
          event: {
            select: {
              id: true,
              title: true,
              date: true,
              venue: true,
              city: true,
              slug: true,
              themeColor: true,
              streamUrl: true,
              recordingUrl: true,
              platform: true,
            },
          },
        },
      },
    },
  });
  if (!job) throw new Error("Job introuvable");
  if (job.status === "completed" || job.status === "failed") {
    return {
      jobId: job.id,
      status: job.status,
      totalRecipients: job.totalRecipients,
      sentCount: job.sentCount,
      failedCount: job.failedCount,
      cursor: job.cursor,
      done: true,
      errorMessage: job.errorMessage ?? undefined,
    };
  }

  const event = job.newsletter.event;
  // Pull a stable, ordered window of recipients matching the original criteria.
  const subscribers = await prisma.subscriber.findMany({
    where: { eventId: event.id, status: "confirmed", unsubscribed: false },
    orderBy: { createdAt: "asc" },
    skip: job.cursor,
    take: CHUNK_SIZE,
    include: { badge: { select: { code: true } } },
  });

  if (subscribers.length === 0) {
    // Nothing left → mark complete.
    const completed = await prisma.newsletterJob.update({
      where: { id: jobId },
      data: { status: "completed", completedAt: new Date(), lastTickAt: new Date() },
    });
    return {
      jobId: completed.id,
      status: "completed",
      totalRecipients: completed.totalRecipients,
      sentCount: completed.sentCount,
      failedCount: completed.failedCount,
      cursor: completed.cursor,
      done: true,
    };
  }

  // Mark running on the first tick
  if (job.status === "pending") {
    await prisma.newsletterJob.update({
      where: { id: jobId },
      data: { status: "running", startedAt: job.startedAt ?? new Date() },
    });
  }

  const eventDate = event.date.toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const doc = parseContent(job.newsletter.content);

  let sent = 0;
  let failed = 0;
  for (const sub of subscribers) {
    const ctx: SubstitutionContext = {
      firstName: sub.firstName,
      lastName: sub.lastName,
      email: sub.email,
      company: sub.company,
      jobTitle: sub.jobTitle,
      eventTitle: event.title,
      eventDate,
      eventVenue: event.venue,
      eventCity: event.city,
      eventSlug: event.slug,
      baseUrl,
      badgeCode: sub.badge?.code ?? null,
      streamUrl: event.streamUrl,
      recordingUrl: event.recordingUrl,
      platform: event.platform,
    };
    const personalizedSubject = applyVariables(job.newsletter.subject, ctx);
    const personalizedUnsubscribe = unsubscribeUrl(baseUrl, sub.id);
    const footerHtml = `<div style="margin:24px auto 0;padding:16px;text-align:center;font-family:Arial,sans-serif;font-size:11px;color:#888;max-width:600px;">
      Vous recevez cet email car vous êtes inscrit·e à <strong>${event.title}</strong>.
      <a href="${personalizedUnsubscribe}" style="color:#888;text-decoration:underline;">Se désinscrire</a>.
    </div>`;
    const baseHtml = doc
      ? renderToHtml(applyVariablesToDoc(doc, ctx), { eventTitle: event.title, themeColor: event.themeColor || undefined })
      : buildNewsletterEmail(applyVariables(job.newsletter.content, ctx));
    const html = baseHtml.replace(/<\/body>/i, `${footerHtml}</body>`);

    const result = await sendEmail({
      to: sub.email,
      subject: personalizedSubject,
      html,
      unsubscribeUrl: personalizedUnsubscribe,
    });
    if (result.success) sent++; else failed++;
  }

  // Persist progress
  const newCursor = job.cursor + subscribers.length;
  const isLast = newCursor >= job.totalRecipients;
  const updated = await prisma.newsletterJob.update({
    where: { id: jobId },
    data: {
      cursor: newCursor,
      sentCount: { increment: sent },
      failedCount: { increment: failed },
      lastTickAt: new Date(),
      status: isLast ? "completed" : "running",
      completedAt: isLast ? new Date() : null,
    },
  });

  if (isLast) {
    await prisma.newsletter.update({
      where: { id: job.newsletterId },
      data: { status: "sent", sentAt: updated.completedAt ?? new Date() },
    });
  }

  return {
    jobId: updated.id,
    status: updated.status as ProcessResult["status"],
    totalRecipients: updated.totalRecipients,
    sentCount: updated.sentCount,
    failedCount: updated.failedCount,
    cursor: updated.cursor,
    done: isLast,
  };
}

/**
 * Trigger one or more job ticks asynchronously by self-fetching the process
 * endpoint without awaiting. Used right after creating a job and after a
 * successful tick to keep the dispatch moving even when the original request
 * has returned to the client. Vercel keeps the function alive for the
 * duration of the in-flight fetch.
 */
export function fireProcessTick(baseUrl: string, jobId: string): void {
  // Fire-and-forget. The endpoint is admin-protected, so we attach an
  // internal token derived from the SESSION_SECRET to authenticate.
  fetch(`${baseUrl}/api/newsletter-jobs/${jobId}/process`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-internal-token": process.env.SESSION_SECRET || "",
    },
  }).catch((err) => console.error("[newsletter-dispatch] tick fetch failed:", err));
}
