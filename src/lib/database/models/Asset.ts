import mongoose from "mongoose";

export interface IAssetDocument extends mongoose.Document {
  name: string;
  assetCode: string;
  category: "road" | "streetlight" | "water_pipe" | "manhole" | "park" | "building" | "drain" | "other";
  subcategory?: string;
  description: string;
  location: {
    address: string;
    latitude?: number;
    longitude?: number;
    ward?: string;
    zone?: string;
  };
  status: "active" | "under_maintenance" | "damaged" | "decommissioned";
  condition: "excellent" | "good" | "fair" | "poor" | "critical";
  department: string;
  installedDate?: Date;
  lastInspectedDate?: Date;
  lastMaintenanceDate?: Date;
  qrCode?: string;
  specifications?: Record<string, string>;
  attachments: string[];
  maintenanceHistory: Array<{
    date: Date;
    type: string;
    description: string;
    complaintId?: mongoose.Types.ObjectId;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const assetSchema = new mongoose.Schema<IAssetDocument>(
  {
    name: { type: String, required: true, trim: true },
    assetCode: { type: String, required: true, unique: true },
    category: {
      type: String,
      enum: ["road", "streetlight", "water_pipe", "manhole", "park", "building", "drain", "other"],
      required: true,
    },
    subcategory: { type: String },
    description: { type: String, default: "" },
    location: {
      address: { type: String, required: true },
      latitude: { type: Number },
      longitude: { type: Number },
      ward: { type: String },
      zone: { type: String },
    },
    status: {
      type: String,
      enum: ["active", "under_maintenance", "damaged", "decommissioned"],
      default: "active",
    },
    condition: {
      type: String,
      enum: ["excellent", "good", "fair", "poor", "critical"],
      default: "good",
    },
    department: { type: String, required: true },
    installedDate: { type: Date },
    lastInspectedDate: { type: Date },
    lastMaintenanceDate: { type: Date },
    qrCode: { type: String },
    specifications: { type: Map, of: String },
    attachments: [{ type: String }],
    maintenanceHistory: [{
      date: { type: Date, default: Date.now },
      type: { type: String },
      description: { type: String },
      complaintId: { type: mongoose.Schema.Types.ObjectId, ref: "Complaint" },
    }],
  },
  { timestamps: true }
);

// Auto-generate asset code
assetSchema.pre("save", function () {
  if (!this.assetCode) {
    const prefix = this.category.substring(0, 3).toUpperCase();
    const year = new Date().getFullYear().toString().slice(-2);
    const random = Math.floor(1000 + Math.random() * 9000);
    this.assetCode = `AST-${prefix}-${year}-${random}`;
  }
});

const Asset =
  mongoose.models.Asset ||
  mongoose.model<IAssetDocument>("Asset", assetSchema);

export default Asset;
