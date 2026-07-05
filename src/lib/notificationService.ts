import { connectDB } from "@/lib/mongodb";
import Notification from "@/lib/database/models/Notification";

export async function createNotification(
  userId: string,
  type: "status_change" | "assigned" | "resolved" | "new_complaint" | "sla_breach",
  title: string,
  message: string,
  complaintId?: string,
  link?: string
): Promise<void> {
  try {
    await connectDB();
    await Notification.create({
      userId,
      type,
      title,
      message,
      complaintId,
      link,
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
}
