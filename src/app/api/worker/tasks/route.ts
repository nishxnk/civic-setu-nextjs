import { NextRequest, NextResponse } from "next/server";
import { authenticate, isError } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Complaint from "@/models/Complaint";

export async function GET(request: NextRequest) {
  await connectDB();
  const auth = await authenticate(request);
  if (isError(auth)) return auth;

  // Only workers and admins can access task list
  if (auth.user.role !== "worker" && auth.user.role !== "admin") {
    return NextResponse.json(
      { message: "Access denied. Worker role required." },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = request.nextUrl;
    const status = searchParams.get("status");

    const query: Record<string, unknown> = {
      assignedTo: auth.user._id,
    };
    if (status) query.status = status;

    const tasks = await Complaint.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .limit(50)
      .lean();

    // Stats
    const [pending, inProgress, resolved] = await Promise.all([
      Complaint.countDocuments({ assignedTo: auth.user._id, status: "pending" }),
      Complaint.countDocuments({ assignedTo: auth.user._id, status: "in-progress" }),
      Complaint.countDocuments({ assignedTo: auth.user._id, status: "resolved" }),
    ]);

    return NextResponse.json({
      tasks,
      stats: { pending, inProgress, resolved },
    });
  } catch (error) {
    console.error("Worker tasks error:", error);
    return NextResponse.json(
      { message: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}
