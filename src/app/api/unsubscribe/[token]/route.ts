import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUnsubscribeToken } from "@/lib/unsubscribe";

export const runtime = "nodejs";

/**
 * One-click unsubscribe — works on POST (RFC 8058 List-Unsubscribe-Post)
 * and GET (so the public page can call it from a button click).
 */
async function handle(token: string) {
  const id = verifyUnsubscribeToken(token);
  if (!id) return NextResponse.json({ ok: false, error: "Lien invalide" }, { status: 400 });
  const sub = await prisma.subscriber.findUnique({ where: { id }, select: { id: true, email: true, unsubscribed: true } });
  if (!sub) return NextResponse.json({ ok: false, error: "Inscription introuvable" }, { status: 404 });
  if (!sub.unsubscribed) {
    await prisma.subscriber.update({ where: { id }, data: { unsubscribed: true } });
  }
  return NextResponse.json({ ok: true, email: sub.email });
}

export async function POST(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return handle(token);
}

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return handle(token);
}
