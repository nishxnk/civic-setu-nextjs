import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, isError } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { createFirebaseUser } from "@/lib/firebase-admin";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  await connectDB();
  const auth = await requireAdmin(request);
  if (isError(auth)) return auth;

  try {
    const { email, password, name, role } = await request.json();

    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { message: "Email, password, name, and role are required" },
        { status: 400 }
      );
    }

    // Check if user already exists in MongoDB
    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { message: "A user with this email already exists" },
        { status: 409 }
      );
    }

    // Create Firebase Auth user
    let firebaseUid: string;
    try {
      const fbUser = await createFirebaseUser(email, password, name);
      firebaseUid = fbUser.uid;
    } catch (fbError: unknown) {
      const code = (fbError as { code?: string }).code;
      if (code === "auth/email-already-exists") {
        return NextResponse.json(
          { message: "This email is already registered in Firebase" },
          { status: 409 }
        );
      }
      console.error("Firebase user creation error:", fbError);
      return NextResponse.json(
        { message: "Failed to create user account" },
        { status: 500 }
      );
    }

    // Create MongoDB user with admin-specified role
    const user = await User.create({
      firebaseUid,
      name,
      email,
      role,
      authProvider: "email",
    });

    return NextResponse.json(
      {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin create user error:", error);
    return NextResponse.json(
      { message: "Failed to create user" },
      { status: 500 }
    );
  }
}
