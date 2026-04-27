import crypto from "crypto";

/**
 * Symmetric encryption for secrets at rest (e.g. payment provider keys).
 * Format: `base64(iv):base64(authTag):base64(ciphertext)`.
 *
 * Requires MASTER_ENCRYPTION_KEY to be 32 bytes (64 hex chars).
 * Generate: `openssl rand -hex 32`.
 */

const RAW_KEY = process.env.MASTER_ENCRYPTION_KEY || "";

let cachedKey: Buffer | null = null;
function getKey(): Buffer {
  if (cachedKey) return cachedKey;
  if (!RAW_KEY) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "MASTER_ENCRYPTION_KEY is required in production. Generate with: openssl rand -hex 32"
      );
    }
    // Dev fallback: deterministic key so local dev can read whatever was
    // encrypted earlier. Loud warning so it's never confused for prod.
    console.warn(
      "[crypto] MASTER_ENCRYPTION_KEY not set — using a deterministic dev key. Set the real key with: openssl rand -hex 32"
    );
    cachedKey = crypto.createHash("sha256").update("qualievents-dev-only").digest();
    return cachedKey;
  }
  // Accept hex (64 chars) or base64; both decode to 32 bytes.
  if (/^[0-9a-fA-F]{64}$/.test(RAW_KEY)) {
    cachedKey = Buffer.from(RAW_KEY, "hex");
  } else {
    cachedKey = Buffer.from(RAW_KEY, "base64");
  }
  if (cachedKey.length !== 32) {
    throw new Error("MASTER_ENCRYPTION_KEY must decode to exactly 32 bytes");
  }
  return cachedKey;
}

export function encrypt(plaintext: string): string {
  if (!plaintext) return "";
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}:${tag.toString("base64")}:${ct.toString("base64")}`;
}

export function decrypt(payload: string | null | undefined): string {
  if (!payload) return "";
  const parts = payload.split(":");
  if (parts.length !== 3) throw new Error("Invalid ciphertext format");
  const iv = Buffer.from(parts[0], "base64");
  const tag = Buffer.from(parts[1], "base64");
  const ct = Buffer.from(parts[2], "base64");
  const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(), iv);
  decipher.setAuthTag(tag);
  const pt = Buffer.concat([decipher.update(ct), decipher.final()]);
  return pt.toString("utf8");
}

/** Mask a secret for display: returns "••••" + last 4 chars. */
export function maskSecret(value: string | null | undefined): string {
  if (!value) return "";
  if (value.length <= 4) return "••••";
  return "••••" + value.slice(-4);
}
