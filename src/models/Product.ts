import mongoose, { Schema, model, models, Document } from "mongoose";

// TypeScript interface for Product
export interface ProductDocument extends Document {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  stock: number;
  sellerId: mongoose.Schema.Types.ObjectId;
  status: "pending" | "approved" | "rejected" | "active" | "inactive" | "suspended";
  moderatedBy?: mongoose.Schema.Types.ObjectId;
  moderatedAt?: Date;
  moderationReason?: string;
  rejectionReason?: string;
  category?: string;
  condition?: "new" | "like_new" | "good" | "fair" | "poor";
  tags?: string[];
  isFeatured?: boolean;
  viewCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<ProductDocument>(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true, min: 0 },
    imageUrl: { type: String },
    stock: { type: Number, default: 0, min: 0 },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "active", "inactive", "suspended"],
      default: "pending"
    },
    moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    moderatedAt: { type: Date },
    moderationReason: { type: String },
    rejectionReason: { type: String },
    category: {
      type: String,
      enum: ["textbooks", "electronics", "furniture", "clothing", "sporting", "dorm_essentials", "other"],
      default: "other"
    },
    condition: {
      type: String,
      enum: ["new", "like_new", "good", "fair", "poor"],
      default: "good"
    },
    tags: [{ type: String }],
    isFeatured: { type: Boolean, default: false },
    viewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Indexes for better query performance
productSchema.index({ status: 1, createdAt: -1 });
productSchema.index({ sellerId: 1, status: 1 });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ price: 1, status: 1 });

export const Product = models.Product || model<ProductDocument>("Product", productSchema);
