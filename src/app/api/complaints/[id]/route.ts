import { NextRequest, NextResponse } from "next/server";
import { authenticate, isError, requireAdmin } from "@/lib/auth";
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
  const complaint = await Complaint.findById(id).populate(
    "assignedTo",
    "name email"
  );
  if (!complaint)
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(complaint);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const auth = await requireAdmin(request);
  if (isError(auth)) return auth;

  const { id } = await params;
  const body = await request.json();
  const complaint = await Complaint.findByIdAndUpdate(id, body, { new: true });
  if (!complaint)
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(complaint);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const auth = await requireAdmin(request);
  if (isError(auth)) return auth;

  const { id } = await params;
  await Complaint.findByIdAndDelete(id);
  return NextResponse.json({ message: "Deleted" });
}
