import { NextRequest, NextResponse } from "next/server";
import { authenticate, isError, requireAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import InspectionSchedule from "@/lib/database/models/InspectionSchedule";

export async function GET(request: NextRequest) {
  await connectDB();
  const auth = await authenticate(request);
  if (isError(auth)) return auth;

  const schedules = await InspectionSchedule.find({ isActive: true })
    .populate("assignedWorkers", "name email")
    .populate("assets", "name assetCode")
    .sort({ nextScheduledDate: 1 })
    .lean();

  return NextResponse.json({ schedules });
}

export async function POST(request: NextRequest) {
  await connectDB();
  const auth = await requireAdmin(request);
  if (isError(auth)) return auth;

  const body = await request.json();
  const schedule = await InspectionSchedule.create(body);
  return NextResponse.json(schedule, { status: 201 });
}
