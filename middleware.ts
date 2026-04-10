import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const SESSION_SECRET = process.env.SESSION_SECRET || "fallback-dev-secret-change-me";

function verifySession(req: NextRequest): { userId: string; role: string } | null {
  const token = req.cookies.get("admin_session")?.value;
  if (!token) return null;

  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const parts = decoded.split(":");
    if (parts.length !== 4) return null;

    const [userId, role, timestamp, hmac] = parts;
    const payload = `${userId}:${role}:${timestamp}`;
    const expectedHmac = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");

    if (hmac !== expectedHmac) return null;

    const age = Date.now() - parseInt(timestamp);
    if (age > 24 * 60 * 60 * 1000) return null;

    return { userId, role };
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const method = req.method;

  // Login page and auth API are always accessible
  if (pathname === "/admin/login") return NextResponse.next();
  if (pathname === "/api/auth") return NextResponse.next();

  // ── ADMIN PAGES: require admin role ──
  if (pathname.startsWith("/admin")) {
    const session = verifySession(req);
    if (!session || session.role !== "admin") {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return NextResponse.next();
  }

  // ── SCANNER PAGES: require any authenticated user (admin or staff) ──
  if (pathname.startsWith("/scan")) {
    const session = verifySession(req);
    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return NextResponse.next();
  }

  // ── PROTECTED API ROUTES ──

  // Scan API: require any authenticated user (staff or admin)
  if (pathname.startsWith("/api/scan")) {
    const session = verifySession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Subscriber list (GET) = admin only; registration (POST) = public
  if (pathname.startsWith("/api/subscribers")) {
    if (method === "POST") return NextResponse.next(); // Public registration
    const session = verifySession(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Invitations, newsletters, panelists, sponsors: admin only
  if (pathname.startsWith("/api/invitations") ||
      pathname.startsWith("/api/newsletters") ||
      pathname.startsWith("/api/panelists") ||
      pathname.startsWith("/api/sponsors")) {
    const session = verifySession(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Event mutations: admin only; GET is public
  if (pathname.startsWith("/api/events") && method !== "GET") {
    const session = verifySession(req);
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
    "/api/subscribers/:path*",
    "/api/invitations/:path*",
    "/api/newsletters/:path*",
    "/api/panelists/:path*",
    "/api/events/:path*",
    "/api/scan/:path*",
  ],
};
