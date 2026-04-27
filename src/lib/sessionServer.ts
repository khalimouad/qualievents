import { cookies } from "next/headers";
import { verifySessionToken } from "./auth";

/** Server-component / layout helper. Returns null when missing/expired/tampered. */
export async function getSessionFromCookies(): Promise<{ userId: string; role: string } | null> {
  const store = await cookies();
  const token = store.get("admin_session")?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
