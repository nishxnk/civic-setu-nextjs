import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
  ".gif": "image/gif", ".webp": "image/webp",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  const filepath = path.join(process.cwd(), "uploads", filename);

  try {
    const buffer = await readFile(filepath);
    const ext = path.extname(filename).toLowerCase();
    return new NextResponse(buffer, {
      headers: { "Content-Type": MIME[ext] || "application/octet-stream" },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
