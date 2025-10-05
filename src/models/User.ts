// models/User.ts
import { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    address: { type: String },
    password: { type: String, required: false }, // ✅ make optional
    role: { type: String, enum: ["buyer", "seller", "admin"], default: "buyer" },
     provider: { type: String, enum: ["credentials", "google"], default: "credentials" },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    verificationTokenExpires: { type: Date },
  },
  { timestamps: true }
);

export const User = models.User || model("User", UserSchema);
