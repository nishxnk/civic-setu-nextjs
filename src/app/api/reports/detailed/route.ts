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
    const format = searchParams.get("format") || "json";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const filter: Record<string, unknown> = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) (filter.createdAt as Record<string, unknown>).$gte = new Date(startDate);
      if (endDate) (filter.createdAt as Record<string, unknown>).$lte = new Date(endDate);
    }

    const complaints = await Complaint.find(filter)
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    if (format === "csv") {
      const header = "Tracking#,Title,Category,Status,Priority,Citizen,Department,Date\n";
      const rows = complaints
        .map((c) =>
          [
            c.trackingNumber,
            `"${c.title.replace(/"/g, '""')}"`,
            c.category,
            c.status,
            c.priority,
            c.citizen.name,
            c.department,
            c.createdAt?.toISOString().split("T")[0],
          ].join(",")
        )
        .join("\n");

      return new NextResponse(header + rows, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": 'attachment; filename="complaints-report.csv"',
        },
      });
    }

    return NextResponse.json({ complaints, total: complaints.length });
  } catch (error) {
    console.error("Detailed report error:", error);
    return NextResponse.json({ message: "Failed" }, { status: 500 });
  }
}
