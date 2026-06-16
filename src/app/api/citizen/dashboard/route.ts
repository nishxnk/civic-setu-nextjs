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
    const [total, resolved, pending, inProgress, recent] = await Promise.all([
      Complaint.countDocuments({ "citizen.email": email }),
      Complaint.countDocuments({ "citizen.email": email, status: "resolved" }),
      Complaint.countDocuments({ "citizen.email": email, status: "pending" }),
      Complaint.countDocuments({ "citizen.email": email, status: "in-progress" }),
      Complaint.find({ "citizen.email": email }).sort({ createdAt: -1 }).limit(5),
    ]);

    return NextResponse.json({
      stats: { totalComplaints: total, resolvedComplaints: resolved, pendingComplaints: pending, inProgressComplaints: inProgress },
      recentComplaints: recent,
    });
  } catch (error) {
    console.error("Citizen dashboard error:", error);
    return NextResponse.json({ message: "Failed" }, { status: 500 });
  }
}
