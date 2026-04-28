import { NextRequest, NextResponse } from "next/server";
import { tickNewsletterJob, fireProcessTick } from "@/lib/newsletterDispatch";
import { getSession } from "@/lib/requireRole";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Process the next chunk of a newsletter job. Auth: either an authenticated
 * admin/staff session OR a matching `x-internal-token` header (used by the
 * self-fetch loop to keep advancing without re-doing the cookie dance).
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const internalToken = req.headers.get("x-internal-token");
  const expected = process.env.SESSION_SECRET || "";
  const isInternal = !!expected && internalToken === expected;
  if (!isInternal) {
    const session = getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
  }

  const { id } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;

  try {
    const result = await tickNewsletterJob(id, baseUrl);
    // Schedule the next tick if there's more work to do.
    if (!result.done) fireProcessTick(baseUrl, id);
    return NextResponse.json(result);
  } catch (err) {
    logger.error("newsletter.dispatch", "tick failed", { error: err, jobId: id });
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Échec" },
      { status: 500 }
    );
  }
}
