import { NextRequest, NextResponse } from "next/server";
import { authenticate, isError } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  await connectDB();
  const auth = await authenticate(request);
  if (isError(auth)) return auth;
  return NextResponse.json(auth.user);
}
