import { NextRequest, NextResponse } from "next/server";

function isAuthenticated(req: NextRequest): boolean {
  const session = req.cookies.get("admin_session");
  return session?.value === "authenticated";
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const method = req.method;

  // Login page is always accessible
  if (pathname === "/admin/login") return NextResponse.next();

  // All /admin pages require auth
  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated(req)) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return NextResponse.next();
  }

  // Public API endpoints (no auth needed):
  // - GET /api/events (listing for public pages)
  // - GET /api/events/[slug] (event page data)
  // - GET /api/events/[slug]/calendar (ICS download)
  // - POST /api/subscribers (registration)
  // - GET /api/badges (badge lookup)
  // - GET/POST /api/scan (badge scanning)
  // - GET /api/scan/stats (scanner stats)
  // - POST /api/auth (login)

  // Protected API endpoints (auth needed):
  const protectedRoutes: Array<{ path: string; methods?: string[] }> = [
    { path: "/api/subscribers", methods: ["GET", "DELETE", "PUT", "PATCH"] },
    { path: "/api/invitations" },
    { path: "/api/newsletters" },
    { path: "/api/panelists" },
  ];

  for (const route of protectedRoutes) {
    if (pathname.startsWith(route.path)) {
      if (route.methods && !route.methods.includes(method)) {
        return NextResponse.next(); // Method not in protected list
      }
      if (!isAuthenticated(req)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }
  }

  // Protect event mutations (POST/PUT/DELETE) but allow GET
  if (pathname.startsWith("/api/events") && method !== "GET") {
    if (!isAuthenticated(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/subscribers/:path*",
    "/api/invitations/:path*",
    "/api/newsletters/:path*",
    "/api/panelists/:path*",
    "/api/events/:path*",
  ],
};
