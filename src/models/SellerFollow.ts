import mongoose, { Schema, model, models, Document } from "mongoose";

export interface SellerFollowDocument extends Document {
  followerId: mongoose.Schema.Types.ObjectId; // User who is following
  sellerId: mongoose.Schema.Types.ObjectId; // Seller being followed
  createdAt: Date;
}

const sellerFollowSchema = new Schema<SellerFollowDocument>(
  {
    followerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate follows
sellerFollowSchema.index({ followerId: 1, sellerId: 1 }, { unique: true });

export const SellerFollow = models.SellerFollow || model<SellerFollowDocument>("SellerFollow", sellerFollowSchema);