import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IOrder extends Document {
  product: Types.ObjectId;
  buyer: Types.ObjectId;
  quantity: number;
  buyerName: string;
  buyerEmail: string;
  buyerAddress: string;
  buyerPhone: string;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
}

const OrderSchema: Schema<IOrder> = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    buyer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    quantity: { type: Number, default: 1 },
    buyerName: { type: String, required: true },
    buyerEmail: { type: String, required: true },
    buyerAddress: { type: String, required: true },
    buyerPhone: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
