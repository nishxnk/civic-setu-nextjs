import { NextRequest, NextResponse } from "next/server";
import { authenticate, isError } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Complaint from "@/models/Complaint";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ email: string }> }
) {
  await connectDB();
  const auth = await authenticate(request);
  if (isError(auth)) return auth;

  const { email } = await params;

  if (auth.user.role !== "admin" && auth.user.email !== email) {
    return NextResponse.json({ message: "Access denied" }, { status: 403 });
  }

  const complaints = await Complaint.find({ "citizen.email": email }).sort({
    createdAt: -1,
  });
  return NextResponse.json({ complaints });
}
