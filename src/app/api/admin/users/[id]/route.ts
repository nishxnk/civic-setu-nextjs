import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, isError } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const auth = await requireAdmin(request);
  if (isError(auth)) return auth;

  const { id } = await params;
  const body = await request.json();
  const user = await User.findByIdAndUpdate(id, body, { new: true });
  if (!user)
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(user);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const auth = await requireAdmin(request);
  if (isError(auth)) return auth;

  const { id } = await params;
  await User.findByIdAndDelete(id);
  return NextResponse.json({ message: "Deleted" });
}
