import { NextRequest, NextResponse } from "next/server";
import { authenticate, isError } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Complaint from "@/models/Complaint";

export async function GET(request: NextRequest) {
  await connectDB();
  const auth = await authenticate(request);
  if (isError(auth)) return auth;

  try {
    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const query: Record<string, unknown> = { "citizen.email": auth.user.email };
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { trackingNumber: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({ complaints, total, totalPages: Math.ceil(total / limit), currentPage: page });
  } catch (error) {
    console.error("Citizen complaints error:", error);
    return NextResponse.json({ message: "Failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  await connectDB();
  const auth = await authenticate(request);
  if (isError(auth)) return auth;

  try {
    const body = await request.json();
    const complaint = await Complaint.create({
      ...body,
      citizen: {
        name: auth.user.name,
        email: auth.user.email,
        phone: body.phone || "",
      },
    });
    return NextResponse.json(complaint, { status: 201 });
  } catch (error) {
    console.error("Create complaint error:", error);
    return NextResponse.json({ message: "Failed" }, { status: 500 });
  }
}
