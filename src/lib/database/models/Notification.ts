import mongoose from "mongoose";

export interface INotificationDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  type: "status_change" | "assigned" | "resolved" | "new_complaint" | "sla_breach";
  title: string;
  message: string;
  complaintId?: mongoose.Types.ObjectId;
  read: boolean;
  link?: string;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new mongoose.Schema<INotificationDocument>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["status_change", "assigned", "resolved", "new_complaint", "sla_breach"],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    complaintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
    },
    read: { type: Boolean, default: false, index: true },
    link: { type: String },
  },
  { timestamps: true }
);

const Notification =
  mongoose.models.Notification ||
  mongoose.model<INotificationDocument>("Notification", notificationSchema);

export default Notification;
