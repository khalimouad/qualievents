import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { requireAdmin, passThrough } from "@/lib/requireRole";
import { audit } from "@/lib/audit";

/**
 * POST /api/users/[id]/reset-password
 * Body (optional): { password?: string }   — when omitted, a strong password is generated.
 * Returns: { tempPassword: string }        — shown to the admin once.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireAdmin(req);
  } catch (e) {
    return passThrough(e);
  }
  const { id } = await params;

  const user = await prisma.adminUser.findUnique({ where: { id } });
  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  let body: { password?: string } = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const tempPassword =
    body.password && body.password.length >= 8
      ? body.password
      : crypto.randomBytes(12).toString("base64url").slice(0, 14);

  const passwordHash = await hashPassword(tempPassword);
  await prisma.adminUser.update({ where: { id }, data: { passwordHash } });
  audit(req, { action: "user.reset-password", resource: `User:${id}`, metadata: { email: user.email } });

  return NextResponse.json({ tempPassword });
}
