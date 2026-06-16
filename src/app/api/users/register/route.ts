import { NextRequest, NextResponse } from "next/server";
import { verifyIdToken } from "@/lib/firebase-admin";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    const { idToken, name } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { message: "Firebase ID token is required" },
        { status: 400 }
      );
    }

    await connectDB();
    const decoded = await verifyIdToken(idToken);
    const { uid, email } = decoded;
    const authProvider =
      decoded.firebase?.sign_in_provider === "google.com" ? "google" : "email";

    let user = await User.findOne({ $or: [{ firebaseUid: uid }, { email }] });

    if (user) {
      if (!user.firebaseUid) {
        user.firebaseUid = uid;
        user.authProvider = authProvider;
        await user.save();
      }
    } else {
      user = await User.create({
        firebaseUid: uid,
        name: name || decoded.name || email?.split("@")[0] || "User",
        email: email || "",
        role: "citizen",
        authProvider,
        photoURL: decoded.picture || "",
      });
    }

    return NextResponse.json(
      {
        user: {
          _id: user._id,
          firebaseUid: user.firebaseUid,
          name: user.name,
          email: user.email,
          role: user.role,
          authProvider: user.authProvider,
          photoURL: user.photoURL,
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("Register error:", err);
    const code = (err as { code?: string }).code;
    if (code === "auth/id-token-expired") {
      return NextResponse.json(
        { message: "Session expired. Please log in again." },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { message: "Registration failed" },
      { status: 500 }
    );
  }
}
