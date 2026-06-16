import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Complaint from "@/models/Complaint";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ trackingNumber: string }> }
) {
  await connectDB();
  const { trackingNumber } = await params;

  const complaint = await Complaint.findOne({ trackingNumber });
  if (!complaint)
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(complaint);
}
