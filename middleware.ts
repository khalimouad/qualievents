import { NextRequest, NextResponse } from "next/server";

const SESSION_SECRET = process.env.SESSION_SECRET || "fallback-dev-secret-change-me";

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

  // Login page and auth API are always accessible
  if (pathname === "/admin/login") return NextResponse.next();
  if (pathname === "/api/auth") return NextResponse.next();

  // ── ADMIN PAGES: require admin role ──
  if (pathname.startsWith("/admin")) {
    const session = await verifySession(req);
    if (!session || session.role !== "admin") {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return NextResponse.next();
  }

  // ── SCANNER PAGES: require any authenticated user (admin or staff) ──
  if (pathname.startsWith("/scan")) {
    const session = await verifySession(req);
    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return NextResponse.next();
  }

  // ── PROTECTED API ROUTES ──

  // Scan API: require any authenticated user (staff or admin)
  if (pathname.startsWith("/api/scan")) {
    const session = await verifySession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Subscriber list (GET) = admin only; registration (POST) = public
  if (pathname.startsWith("/api/subscribers")) {
    if (method === "POST") return NextResponse.next(); // Public registration
    const session = await verifySession(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Invitations, newsletters, panelists, sponsors, upload: admin only
  if (
    pathname.startsWith("/api/invitations") ||
    pathname.startsWith("/api/newsletters") ||
    pathname.startsWith("/api/panelists") ||
    pathname.startsWith("/api/sponsors") ||
    pathname.startsWith("/api/upload")
  ) {
    const session = await verifySession(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Payment list: admin only; POST (checkout, webhook, status check) is public
  if (pathname === "/api/payments" && method === "GET") {
    const session = await verifySession(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Event mutations: admin only; GET is public
  if (pathname.startsWith("/api/events") && method !== "GET") {
    const session = await verifySession(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
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
    "/api/events/:path*",
    "/api/scan/:path*",
    "/api/payments",
  ],
};
