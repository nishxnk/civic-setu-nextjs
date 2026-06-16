import { NextRequest, NextResponse } from "next/server";
import { authenticate, isError } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Complaint from "@/models/Complaint";

export async function GET(request: NextRequest) {
  await connectDB();
  const auth = await authenticate(request);
  if (isError(auth)) return auth;

  try {
    const email = auth.user.email;
    const now = new Date();
    const sixMonthsAgo = new Date(now.setMonth(now.getMonth() - 6));

    const [monthly, categoryStats] = await Promise.all([
      Complaint.aggregate([
        { $match: { "citizen.email": email, createdAt: { $gte: sixMonthsAgo } } },
        { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, total: { $sum: 1 }, resolved: { $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] } } } },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
      Complaint.aggregate([
        { $match: { "citizen.email": email } },
        { $group: { _id: "$category", total: { $sum: 1 } } },
      ]),
    ]);

    return NextResponse.json({ monthlyStats: monthly, categoryStats });
  } catch (error) {
    console.error("Citizen stats error:", error);
    return NextResponse.json({ message: "Failed" }, { status: 500 });
  }
}
