import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, buildNewsletterEmail } from "@/lib/email";
import { applyVariables, applyVariablesToDoc, parseContent, renderToHtml, type SubstitutionContext } from "@/lib/newsletter";

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
      content: body.content, // JSON-stringified NewsletterDoc, or legacy raw HTML
      eventId: body.eventId,
      status: body.send ? "sent" : "draft",
      sentAt: body.send ? new Date() : null,
    },
  });

  if (!body.send) {
    return NextResponse.json(newsletter, { status: 201 });
  }

  // ----- Send path: per-recipient variable substitution -----
  const event = await prisma.event.findUnique({
    where: { id: body.eventId },
    select: { title: true, date: true, venue: true, city: true, slug: true, themeColor: true },
  });
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const subscribers = await prisma.subscriber.findMany({
    where: { eventId: body.eventId, status: "confirmed" },
    include: { badge: { select: { code: true } } },
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
  const eventDate = event.date.toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const doc = parseContent(body.content);
  let sentCount = 0;

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
    };

    const personalizedSubject = applyVariables(body.subject, ctx);
    const html = doc
      ? renderToHtml(applyVariablesToDoc(doc, ctx), { eventTitle: event.title, themeColor: event.themeColor || undefined })
      : buildNewsletterEmail(applyVariables(body.content, ctx));

    const result = await sendEmail({ to: sub.email, subject: personalizedSubject, html });
    if (result.success) sentCount++;
  }

  return NextResponse.json(
    { ...newsletter, sentTo: sentCount, totalSubscribers: subscribers.length },
    { status: 201 }
  );
}
