import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

async function activeAdminCount(): Promise<number> {
  return prisma.adminUser.count({ where: { role: "admin", active: true } });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireAdmin(req);
  } catch (e) {
    return passThrough(e);
  }
  const { id } = await params;
  const user = await prisma.adminUser.findUnique({ where: { id }, select: safeFields });
  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  return NextResponse.json(user);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let session;
  try {
    session = requireAdmin(req);
  } catch (e) {
    return passThrough(e);
  }
  const { id } = await params;
  const body = await req.json();
  const { name, role, active } = body || {};

  const existing = await prisma.adminUser.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  // Self-protection: cannot demote/disable yourself.
  if (existing.id === session.userId) {
    if (role !== undefined && role !== existing.role) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas modifier votre propre rôle" },
        { status: 400 }
      );
    }
    if (active !== undefined && active === false) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas désactiver votre propre compte" },
        { status: 400 }
      );
    }
  }

  // Last-admin guard.
  const willDemote = role !== undefined && existing.role === "admin" && role !== "admin";
  const willDisable = active === false && existing.active === true && existing.role === "admin";
  if (willDemote || willDisable) {
    if ((await activeAdminCount()) <= 1) {
      return NextResponse.json(
        { error: "Impossible — il doit rester au moins un administrateur actif" },
        { status: 400 }
      );
    }
  }

  if (role !== undefined && role !== "admin" && role !== "staff") {
    return NextResponse.json({ error: "Rôle invalide" }, { status: 400 });
  }

  const updated = await prisma.adminUser.update({
    where: { id },
    data: {
      name: typeof name === "string" ? name : existing.name,
      role: role === "admin" || role === "staff" ? role : existing.role,
      active: typeof active === "boolean" ? active : existing.active,
    },
    select: safeFields,
  });
  audit(req, {
    action: "user.update",
    resource: `User:${id}`,
    metadata: {
      changes: {
        ...(name !== undefined && name !== existing.name ? { name: { from: existing.name, to: name } } : {}),
        ...(role !== undefined && role !== existing.role ? { role: { from: existing.role, to: role } } : {}),
        ...(active !== undefined && active !== existing.active ? { active: { from: existing.active, to: active } } : {}),
      },
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let session;
  try {
    session = requireAdmin(req);
  } catch (e) {
    return passThrough(e);
  }
  const { id } = await params;
  const existing = await prisma.adminUser.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  if (existing.id === session.userId) {
    return NextResponse.json(
      { error: "Vous ne pouvez pas supprimer votre propre compte" },
      { status: 400 }
    );
  }
  if (existing.role === "admin" && existing.active && (await activeAdminCount()) <= 1) {
    return NextResponse.json(
      { error: "Impossible — il doit rester au moins un administrateur actif" },
      { status: 400 }
    );
  }

  await prisma.adminUser.delete({ where: { id } });
  audit(req, { action: "user.delete", resource: `User:${id}`, metadata: { email: existing.email } });
  return NextResponse.json({ success: true });
}
