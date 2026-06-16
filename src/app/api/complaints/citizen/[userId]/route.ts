import { NextRequest, NextResponse } from "next/server";
import { authenticate, isError } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Complaint from "@/models/Complaint";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  await connectDB();
  const auth = await authenticate(request);
  if (isError(auth)) return auth;

  const { userId } = await params;
  const complaints = await Complaint.find({ "citizen.email": auth.user.email })
    .sort({ createdAt: -1 });
  return NextResponse.json({ complaints });
}
