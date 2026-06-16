import mongoose from "mongoose";
import { IComplaintDocument } from "@/types/mongoose";

const complaintSchema = new mongoose.Schema<IComplaintDocument>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["road", "lighting", "water", "sanitation", "traffic", "other"],
      required: true,
    },
    department: {
      type: String,
      enum: ["pwd", "electricity", "water", "sanitation", "traffic", "parks"],
      required: true,
    },
    location: {
      address: { type: String, required: true },
      latitude: { type: Number },
      longitude: { type: Number },
    },
    citizen: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "resolved", "rejected"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    attachments: [{ type: String }],
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    trackingNumber: { type: String, unique: true },
    resolutionNotes: { type: String },
    resolutionDate: { type: Date },
  },
  { timestamps: true }
);

complaintSchema.pre("save", function () {
  if (!this.trackingNumber) {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    this.trackingNumber = `CIV-${year}-${random}`;
  }
});

const Complaint =
  mongoose.models.Complaint ||
  mongoose.model<IComplaintDocument>("Complaint", complaintSchema);

export default Complaint;
