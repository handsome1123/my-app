// models/Product.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  price: number;
  owner: mongoose.Types.ObjectId;
  imageUrl?: string; // ✅ Add this
}

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  imageUrl: { type: String }, // ✅ Add this
});

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
