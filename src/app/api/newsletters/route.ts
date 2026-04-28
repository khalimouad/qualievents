import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fireProcessTick } from "@/lib/newsletterDispatch";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const eventId = req.nextUrl.searchParams.get("eventId");
  const newsletters = await prisma.newsletter.findMany({
    where: eventId ? { eventId } : undefined,
    include: {
      event: { select: { title: true } },
      jobs: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(newsletters);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.subject || !body.content || !body.eventId) {
    return NextResponse.json({ error: "Subject, content, and event ID are required" }, { status: 400 });
  }

  const newsletter = await prisma.newsletter.create({
    data: {
      subject: body.subject,
      content: body.content, // JSON-stringified NewsletterDoc, or legacy raw HTML
      eventId: body.eventId,
      status: body.send ? "sending" : "draft",
      sentAt: null,
    },
  });

  if (!body.send) {
    return NextResponse.json(newsletter, { status: 201 });
  }

  // ----- Send path: create a NewsletterJob and kick off chunked processing.
  // The previous implementation looped through every subscriber inline, which
  // hit Vercel's serverless timeout past ~50 recipients. Now we count up
  // recipients, persist a job, and the /process endpoint walks through them
  // CHUNK_SIZE at a time. A self-fetch keeps the dispatch advancing once the
  // initial request returns; a Vercel cron picks up stalled jobs.
  const totalRecipients = await prisma.subscriber.count({
    where: { eventId: body.eventId, status: "confirmed", unsubscribed: false },
  });

  const job = await prisma.newsletterJob.create({
    data: {
      newsletterId: newsletter.id,
      totalRecipients,
      status: "pending",
    },
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
  if (totalRecipients > 0) {
    fireProcessTick(baseUrl, job.id);
  } else {
    // Nothing to send → mark complete immediately.
    await prisma.newsletterJob.update({
      where: { id: job.id },
      data: { status: "completed", completedAt: new Date() },
    });
    await prisma.newsletter.update({
      where: { id: newsletter.id },
      data: { status: "sent", sentAt: new Date() },
    });
  }

  return NextResponse.json(
    {
      ...newsletter,
      jobId: job.id,
      totalRecipients,
    },
    { status: 201 }
  );
}
