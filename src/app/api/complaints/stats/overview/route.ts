import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, isError } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Complaint from "@/models/Complaint";

export async function GET(request: NextRequest) {
  await connectDB();
  const auth = await requireAdmin(request);
  if (isError(auth)) return auth;

  try {
    const [total, resolved, pending, inProgress] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: "resolved" }),
      Complaint.countDocuments({ status: "pending" }),
      Complaint.countDocuments({ status: "in-progress" }),
    ]);

    const deptStats = await Complaint.aggregate([
      { $group: { _id: "$department", total: { $sum: 1 } } },
    ]);

    const now = new Date();
    const sixMonthsAgo = new Date(now.setMonth(now.getMonth() - 6));
    const monthlyTrends = await Complaint.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          total: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] },
          },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    return NextResponse.json({
      stats: { totalComplaints: total, resolvedComplaints: resolved, pendingComplaints: pending, inProgressComplaints: inProgress },
      departmentStats: deptStats,
      monthlyTrends,
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ message: "Failed" }, { status: 500 });
  }
}
