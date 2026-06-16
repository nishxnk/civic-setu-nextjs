import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("video") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No video file provided" },
        { status: 400 }
      );
    }

    await mkdir(path.join(process.cwd(), "uploads"), { recursive: true });
    const filepath = path.join(
      process.cwd(),
      "uploads",
      `${Date.now()}${path.extname(file.name)}`
    );
    await writeFile(filepath, Buffer.from(await file.arrayBuffer()));

    return NextResponse.json({
      message: "Video detection not implemented yet",
      videoPath: filepath,
    });
  } catch (error) {
    console.error("Video detection error:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
