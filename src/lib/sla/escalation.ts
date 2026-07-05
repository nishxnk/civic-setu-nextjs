import { connectDB } from "@/lib/mongodb";
import Complaint from "@/models/Complaint";
import Notification from "@/lib/database/models/Notification";
import User from "@/models/User";

/**
 * Run SLA check — find all breached complaints and escalate.
 * This should be called by a cron job (e.g., every 15 minutes).
 */
export async function runSlaCheck(): Promise<{
  checked: number;
  breached: number;
  escalated: number;
}> {
  await connectDB();

  const now = new Date();

  // Find pending/in-progress complaints past their SLA deadline
  const breachedComplaints = await Complaint.find({
    status: { $in: ["pending", "in-progress"] },
    slaDeadline: { $lt: now },
    slaBreached: { $ne: true },
  });

  let escalated = 0;

  for (const complaint of breachedComplaints) {
    complaint.slaBreached = true;
    complaint.escalationLevel = (complaint.escalationLevel || 0) + 1;
    await complaint.save();

    // Notify assigned worker
    if (complaint.assignedTo) {
      await Notification.create({
        userId: complaint.assignedTo,
        type: "sla_breach",
        title: "SLA Breach — Task Overdue",
        message: `"${complaint.title}" has exceeded its resolution deadline.`,
        complaintId: complaint._id,
        link: `/worker/dashboard`,
      });
    }

    // Notify all admins
    const admins = await User.find({ role: "admin" }).select("_id");
    for (const admin of admins) {
      await Notification.create({
        userId: admin._id,
        type: "sla_breach",
        title: "SLA Breach Alert",
        message: `Complaint "${complaint.title}" (#${complaint.trackingNumber}) has breached SLA.`,
        complaintId: complaint._id,
        link: `/admin/complaints/${complaint._id}`,
      });
    }

    escalated++;
  }

  // Mark already-breached complaints that passed deadline again (still unresolved)
  const escalatedCount = await Complaint.countDocuments({
    status: { $in: ["pending", "in-progress"] },
    slaDeadline: { $lt: now },
    slaBreached: true,
  });

  return {
    checked: await Complaint.countDocuments({
      status: { $in: ["pending", "in-progress"] },
    }),
    breached: escalatedCount,
    escalated,
  };
}
