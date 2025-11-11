import mongoose, { Schema, model, models, Document } from "mongoose";

export interface LoyaltyPointsDocument extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  totalPoints: number; // Current balance
  lifetimePoints: number; // Total points earned ever
  level: number; // Loyalty tier (1-5)
  levelName: string; // Bronze, Silver, Gold, Platinum, Diamond
  nextLevelThreshold: number; // Points needed for next level
  transactions: {
    type: "earned" | "redeemed" | "expired";
    points: number;
    reason: string;
    orderId?: mongoose.Schema.Types.ObjectId;
    expiresAt?: Date;
    createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const loyaltyPointsSchema = new Schema<LoyaltyPointsDocument>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    totalPoints: { type: Number, default: 0 },
    lifetimePoints: { type: Number, default: 0 },
    level: { type: Number, default: 1, min: 1, max: 5 },
    levelName: { type: String, default: "Bronze" },
    nextLevelThreshold: { type: Number, default: 100 },
    transactions: [{
      type: {
        type: String,
        enum: ["earned", "redeemed", "expired"],
        required: true
      },
      points: { type: Number, required: true },
      reason: { type: String, required: true },
      orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
      expiresAt: Date,
      createdAt: { type: Date, default: Date.now }
    }]
  },
  { timestamps: true }
);

// Index for efficient queries
loyaltyPointsSchema.index({ userId: 1 });
loyaltyPointsSchema.index({ totalPoints: -1 });
loyaltyPointsSchema.index({ "transactions.expiresAt": 1 });

export const LoyaltyPoints = models.LoyaltyPoints || model<LoyaltyPointsDocument>("LoyaltyPoints", loyaltyPointsSchema);