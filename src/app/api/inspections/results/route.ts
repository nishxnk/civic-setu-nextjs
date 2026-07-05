import { NextRequest, NextResponse } from "next/server";
import { authenticate, isError } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import InspectionResult from "@/lib/database/models/InspectionResult";
import InspectionSchedule from "@/lib/database/models/InspectionSchedule";
import Complaint from "@/models/Complaint";

export async function GET(request: NextRequest) {
  await connectDB();
  const auth = await authenticate(request);
  if (isError(auth)) return auth;

  const { searchParams } = request.nextUrl;
  const workerId = searchParams.get("workerId");
  const scheduleId = searchParams.get("scheduleId");

  const query: Record<string, unknown> = {};
  if (workerId) query.workerId = workerId;
  if (scheduleId) query.scheduleId = scheduleId;

  const results = await InspectionResult.find(query)
    .populate("scheduleId", "title category")
    .populate("workerId", "name email")
    .populate("assetId", "name assetCode")
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return NextResponse.json({ results });
}

export async function POST(request: NextRequest) {
  await connectDB();
  const auth = await authenticate(request);
  if (isError(auth)) return auth;

  const body = await request.json();
  const result = await InspectionResult.create({
    ...body,
    workerId: auth.user._id,
    startedAt: new Date(),
  });

  return NextResponse.json(result, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  await connectDB();
  const auth = await authenticate(request);
  if (isError(auth)) return auth;

  const body = await request.json();
  const { id, ...updates } = body;

  const result = await InspectionResult.findById(id);
  if (!result) return NextResponse.json({ message: "Not found" }, { status: 404 });

  Object.assign(result, updates);

  // Calculate issues found
  if (updates.checklist) {
    result.issuesFound = updates.checklist.filter(
      (c: { finding?: string }) => c.finding === "issue_found" || c.finding === "needs_attention"
    ).length;
  }

  // If completing, set completedAt and auto-create complaint if issues found
  if (updates.status === "completed") {
    result.completedAt = new Date();

    if (result.issuesFound > 0 && !result.complaintCreated) {
      const schedule = await InspectionSchedule.findById(result.scheduleId);
      const complaint = await Complaint.create({
        title: `Inspection Finding: ${schedule?.title || "Issue"} - ${new Date().toLocaleDateString()}`,
        description: `Issues found during scheduled inspection.\nFindings: ${result.checklist
          .filter((c: { finding?: string; task?: string; notes?: string }) => c.finding === "issue_found" || c.finding === "needs_attention")
          .map((c: { task?: string; finding?: string; notes?: string }) => `- ${c.task}: ${c.finding}${c.notes ? ` (${c.notes})` : ""}`)
          .join("\n")}`,
        category: schedule?.category === "road" ? "road" : "other",
        department: schedule?.department || "pwd",
        location: result.location,
        citizen: { name: "System (Inspection)", email: "system@civicsetu.app", phone: "" },
        priority: result.overallCondition === "poor" || result.overallCondition === "critical" ? "high" : "medium",
      });

      result.complaintCreated = true;
      result.complaintId = complaint._id;
    }
  }

  // Update schedule's lastExecutedDate
  if (updates.status === "completed") {
    await InspectionSchedule.findByIdAndUpdate(result.scheduleId, {
      lastExecutedDate: new Date(),
    });
  }

  await result.save();
  return NextResponse.json(result.toObject());
}
