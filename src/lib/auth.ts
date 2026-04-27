import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import crypto from "crypto";

const RAW_SECRET = process.env.SESSION_SECRET;
const FALLBACK = "fallback-dev-secret-change-me";
const isBadSecret = !RAW_SECRET || RAW_SECRET === FALLBACK || /^0+$/.test(RAW_SECRET);

if (isBadSecret) {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "SESSION_SECRET is missing or insecure. Generate one with: openssl rand -hex 32"
    );
  } else {
    console.warn(
      "[auth] SESSION_SECRET is missing or insecure — using a development fallback. Set it via: openssl rand -hex 32"
    );
  }
}

const SESSION_SECRET = RAW_SECRET || FALLBACK;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateSessionToken(userId: string, role: string): string {
  const payload = `${userId}:${role}:${Date.now()}`;
  const hmac = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
  return Buffer.from(`${payload}:${hmac}`).toString("base64");
}

export function verifySessionToken(token: string): { userId: string; role: string } | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const parts = decoded.split(":");
    if (parts.length !== 4) return null;
    const [userId, role, timestamp, hmac] = parts;
    const payload = `${userId}:${role}:${timestamp}`;
    const expectedHmac = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
    if (hmac !== expectedHmac) return null;
    if (Date.now() - parseInt(timestamp) > 24 * 60 * 60 * 1000) return null;
    return { userId, role };
  } catch {
    return null;
  }
}

export type AuthResult =
  | { ok: true; user: { id: string; email: string; name: string; role: string } }
  | { ok: false; error: "invalid" | "disabled" };

export async function authenticateUser(email: string, password: string): Promise<AuthResult> {
  const user = await prisma.adminUser.findUnique({ where: { email } });
  if (!user) return { ok: false, error: "invalid" };
  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return { ok: false, error: "invalid" };
  if (user.active === false) return { ok: false, error: "disabled" };
  // Touch lastLoginAt — fire and forget so a slow DB doesn't slow login.
  prisma.adminUser
    .update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
    .catch((err) => console.error("[auth] lastLoginAt update failed:", err));
  return { ok: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
}
