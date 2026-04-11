import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "image/svg+xml"];

export async function saveUploadedFile(
  file: File,
  type: "events" | "panelists" | "sponsors"
): Promise<{ url: string; error?: string }> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { url: "", error: "Invalid file type. Use JPG, PNG, WebP, GIF, or SVG." };
  }
  if (file.size > MAX_SIZE) {
    return { url: "", error: "File too large. Max 5MB." };
  }

  const typeDir = path.join(UPLOAD_DIR, type);
  await mkdir(typeDir, { recursive: true });

  const ext = file.name.split(".").pop() || "bin";
  const filename = `${crypto.randomBytes(12).toString("hex")}.${ext}`;
  const filepath = path.join(typeDir, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);

  return { url: `/uploads/${type}/${filename}` };
}
