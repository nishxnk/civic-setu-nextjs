import mongoose from "mongoose";

export interface IInspectionResultDocument extends mongoose.Document {
  scheduleId: mongoose.Types.ObjectId;
  workerId: mongoose.Types.ObjectId;
  assetId?: mongoose.Types.ObjectId;
  status: "in-progress" | "completed" | "missed";
  location: {
    address: string;
    latitude?: number;
    longitude?: number;
  };
  checklist: Array<{
    task: string;
    completed: boolean;
    finding?: "ok" | "issue_found" | "needs_attention";
    notes?: string;
    photo?: string;
  }>;
  overallCondition: "excellent" | "good" | "fair" | "poor" | "critical";
  notes?: string;
  photos: string[];
  issuesFound: number;
  complaintCreated: boolean;
  complaintId?: mongoose.Types.ObjectId;
  startedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const inspectionResultSchema = new mongoose.Schema<IInspectionResultDocument>(
  {
    scheduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InspectionSchedule",
      required: true,
    },
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
    },
    status: {
      type: String,
      enum: ["in-progress", "completed", "missed"],
      default: "in-progress",
    },
    location: {
      address: { type: String, required: true },
      latitude: { type: Number },
      longitude: { type: Number },
    },
    checklist: [{
      task: { type: String, required: true },
      completed: { type: Boolean, default: false },
      finding: {
        type: String,
        enum: ["ok", "issue_found", "needs_attention"],
      },
      notes: { type: String },
      photo: { type: String },
    }],
    overallCondition: {
      type: String,
      enum: ["excellent", "good", "fair", "poor", "critical"],
    },
    notes: { type: String },
    photos: [{ type: String }],
    issuesFound: { type: Number, default: 0 },
    complaintCreated: { type: Boolean, default: false },
    complaintId: { type: mongoose.Schema.Types.ObjectId, ref: "Complaint" },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

const InspectionResult =
  mongoose.models.InspectionResult ||
  mongoose.model<IInspectionResultDocument>("InspectionResult", inspectionResultSchema);

export default InspectionResult;
