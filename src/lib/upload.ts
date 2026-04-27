import { put } from "@vercel/blob";

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

  try {
    const ext = file.name.split(".").pop() || "bin";
    const timestamp = Date.now();
    const filename = `${timestamp}.${ext}`;
    const pathname = `${type}/${filename}`;

    const blob = await put(pathname, file, {
      access: "public",
    });

    return { url: blob.url };
  } catch (error) {
    console.error("Upload error:", error);
    const msg = error instanceof Error ? error.message : String(error);
    return { url: "", error: `Upload failed: ${msg}` };
  }
}
