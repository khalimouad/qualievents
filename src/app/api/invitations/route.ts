import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, buildInvitationEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
  const eventId = req.nextUrl.searchParams.get("eventId");
  const invitations = await prisma.invitation.findMany({
    where: eventId ? { eventId } : undefined,
    include: { event: { select: { title: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(invitations);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.eventId || !body.invitations || !Array.isArray(body.invitations)) {
    return NextResponse.json({ error: "Event ID and invitations array required" }, { status: 400 });
  }

  const event = await prisma.event.findUnique({ where: { id: body.eventId } });
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const results = [];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  for (const inv of body.invitations) {
    const invitation = await prisma.invitation.create({
      data: {
        email: inv.email,
        phone: inv.phone || null,
        name: inv.name,
        type: inv.type || "email",
        eventId: body.eventId,
      },
    });

    if (inv.type === "email" || inv.type === "both") {
      const eventDate = event.date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const html = buildInvitationEmail(inv.name, event.title, eventDate, `${appUrl}/register`);
      const result = await sendEmail({ to: inv.email, subject: `You're invited to ${event.title}!`, html });

      await prisma.invitation.update({
        where: { id: invitation.id },
        data: {
          status: result.success ? "sent" : "failed",
          sentAt: result.success ? new Date() : null,
        },
      });

      results.push({ ...invitation, emailSent: result.success });
    } else {
      results.push({ ...invitation, emailSent: false, note: "SMS sending requires Twilio configuration" });
    }
  }

  return NextResponse.json({ sent: results.length, results }, { status: 201 });
}
