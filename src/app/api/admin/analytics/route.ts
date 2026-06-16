import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, isError } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Complaint from "@/models/Complaint";

export async function GET(request: NextRequest) {
  await connectDB();
  const auth = await requireAdmin(request);
  if (isError(auth)) return auth;

  try {
    const period = request.nextUrl.searchParams.get("period") || "6months";
    const now = new Date();
    const monthsMap: Record<string, number> = {
      "1month": 1, "3months": 3, "6months": 6, "1year": 12,
    };
    const months = monthsMap[period] || 6;
    const start = new Date(now.setMonth(now.getMonth() - months));

    const [monthlyTrends, deptPerformance, priorityDist, statusDist] =
      await Promise.all([
        Complaint.aggregate([
          { $match: { createdAt: { $gte: start } } },
          { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, total: { $sum: 1 }, resolved: { $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] } } } },
          { $sort: { "_id.year": 1, "_id.month": 1 } },
        ]),
        Complaint.aggregate([
          { $group: { _id: "$department", total: { $sum: 1 }, resolved: { $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] } } } },
        ]),
        Complaint.aggregate([{ $group: { _id: "$priority", count: { $sum: 1 } } }]),
        Complaint.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      ]);

    return NextResponse.json({
      monthlyTrends,
      departmentPerformance: deptPerformance,
      priorityDistribution: priorityDist,
      statusDistribution: statusDist,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ message: "Failed" }, { status: 500 });
  }
}
