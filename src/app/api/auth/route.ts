import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, generateSessionToken } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";
import { audit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    // 5 attempts per 15 min per IP.
    const rl = await rateLimit(req, { name: "auth.login", limit: 5, windowSec: 900 });
    if (!rl.allowed) return rl.response!;

    const body = await req.json().catch(() => ({}));
    const { email, password } = body as { email?: string; password?: string };

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
      return NextResponse.json({ error: "Email ou mot de passe incorrect" }, { status: 401 });
    }
    const user = result.user;
    audit(req, { action: "auth.login.success", actor: { id: user.id, email: user.email } });

    const token = generateSessionToken(user.id, user.role);

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
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (err) {
    console.error("[auth] POST error:", err);
    return NextResponse.json(
      { error: "Une erreur est survenue, veuillez réessayer." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("admin_session");
  return response;
}
