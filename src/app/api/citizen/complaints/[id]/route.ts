import { NextRequest, NextResponse } from "next/server";
import { authenticate, isError } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Complaint from "@/models/Complaint";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const auth = await authenticate(request);
  if (isError(auth)) return auth;

  const { id } = await params;
  const complaint = await Complaint.findOne({
    _id: id,
    "citizen.email": auth.user.email,
  });
  if (!complaint)
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(complaint);
}
