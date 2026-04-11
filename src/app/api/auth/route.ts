import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, generateSessionToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  const user = await authenticateUser(email, password);
  if (!user) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const token = generateSessionToken(user.id, user.role);

  // Detect HTTPS from the actual request, not env var.
  // Honors x-forwarded-proto for reverse proxies (Nginx, Caddy, Cloudflare).
  const isHttps =
    req.nextUrl.protocol === "https:" ||
    req.headers.get("x-forwarded-proto") === "https";

  const response = NextResponse.json({
    success: true,
    user: { name: user.name, email: user.email, role: user.role },
  });

  response.cookies.set("admin_session", token, {
    httpOnly: true,
    secure: isHttps,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("admin_session");
  return response;
}
