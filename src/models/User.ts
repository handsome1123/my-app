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
    notificationsCount: { type: Number, default: 0 },
    unreadNotifications: { type: Number, default: 0 },
    // Shipping addresses for returning customers
    shippingAddresses: [{
      firstName: { type: String },
      lastName: { type: String },
      email: { type: String },
      phone: { type: String },
      address: { type: String },
      city: { type: String },
      state: { type: String },
      zipCode: { type: String },
      country: { type: String, default: "Thailand" },
      isDefault: { type: Boolean, default: false },
      label: { type: String, default: "Home" }, // Home, Work, etc.
      createdAt: { type: Date, default: Date.now }
    }],
  },
  { timestamps: true }
);

export const User = models.User || model("User", UserSchema);
