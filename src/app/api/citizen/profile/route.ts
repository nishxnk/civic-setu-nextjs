import { NextRequest, NextResponse } from "next/server";
import { authenticate, isError } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(request: NextRequest) {
  await connectDB();
  const auth = await authenticate(request);
  if (isError(auth)) return auth;
  return NextResponse.json(auth.user);
}

export async function PUT(request: NextRequest) {
  await connectDB();
  const auth = await authenticate(request);
  if (isError(auth)) return auth;

  try {
    const body = await request.json();
    const user = await User.findByIdAndUpdate(auth.user._id, body, {
      new: true,
    });
    return NextResponse.json(user);
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ message: "Failed" }, { status: 500 });
  }
}
