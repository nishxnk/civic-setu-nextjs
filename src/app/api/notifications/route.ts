import { NextRequest, NextResponse } from "next/server";
import { authenticate, isError } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Notification from "@/lib/database/models/Notification";

export async function GET(request: NextRequest) {
  await connectDB();
  const auth = await authenticate(request);
  if (isError(auth)) return auth;

  try {
    const { searchParams } = request.nextUrl;
    const unreadOnly = searchParams.get("unread") === "true";
    const limit = parseInt(searchParams.get("limit") || "50");

    const query: Record<string, unknown> = {
      userId: auth.user._id,
    };
    if (unreadOnly) query.read = false;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const unreadCount = await Notification.countDocuments({
      userId: auth.user._id,
      read: false,
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error("Get notifications error:", error);
    return NextResponse.json(
      { message: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  await connectDB();
  const auth = await authenticate(request);
  if (isError(auth)) return auth;

  try {
    const body = await request.json();
    const { ids, markAllRead } = body;

    if (markAllRead) {
      await Notification.updateMany(
        { userId: auth.user._id, read: false },
        { $set: { read: true } }
      );
    } else if (ids && Array.isArray(ids)) {
      await Notification.updateMany(
        { _id: { $in: ids }, userId: auth.user._id },
        { $set: { read: true } }
      );
    }

    return NextResponse.json({ message: "Updated" });
  } catch (error) {
    console.error("Update notifications error:", error);
    return NextResponse.json(
      { message: "Failed to update notifications" },
      { status: 500 }
    );
  }
}
