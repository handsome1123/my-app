// @/models/Product.ts

import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  price: number;
  description?: string;
  imageUrl: string;
  category?: string;
  stock?: number;
  owner: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [100, 'Product name cannot exceed 100 characters']
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    imageUrl: {
      type: String,
      required: [true, 'Product image is required']
    },
    category: {
      type: String,
      trim: true,
      default: 'uncategorized'
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'Stock cannot be negative']
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Product owner is required']
    }
  },
  {
    timestamps: true, // This adds createdAt and updatedAt automatically
  }
);

// Add indexes for better performance
ProductSchema.index({ owner: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ name: 'text', description: 'text' });

// Prevent re-compilation during development
export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);