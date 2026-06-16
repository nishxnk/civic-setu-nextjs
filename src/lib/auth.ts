import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { verifyIdToken } from "./firebase-admin";
import UserModel from "@/models/User";
import { IUserDocument } from "@/types/mongoose";

export type AuthSuccess = { user: IUserDocument };
export type AuthResult = AuthSuccess | NextResponse;

function isError(result: AuthResult): result is NextResponse {
  return result instanceof NextResponse;
}

/**
 * Verify the Firebase ID token (or legacy JWT) from Authorization header.
 * Returns { user } on success, or a NextResponse error to return directly.
 */
export async function authenticate(
  request: NextRequest
): Promise<AuthResult> {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { message: "Not authorized, no token provided" },
      { status: 401 }
    );
  }

  const token = authHeader.split(" ")[1];

  try {
    // Primary: Firebase Admin verification
    try {
      const decoded = await verifyIdToken(token);

      // Find or create MongoDB user
      let user = await UserModel.findOne({ firebaseUid: decoded.uid });

      if (!user) {
        user = await UserModel.create({
          firebaseUid: decoded.uid,
          name: decoded.name || decoded.email?.split("@")[0] || "User",
          email: decoded.email || "",
          role: "citizen",
          authProvider: decoded.firebase?.sign_in_provider === "google.com"
            ? "google" : "email",
        });
      }

      return { user: user.toObject() as unknown as IUserDocument };

    } catch {
      // Fallback: Legacy JWT
      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET_KEY!
        ) as { user: { id: string; role: string } };

        const user = await UserModel.findById(decoded.user.id).select(
          "-password"
        );

        if (!user) {
          return NextResponse.json(
            { message: "User not found" },
            { status: 401 }
          );
        }

        return { user: user.toObject() as unknown as IUserDocument };
      } catch {
        return NextResponse.json(
          { message: "Not authorized, token invalid" },
          { status: 401 }
        );
      }
    }
  } catch (err) {
    console.error("Auth error:", err);
    return NextResponse.json(
      { message: "Authentication error" },
      { status: 500 }
    );
  }
}

/**
 * authenticate() + admin role check.
 * Use for admin-only routes.
 */
export async function requireAdmin(
  request: NextRequest
): Promise<AuthResult> {
  const result = await authenticate(request);

  if (isError(result)) return result;
  if (result.user.role !== "admin") {
    return NextResponse.json(
      { message: "Access denied. Admin role required." },
      { status: 403 }
    );
  }

  return result;
}

export { isError };
