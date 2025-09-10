// Cart.ts
import mongoose, { Schema, Document } from "mongoose";

export interface ICartItem extends Document {
  user: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  quantity: number;
}

const CartSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, default: 1 },
}, { timestamps: true });

export default mongoose.models.Cart || mongoose.model<ICartItem>("Cart", CartSchema);
