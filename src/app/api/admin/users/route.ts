import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, isError } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(request: NextRequest) {
  await connectDB();
  const auth = await requireAdmin(request);
  if (isError(auth)) return auth;

  try {
    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const role = searchParams.get("role");

    const query: Record<string, unknown> = {};
    if (role) query.role = role;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      users,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json({ message: "Failed" }, { status: 500 });
  }
}
