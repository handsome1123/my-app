import mongoose, { Schema, model, models, Document } from "mongoose";

export interface LoyaltyRewardDocument extends Document {
  title: string;
  description: string;
  pointsRequired: number;
  rewardType: "discount" | "free_shipping" | "bonus_points" | "exclusive_access" | "physical_item";
  discountValue?: number; // For discount rewards (percentage or fixed amount)
  discountType?: "percentage" | "fixed"; // Type of discount
  maxUses?: number; // Maximum number of redemptions allowed
  currentUses: number; // Current number of redemptions
  isActive: boolean;
  validUntil?: Date;
  minimumLevel: number; // Minimum loyalty level required
  category: string; // e.g., "shopping", "shipping", "exclusive"
  imageUrl?: string;
  terms: string; // Terms and conditions
  createdAt: Date;
  updatedAt: Date;
}

const loyaltyRewardSchema = new Schema<LoyaltyRewardDocument>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    pointsRequired: { type: Number, required: true, min: 0 },
    rewardType: {
      type: String,
      enum: ["discount", "free_shipping", "bonus_points", "exclusive_access", "physical_item"],
      required: true
    },
    discountValue: Number,
    discountType: {
      type: String,
      enum: ["percentage", "fixed"]
    },
    maxUses: Number,
    currentUses: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    validUntil: Date,
    minimumLevel: { type: Number, default: 1, min: 1, max: 5 },
    category: { type: String, required: true },
    imageUrl: String,
    terms: { type: String, required: true }
  },
  { timestamps: true }
);

// Indexes for efficient queries
loyaltyRewardSchema.index({ isActive: 1, pointsRequired: 1 });
loyaltyRewardSchema.index({ rewardType: 1, category: 1 });

export const LoyaltyReward = models.LoyaltyReward || model<LoyaltyRewardDocument>("LoyaltyReward", loyaltyRewardSchema);