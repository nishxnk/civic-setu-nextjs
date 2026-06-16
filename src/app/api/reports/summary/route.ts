import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, isError } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Complaint from "@/models/Complaint";

export async function GET(request: NextRequest) {
  await connectDB();
  const auth = await requireAdmin(request);
  if (isError(auth)) return auth;

  try {
    const [total, statusBreakdown, categoryBreakdown] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Complaint.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]),
    ]);

    const statusWithPercent = statusBreakdown.map((s: { _id: string; count: number }) => ({
      ...s,
      percentage: parseFloat(((s.count / total) * 100).toFixed(1)),
    }));

    return NextResponse.json({
      totalComplaints: total,
      statusBreakdown: statusWithPercent,
      categoryBreakdown,
    });
  } catch (error) {
    console.error("Report summary error:", error);
    return NextResponse.json({ message: "Failed" }, { status: 500 });
  }
}
