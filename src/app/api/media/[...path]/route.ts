import { NextRequest, NextResponse } from "next/server";
import { get } from "@vercel/blob";

export const runtime = "nodejs";

// Uploaded media (events/panelists/sponsors) always gets a fresh timestamped
// filename, so it never changes — cache it hard. Certifications and invoices
// reuse a fixed filename and can be regenerated, so they must stay fresh.
const IMMUTABLE_PREFIXES = ["events/", "panelists/", "sponsors/"];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathname = path.join("/");

  const isImmutable = IMMUTABLE_PREFIXES.some((p) => pathname.startsWith(p));

  const result = await get(pathname, { access: "private", useCache: !isImmutable }).catch(() => null);
  if (!result || result.statusCode !== 200 || !result.stream) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": isImmutable
        ? "public, max-age=31536000, immutable"
        : "public, max-age=300",
    },
  });
}
