import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";

/**
 * Badge code = full hyphen-less UUID v4 in upper-case.
 * Previously this was just the first 8-char segment of a UUID (~32 bits of
 * entropy, brute-forceable on /api/scan); the full UUID gives 122 bits
 * which is appropriate for a non-secret-but-unguessable identifier.
 */
export function generateBadgeCode(): string {
  return uuidv4().replace(/-/g, "").toUpperCase();
}

export async function generateQRDataURL(data: string): Promise<string> {
  return QRCode.toDataURL(data, {
    width: 300,
    margin: 2,
    color: {
      dark: "#1a1a2e",
      light: "#ffffff",
    },
  });
}
