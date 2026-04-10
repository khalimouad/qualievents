import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";

export function generateBadgeCode(): string {
  return uuidv4().split("-")[0].toUpperCase();
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
