import { NextRequest, NextResponse } from "next/server";
import { authenticate, isError, requireAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Asset from "@/lib/database/models/Asset";

export async function GET(request: NextRequest) {
  await connectDB();
  const auth = await authenticate(request);
  if (isError(auth)) return auth;

  const { searchParams } = request.nextUrl;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const category = searchParams.get("category");
  const status = searchParams.get("status");
  const department = searchParams.get("department");
  const search = searchParams.get("search");

  const query: Record<string, unknown> = {};
  if (category) query.category = category;
  if (status) query.status = status;
  if (department) query.department = department;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { assetCode: { $regex: search, $options: "i" } },
      { "location.address": { $regex: search, $options: "i" } },
    ];
  }

  const total = await Asset.countDocuments(query);
  const assets = await Asset.find(query)
    .sort({ updatedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return NextResponse.json({ assets, total, totalPages: Math.ceil(total / limit), currentPage: page });
}

export async function POST(request: NextRequest) {
  await connectDB();
  const auth = await requireAdmin(request);
  if (isError(auth)) return auth;

  const body = await request.json();
  const asset = await Asset.create(body);
  return NextResponse.json(asset, { status: 201 });
}
