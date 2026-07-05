import mongoose from "mongoose";

export interface IInspectionScheduleDocument extends mongoose.Document {
  title: string;
  description: string;
  department: string;
  category: string;
  frequency: "daily" | "weekly" | "biweekly" | "monthly" | "quarterly" | "biannual" | "annual";
  checklist: Array<{
    task: string;
    required: boolean;
  }>;
  assignedWorkers: mongoose.Types.ObjectId[];
  assets: mongoose.Types.ObjectId[];
  ward?: string;
  zone?: string;
  isActive: boolean;
  lastExecutedDate?: Date;
  nextScheduledDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const inspectionScheduleSchema = new mongoose.Schema<IInspectionScheduleDocument>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    department: { type: String, required: true },
    category: {
      type: String,
      enum: ["road", "lighting", "water", "sanitation", "drainage", "parks", "general"],
      required: true,
    },
    frequency: {
      type: String,
      enum: ["daily", "weekly", "biweekly", "monthly", "quarterly", "biannual", "annual"],
      required: true,
    },
    checklist: [{
      task: { type: String, required: true },
      required: { type: Boolean, default: true },
    }],
    assignedWorkers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    assets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Asset" }],
    ward: { type: String },
    zone: { type: String },
    isActive: { type: Boolean, default: true },
    lastExecutedDate: { type: Date },
    nextScheduledDate: { type: Date, required: true },
  },
  { timestamps: true }
);

const InspectionSchedule =
  mongoose.models.InspectionSchedule ||
  mongoose.model<IInspectionScheduleDocument>("InspectionSchedule", inspectionScheduleSchema);

export default InspectionSchedule;
