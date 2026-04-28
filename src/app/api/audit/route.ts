import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, passThrough } from "@/lib/requireRole";

export async function GET(req: NextRequest) {
  try {
    requireAdmin(req);
  } catch (e) {
    return passThrough(e);
  }
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get("limit") || "100", 10) || 100, 500);
  const action = req.nextUrl.searchParams.get("action");
  const actor = req.nextUrl.searchParams.get("actor");
  const rows = await prisma.auditLog.findMany({
    where: {
      ...(action ? { action: { contains: action } } : {}),
      ...(actor ? { OR: [{ actorEmail: { contains: actor } }, { actorId: actor }] } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return NextResponse.json(rows);
}
