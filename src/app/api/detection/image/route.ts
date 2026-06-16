import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { detect } from "@/utils/roadDamageDetector";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }

    await mkdir(UPLOAD_DIR, { recursive: true });
    const filename = `${Date.now()}${path.extname(file.name)}`;
    const filepath = path.join(UPLOAD_DIR, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buffer);

    const threshold = parseFloat(
      (formData.get("threshold") as string) || "0.5"
    );
    const result = await detect(filepath, threshold);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Image detection error:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
