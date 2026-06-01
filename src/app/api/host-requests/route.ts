import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const rl = await rateLimit(req, { name: "host-requests", limit: 5, windowSec: 3600 });
  if (!rl.allowed) return rl.response!;

  const body = await req.json();

  if (!body.firstName || !body.lastName || !body.email || !body.organization) {
    return NextResponse.json(
      { error: "Prénom, nom, email et organisation sont requis" },
      { status: 400 }
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(body.email)) {
    return NextResponse.json({ error: "Email invalide" }, { status: 400 });
  }

  const request = await prisma.hostRequest.create({
    data: {
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      email: body.email.trim().toLowerCase(),
      phone: body.phone?.trim() || null,
      organization: body.organization.trim(),
      eventType: body.eventType?.trim() || null,
      message: body.message?.trim() || null,
    },
  });

  return NextResponse.json({ id: request.id }, { status: 201 });
}
