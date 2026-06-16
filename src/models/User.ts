import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { IUserDocument, IUserModel } from "@/types/mongoose";

const userSchema = new mongoose.Schema<IUserDocument>(
  {
    firebaseUid: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+\@.+\..+/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: false,
      select: false,
    },
    role: {
      type: String,
      enum: ["citizen", "worker", "admin"],
      default: "citizen",
    },
    photoURL: { type: String },
    authProvider: {
      type: String,
      enum: ["email", "google", "legacy"],
      default: "email",
    },
    phone: { type: String },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (
  enteredPassword: string
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(enteredPassword, this.password);
};

const User =
  (mongoose.models.User as IUserModel) ||
  mongoose.model<IUserDocument, IUserModel>("User", userSchema);

export default User;
