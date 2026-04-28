import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { requireAdmin, passThrough } from "@/lib/requireRole";
import { audit } from "@/lib/audit";

const safeFields = {
  id: true,
  email: true,
  name: true,
  role: true,
  active: true,
  lastLoginAt: true,
  createdAt: true,
} as const;

export async function GET(req: NextRequest) {
  try {
    requireAdmin(req);
  } catch (e) {
    return passThrough(e);
  }
  const users = await prisma.adminUser.findMany({
    select: safeFields,
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  try {
    requireAdmin(req);
  } catch (e) {
    return passThrough(e);
  }

  const body = await req.json();
  const { email, name, role, password } = body || {};

  if (!email || !name || !password) {
    return NextResponse.json({ error: "Email, nom et mot de passe sont requis" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Email invalide" }, { status: 400 });
  }
  if (typeof password !== "string" || password.length < 8) {
    return NextResponse.json(
      { error: "Le mot de passe doit faire au moins 8 caractères" },
      { status: 400 }
    );
  }
  if (role !== "admin" && role !== "staff") {
    return NextResponse.json({ error: "Rôle invalide" }, { status: 400 });
  }

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.adminUser.create({
    data: { email, name, role, passwordHash, active: true },
    select: safeFields,
  });
  audit(req, { action: "user.create", resource: `User:${user.id}`, metadata: { email: user.email, role: user.role } });

  return NextResponse.json(user, { status: 201 });
}
