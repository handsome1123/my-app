import mongoose, { Schema, model, models, Document } from "mongoose";

// TypeScript interface for Product
export interface ProductDocument extends Document {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  stock: number;
  sellerId: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<ProductDocument>(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    imageUrl: { type: String },
    stock: { type: Number, default: 0 },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Product = models.Product || model<ProductDocument>("Product", productSchema);
