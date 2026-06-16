import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, isError } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Complaint from "@/models/Complaint";
import User from "@/models/User";

export async function GET(request: NextRequest) {
  await connectDB();
  const auth = await requireAdmin(request);
  if (isError(auth)) return auth;

  try {
    const [
      total,
      resolved,
      pending,
      inProgress,
      totalUsers,
      deptStats,
      priorityDist,
      recent,
    ] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: "resolved" }),
      Complaint.countDocuments({ status: "pending" }),
      Complaint.countDocuments({ status: "in-progress" }),
      User.countDocuments(),
      Complaint.aggregate([{ $group: { _id: "$department", total: { $sum: 1 } } }]),
      Complaint.aggregate([{ $group: { _id: "$priority", count: { $sum: 1 } } }]),
      Complaint.find().populate("assignedTo", "name email").sort({ createdAt: -1 }).limit(5),
    ]);

    return NextResponse.json({
      stats: { totalComplaints: total, resolvedComplaints: resolved, pendingComplaints: pending, inProgressComplaints: inProgress, totalUsers },
      departmentStats: deptStats,
      priorityDistribution: priorityDist,
      recentComplaints: recent,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ message: "Failed" }, { status: 500 });
  }
}
