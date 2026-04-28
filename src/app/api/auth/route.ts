import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, generateSessionToken } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";
import { audit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  // 5 attempts per 15 min per IP. Email is added to the scope so a single
  // attacker on one IP can't deny service to legitimate users on the same NAT.
  const rl = await rateLimit(req, { name: "auth.login", limit: 5, windowSec: 900 });
  if (!rl.allowed) return rl.response!;

  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  const result = await authenticateUser(email, password);
  if (!result.ok) {
    audit(req, {
      action: "auth.login.failure",
      resource: `Email:${email}`,
      metadata: { reason: result.error },
      actor: { id: null, email },
    });
    if (result.error === "disabled") {
      return NextResponse.json({ error: "Compte désactivé" }, { status: 401 });
    }
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }
  const user = result.user;
  audit(req, { action: "auth.login.success", actor: { id: user.id, email: user.email } });

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
