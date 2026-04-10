import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, buildNewsletterEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
  const eventId = req.nextUrl.searchParams.get("eventId");
  const newsletters = await prisma.newsletter.findMany({
    where: eventId ? { eventId } : undefined,
    include: { event: { select: { title: true } } },
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
      content: body.content,
      eventId: body.eventId,
      status: body.send ? "sent" : "draft",
      sentAt: body.send ? new Date() : null,
    },
  });

  if (body.send) {
    const subscribers = await prisma.subscriber.findMany({
      where: { eventId: body.eventId, status: "confirmed" },
    });

    const html = buildNewsletterEmail(body.content);
    let sentCount = 0;

    for (const sub of subscribers) {
      const result = await sendEmail({ to: sub.email, subject: body.subject, html });
      if (result.success) sentCount++;
    }

    return NextResponse.json({ ...newsletter, sentTo: sentCount, totalSubscribers: subscribers.length }, { status: 201 });
  }

  return NextResponse.json(newsletter, { status: 201 });
}
