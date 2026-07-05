import { NextRequest, NextResponse } from "next/server";
import { authenticate, isError } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Complaint from "@/models/Complaint";
import { createNotification } from "@/lib/notificationService";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const auth = await authenticate(request);
  if (isError(auth)) return auth;

  if (auth.user.role !== "worker" && auth.user.role !== "admin") {
    return NextResponse.json(
      { message: "Access denied" },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { status, resolutionNotes, attachments } = body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return NextResponse.json(
        { message: "Task not found" },
        { status: 404 }
      );
    }

    if (complaint.assignedTo?.toString() !== auth.user._id.toString() && auth.user.role !== "admin") {
      return NextResponse.json(
        { message: "Not assigned to you" },
        { status: 403 }
      );
    }

    // Update fields
    if (status) complaint.status = status;
    if (resolutionNotes) complaint.resolutionNotes = resolutionNotes;
    if (attachments && Array.isArray(attachments)) {
      complaint.attachments = [...(complaint.attachments || []), ...attachments];
    }
    if (status === "resolved") {
      complaint.resolutionDate = new Date();
    }

    await complaint.save();

    // Notify citizen
    const citizen = await import("@/models/User").then((m) =>
      m.default.findOne({ email: complaint.citizen.email })
    );
    if (citizen) {
      await createNotification(
        citizen._id.toString(),
        status === "resolved" ? "resolved" : "status_change",
        `Complaint ${status === "resolved" ? "Resolved" : "Updated"}`,
        `Your complaint "${complaint.title}" has been ${status === "resolved" ? "resolved" : "updated to " + status}.`,
        complaint._id.toString(),
        `/citizen/complaints`
      );
    }

    return NextResponse.json({ task: complaint.toObject() });
  } catch (error) {
    console.error("Task update error:", error);
    return NextResponse.json(
      { message: "Failed to update task" },
      { status: 500 }
    );
  }
}
