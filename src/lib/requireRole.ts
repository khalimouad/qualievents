import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "./auth";

export type Session = { userId: string; role: string };

/** Reads and verifies the admin_session cookie. Returns null when missing/expired/tampered. */
export function getSession(req: NextRequest | Request): Session | null {
  // NextRequest exposes a typed cookies API; plain Request does not.
  // Both share the standard headers map.
  let token: string | undefined;
  if (typeof (req as NextRequest).cookies?.get === "function") {
    token = (req as NextRequest).cookies.get("admin_session")?.value;
  } else {
    const cookieHeader = req.headers.get("cookie") || "";
    const m = cookieHeader.match(/(?:^|;\s*)admin_session=([^;]+)/);
    token = m?.[1];
  }
  if (!token) return null;
  return verifySessionToken(token);
}

/** Throws a 401 Response when not authenticated. */
export function requireAuth(req: NextRequest | Request): Session {
  const session = getSession(req);
  if (!session) {
    throw NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  return session;
}

/** Throws 401 when not authenticated, 403 when role !== "admin". */
export function requireAdmin(req: NextRequest | Request): Session {
  const session = requireAuth(req);
  if (session.role !== "admin") {
    throw NextResponse.json({ error: "Accès administrateur requis" }, { status: 403 });
  }
  return session;
}

/**
 * Catches a thrown Response from requireAuth/requireAdmin and returns it,
 * otherwise re-throws. Use it like:
 *   try { const s = requireAdmin(req); ... } catch (e) { return passThrough(e); }
 */
export function passThrough(e: unknown): Response {
  if (e instanceof Response) return e;
  throw e;
}
