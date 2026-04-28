import { NextRequest, NextResponse } from "next/server";

/**
 * Sliding-window rate limiting.
 *
 * Backed by Upstash Redis when UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
 * are set, otherwise falls back to a per-process in-memory map. The in-memory
 * fallback is best-effort on serverless (each Vercel function instance has its
 * own memory), but it still blocks bursty abuse from a single instance and
 * keeps local dev simple.
 */

interface UpstashIncrResponse {
  result: number;
}

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL || "";
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || "";
const upstashConfigured = !!(UPSTASH_URL && UPSTASH_TOKEN);

if (!upstashConfigured && process.env.NODE_ENV === "production") {
  console.warn(
    "[rate-limit] UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN not set — using in-memory fallback (per-instance, best effort)."
  );
}

// ---- In-memory fallback ----------------------------------------------------
const memBuckets = new Map<string, { count: number; resetAt: number }>();

function memCheck(key: string, limit: number, windowSec: number): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const cur = memBuckets.get(key);
  if (!cur || cur.resetAt <= now) {
    const resetAt = now + windowSec * 1000;
    memBuckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }
  cur.count += 1;
  return { allowed: cur.count <= limit, remaining: Math.max(0, limit - cur.count), resetAt: cur.resetAt };
}

// Garbage collect occasionally so the map doesn't grow forever.
let lastGc = Date.now();
function gcMem() {
  const now = Date.now();
  if (now - lastGc < 60_000) return;
  lastGc = now;
  for (const [k, v] of memBuckets) if (v.resetAt <= now) memBuckets.delete(k);
}

// ---- Upstash backend -------------------------------------------------------
async function upstashCheck(key: string, limit: number, windowSec: number): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  // INCR + EXPIRE in a single pipeline call. On Upstash REST, multiple commands
  // can be sent via the /pipeline endpoint as a JSON array of arrays.
  const res = await fetch(`${UPSTASH_URL}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      ["INCR", key],
      ["EXPIRE", key, String(windowSec), "NX"],
    ]),
  });
  if (!res.ok) {
    // Don't block traffic on Upstash hiccups — fail open with a console warning.
    console.warn("[rate-limit] Upstash error, falling back to in-memory:", res.status, await res.text().catch(() => ""));
    return memCheck(key, limit, windowSec);
  }
  const data = (await res.json()) as UpstashIncrResponse[];
  const count = data?.[0]?.result ?? 0;
  const resetAt = Date.now() + windowSec * 1000;
  return { allowed: count <= limit, remaining: Math.max(0, limit - count), resetAt };
}

// ---- Public helper ---------------------------------------------------------

export interface RateLimitOptions {
  /** Logical name for the rule (used in the cache key). */
  name: string;
  /** Maximum requests in the window. */
  limit: number;
  /** Window length in seconds. */
  windowSec: number;
  /** Optional extra discriminator, e.g. an email or event slug. */
  scope?: string;
}

/** Best-effort client IP extraction from common proxy headers. */
export function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return (
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-vercel-forwarded-for") ||
    "unknown"
  );
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  /** Pre-built 429 response when allowed=false. Use as `return result.response`. */
  response: NextResponse | null;
}

/**
 * Apply a rate limit. Returns { allowed, response } — `response` is a 429
 * JSON ready to return when the limit is exceeded.
 *
 * Usage:
 *   const rl = await rateLimit(req, { name: "login", limit: 5, windowSec: 900 });
 *   if (!rl.allowed) return rl.response!;
 */
export async function rateLimit(
  req: NextRequest | Request,
  opts: RateLimitOptions
): Promise<RateLimitResult> {
  gcMem();
  const ip = getClientIp(req);
  const scope = opts.scope ? `:${opts.scope}` : "";
  const key = `rl:${opts.name}:${ip}${scope}`;
  const result = upstashConfigured
    ? await upstashCheck(key, opts.limit, opts.windowSec)
    : memCheck(key, opts.limit, opts.windowSec);

  const headers = {
    "X-RateLimit-Limit": String(opts.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
  };

  if (result.allowed) {
    return { allowed: true, limit: opts.limit, remaining: result.remaining, resetAt: result.resetAt, response: null };
  }

  const retryAfter = Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000));
  const response = NextResponse.json(
    { error: "Trop de requêtes — veuillez réessayer dans quelques instants." },
    {
      status: 429,
      headers: { ...headers, "Retry-After": String(retryAfter) },
    }
  );
  return { allowed: false, limit: opts.limit, remaining: 0, resetAt: result.resetAt, response };
}
