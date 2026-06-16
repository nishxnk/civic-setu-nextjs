import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, isError } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { DEPARTMENTS } from "@/utils/constants";

export async function GET(request: NextRequest) {
  await connectDB();
  const auth = await requireAdmin(request);
  if (isError(auth)) return auth;

  return NextResponse.json({
    departments: DEPARTMENTS.map((d) => ({
      id: d,
      name: d.charAt(0).toUpperCase() + d.slice(1),
    })),
  });
}
