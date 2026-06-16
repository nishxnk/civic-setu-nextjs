import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    await connectDB();

    const user = await User.findOne({ email }).select("+password");
    if (!user || !user.password) {
      return NextResponse.json(
        {
          message:
            "This account uses Google or Firebase sign-in. Please use the new login.",
        },
        { status: 400 }
      );
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 400 }
      );
    }

    const payload = { user: { id: user._id, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY!, {
      expiresIn: "24h",
    });

    return NextResponse.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.error("Legacy login error:", err);
    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}
