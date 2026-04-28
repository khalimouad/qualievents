import { NextRequest, NextResponse } from "next/server";

const RAW_SECRET = process.env.SESSION_SECRET;
const FALLBACK = "fallback-dev-secret-change-me";
const isBadSecret = !RAW_SECRET || RAW_SECRET === FALLBACK || /^0+$/.test(RAW_SECRET);

if (isBadSecret && process.env.NODE_ENV === "production") {
  throw new Error(
    "SESSION_SECRET is missing or insecure. Generate one with: openssl rand -hex 32"
  );
}

const SESSION_SECRET = RAW_SECRET || FALLBACK;

// Web Crypto API HMAC (works in Edge Runtime)
async function hmacHex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function verifySession(
  req: NextRequest
): Promise<{ userId: string; role: string } | null> {
  const token = req.cookies.get("admin_session")?.value;
  if (!token) return null;

  try {
    // atob is available in Edge Runtime (Buffer is not)
    const decoded = atob(token);
    const parts = decoded.split(":");
    if (parts.length !== 4) return null;

    const [userId, role, timestamp, hmac] = parts;
    const payload = `${userId}:${role}:${timestamp}`;
    const expectedHmac = await hmacHex(SESSION_SECRET, payload);

    if (hmac !== expectedHmac) return null;

    const age = Date.now() - parseInt(timestamp);
    if (age > 24 * 60 * 60 * 1000) return null;

    return { userId, role };
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const method = req.method;

  // Always public
  if (pathname === "/admin/login") return NextResponse.next();
  if (pathname === "/api/auth") return NextResponse.next();

  // Public payment endpoints (CinetPay redirect/webhook needs them open)
  if (pathname.startsWith("/api/payments")) {
    const isPaymentList = pathname === "/api/payments" && method === "GET";
    const isAdminScoped = pathname.startsWith("/api/payments/settings");
    if (!isPaymentList && !isAdminScoped) return NextResponse.next();
    // Admin-only payment paths fall through to the auth check below
  }

  // Public registration (POST /api/subscribers); listing requires auth
  if (pathname.startsWith("/api/subscribers") && method === "POST") {
    return NextResponse.next();
  }

  // Public read of events; mutations require auth
  if (pathname.startsWith("/api/events") && method === "GET") {
    return NextResponse.next();
  }

  // Public read of series; mutations require auth
  if (pathname.startsWith("/api/series") && method === "GET") {
    return NextResponse.next();
  }

  // Public certificate verification endpoint
  if (pathname.startsWith("/api/certifications/verify/") && method === "GET") {
    return NextResponse.next();
  }

  // Public read of tiers (under /api/events/[slug]/tiers GET) is already
  // covered by the events-GET rule above.

  // Public submission of info-requests (lead capture on past events)
  if (pathname.startsWith("/api/info-requests") && method === "POST") {
    return NextResponse.next();
  }

  // Public submission of group bookings (POST only — list/admin actions auth)
  if (pathname.match(/^\/api\/events\/[^/]+\/group-bookings$/) && method === "POST") {
    return NextResponse.next();
  }

  // Public one-click unsubscribe (token-protected via HMAC in the URL)
  if (pathname.startsWith("/api/unsubscribe/")) {
    return NextResponse.next();
  }

  // Everything else under /admin, /scan or these /api/* matchers requires a session.
  const session = await verifySession(req);
  const isPage = pathname.startsWith("/admin") || pathname.startsWith("/scan");

  if (!session) {
    return isPage
      ? NextResponse.redirect(new URL("/admin/login", req.url))
      : NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Admin-only surfaces (defence in depth — handlers re-check)
  const adminOnlyPrefixes = [
    "/admin/users",
    "/admin/settings",
    "/admin/audit",
    "/api/users",
    "/api/payments/settings",
    "/api/audit",
  ];
  if (adminOnlyPrefixes.some((p) => pathname.startsWith(p))) {
    if (session.role !== "admin") {
      return isPage
        ? NextResponse.redirect(new URL("/admin", req.url))
        : NextResponse.json({ error: "Accès administrateur requis" }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/scan/:path*",
    "/api/sponsors/:path*",
    "/api/upload/:path*",
    "/api/subscribers/:path*",
    "/api/invitations/:path*",
    "/api/newsletters/:path*",
    "/api/panelists/:path*",
    "/api/info-requests/:path*",
    "/api/events/:path*",
    "/api/scan/:path*",
    "/api/payments/:path*",
    "/api/badges/:path*",
    "/api/users/:path*",
    "/api/sessions/:path*",
    "/api/tiers/:path*",
    "/api/series/:path*",
    "/api/certifications/:path*",
    "/api/documents/:path*",
    "/api/group-bookings/:path*",
    "/api/audit/:path*",
  ],
};
