import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fireProcessTick, STALL_MS } from "@/lib/newsletterDispatch";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * Cron-driven recovery for stalled newsletter dispatch jobs.
 *
 * Picks up:
 *   - status=pending jobs older than 30s (in case the initial fire-and-forget
 *     fetch was killed before reaching the process endpoint).
 *   - status=running jobs whose lastTickAt is older than STALL_MS (the worker
 *     died between ticks).
 *
 * Authentication: Vercel Cron sends Authorization: Bearer ${CRON_SECRET}
 * (when CRON_SECRET is configured). Admin sessions are also accepted so a
 * human can poke the endpoint if needed.
 */
export async function GET(req: NextRequest) {
  // Vercel cron auth — see https://vercel.com/docs/cron-jobs/manage-cron-jobs#how-to-secure-cron-jobs
  const cronSecret = process.env.CRON_SECRET || "";
  const authHeader = req.headers.get("authorization") || "";
  const isVercelCron = !!cronSecret && authHeader === `Bearer ${cronSecret}`;
  // Allow admin sessions for manual recovery
  if (!isVercelCron) {
    const { getSession } = await import("@/lib/requireRole");
    const session = getSession(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
  }

  const now = new Date();
  const stallCutoff = new Date(now.getTime() - STALL_MS);
  const pendingCutoff = new Date(now.getTime() - 30_000);

  const stuck = await prisma.newsletterJob.findMany({
    where: {
      OR: [
        { status: "pending", createdAt: { lt: pendingCutoff } },
        { status: "running", lastTickAt: { lt: stallCutoff } },
      ],
    },
    take: 20,
    orderBy: { createdAt: "asc" },
    select: { id: true, status: true },
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
  for (const job of stuck) fireProcessTick(baseUrl, job.id);

  return NextResponse.json({ recovered: stuck.length, jobs: stuck.map((j) => j.id) });
}
