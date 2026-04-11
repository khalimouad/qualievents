import { NextRequest, NextResponse } from "next/server";
import { saveUploadedFile } from "@/lib/upload";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const type = formData.get("type") as string | null;

  if (!file || !type) {
    return NextResponse.json({ error: "file and type required" }, { status: 400 });
  }

  if (!["events", "panelists", "sponsors"].includes(type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const result = await saveUploadedFile(file, type as "events" | "panelists" | "sponsors");
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ url: result.url });
}
