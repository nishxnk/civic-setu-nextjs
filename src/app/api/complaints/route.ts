import { NextRequest, NextResponse } from "next/server";
import { authenticate, isError, requireAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Complaint from "@/models/Complaint";

// POST /api/complaints — Public complaint submission
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const complaint = await Complaint.create(body);
    return NextResponse.json(complaint, { status: 201 });
  } catch (error) {
    console.error("Create complaint error:", error);
    return NextResponse.json(
      { message: "Failed to create complaint" },
      { status: 500 }
    );
  }
}

// GET /api/complaints — Admin: all complaints with filtering & pagination
export async function GET(request: NextRequest) {
  await connectDB();
  const auth = await requireAdmin(request);
  if (isError(auth)) return auth;

  try {
    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const department = searchParams.get("department");
    const search = searchParams.get("search");

    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (department) query.department = department;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { "citizen.name": { $regex: search, $options: "i" } },
        { "location.address": { $regex: search, $options: "i" } },
      ];
    }

    const total = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query)
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      complaints,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Get complaints error:", error);
    return NextResponse.json(
      { message: "Failed to fetch complaints" },
      { status: 500 }
    );
  }
}
