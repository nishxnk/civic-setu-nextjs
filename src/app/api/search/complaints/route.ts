import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, isError } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Complaint from "@/models/Complaint";

export async function GET(request: NextRequest) {
  await connectDB();
  const auth = await requireAdmin(request);
  if (isError(auth)) return auth;

  try {
    const { searchParams } = request.nextUrl;
    const query = searchParams.get("query") || "";
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const category = searchParams.get("category");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sort = searchParams.get("sort") || "-createdAt";

    const filter: Record<string, unknown> = {};
    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { trackingNumber: { $regex: query, $options: "i" } },
        { "citizen.name": { $regex: query, $options: "i" } },
        { "location.address": { $regex: query, $options: "i" } },
      ];
    }
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) (filter.createdAt as Record<string, unknown>).$gte = new Date(startDate);
      if (endDate) (filter.createdAt as Record<string, unknown>).$lte = new Date(endDate);
    }

    const sortField = sort.startsWith("-") ? sort.slice(1) : sort;
    const sortDir = sort.startsWith("-") ? -1 : 1;

    const total = await Complaint.countDocuments(filter);
    const complaints = await Complaint.find(filter)
      .populate("assignedTo", "name email")
      .sort({ [sortField]: sortDir })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({ complaints, total, totalPages: Math.ceil(total / limit), currentPage: page });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ message: "Failed" }, { status: 500 });
  }
}
