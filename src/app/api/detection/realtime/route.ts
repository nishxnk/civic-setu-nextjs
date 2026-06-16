import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { detect } from "@/utils/roadDamageDetector";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("frame") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No frame provided" },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), "uploads");
    await mkdir(uploadDir, { recursive: true });
    const filepath = path.join(uploadDir, `${Date.now()}-frame.jpg`);
    await writeFile(filepath, Buffer.from(await file.arrayBuffer()));

    const threshold = parseFloat(
      (formData.get("threshold") as string) || "0.5"
    );
    const result = await detect(filepath, threshold);

    // Cleanup temp files
    try {
      await unlink(filepath);
      if (result.output_image) {
        await unlink(result.output_image);
      }
    } catch {
      /* best effort */
    }

    return NextResponse.json({
      detections: result.detections,
      frameProcessed: true,
    });
  } catch (error) {
    console.error("Realtime detection error:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
