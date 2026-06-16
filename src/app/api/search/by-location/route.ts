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
    const lat = parseFloat(searchParams.get("lat") || "0");
    const lng = parseFloat(searchParams.get("lng") || "0");
    const radius = parseFloat(searchParams.get("radius") || "5");

    // Approximate bounding box (0.01 deg ≈ 1.1 km)
    const degPerKm = 0.009;
    const latDelta = radius * degPerKm;
    const lngDelta = radius * degPerKm;

    const complaints = await Complaint.find({
      "location.latitude": { $gte: lat - latDelta, $lte: lat + latDelta },
      "location.longitude": { $gte: lng - lngDelta, $lte: lng + lngDelta },
    }).limit(50);

    return NextResponse.json({ complaints });
  } catch (error) {
    console.error("Location search error:", error);
    return NextResponse.json({ message: "Failed" }, { status: 500 });
  }
}
