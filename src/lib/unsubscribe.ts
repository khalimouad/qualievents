import crypto from "crypto";

const RAW_SECRET =
  process.env.UNSUBSCRIBE_SECRET || process.env.SESSION_SECRET || "fallback-dev-secret-change-me";

/**
 * Build a tamper-resistant unsubscribe token for a Subscriber row.
 * Format: <subscriberId>.<hmac> (URL-safe).
 *
 * We deliberately use a separate secret (UNSUBSCRIBE_SECRET) so rotating the
 * session secret doesn't invalidate every "Se désinscrire" link in flight.
 * Falls back to SESSION_SECRET when no dedicated secret is set.
 */
export function buildUnsubscribeToken(subscriberId: string): string {
  const hmac = crypto.createHmac("sha256", RAW_SECRET).update(subscriberId).digest("hex").slice(0, 32);
  return `${subscriberId}.${hmac}`;
}

export function verifyUnsubscribeToken(token: string): string | null {
  const idx = token.lastIndexOf(".");
  if (idx <= 0) return null;
  const id = token.slice(0, idx);
  const hmac = token.slice(idx + 1);
  const expected = crypto.createHmac("sha256", RAW_SECRET).update(id).digest("hex").slice(0, 32);
  if (hmac.length !== expected.length) return null;
  try {
    if (crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expected))) return id;
  } catch {
    return null;
  }
  return null;
}

/** Build the public URL the recipient lands on when they click the link. */
export function unsubscribeUrl(baseUrl: string, subscriberId: string): string {
  return `${baseUrl}/unsubscribe/${buildUnsubscribeToken(subscriberId)}`;
}
