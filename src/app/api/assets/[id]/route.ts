import { NextRequest, NextResponse } from "next/server";
import { authenticate, isError } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Asset from "@/lib/database/models/Asset";
import Complaint from "@/models/Complaint";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const auth = await authenticate(request);
  if (isError(auth)) return auth;

  const { id } = await params;
  const asset = await Asset.findById(id).lean();
  if (!asset) return NextResponse.json({ message: "Asset not found" }, { status: 404 });

  // Also fetch linked complaints
  const complaints = await Complaint.find({ assetId: id })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  return NextResponse.json({ asset, complaints });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const auth = await authenticate(request);
  if (isError(auth)) return auth;

  const { id } = await params;
  const body = await request.json();

  // Add to maintenance history if maintenance performed
  if (body.maintenanceUpdate) {
    const asset = await Asset.findById(id);
    if (asset) {
      asset.maintenanceHistory.push({
        date: new Date(),
        type: body.maintenanceUpdate.type || "maintenance",
        description: body.maintenanceUpdate.description || "",
      });
      asset.lastMaintenanceDate = new Date();
      if (body.maintenanceUpdate.condition) asset.condition = body.maintenanceUpdate.condition;
      await asset.save();
      return NextResponse.json(asset.toObject());
    }
  }

  const asset = await Asset.findByIdAndUpdate(id, body, { new: true }).lean();
  if (!asset) return NextResponse.json({ message: "Asset not found" }, { status: 404 });
  return NextResponse.json(asset);
}
