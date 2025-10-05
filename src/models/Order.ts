// models/Order.ts - Your Order model schema structure

import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  buyerId: mongoose.Types.ObjectId;
  sellerId?: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  quantity: number;
  totalPrice: number; // NOT totalAmount
  status: "pending_payment" | "paid" | "confirmed" | "shipped" | "delivered" | "cancelled" | "rejected";
  stripePaymentIntentId?: string;
  stripeSessionId?: string;
  shippingAddress: { // NOT customerInfo
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
  };
  createdAt: Date;
  paidAt?: Date;
  updatedAt?: Date;
}

const OrderSchema = new Schema<IOrder>({
  buyerId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Buyer ID is required"],
  },
  sellerId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  productId: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  totalPrice: { // Make sure it's totalPrice
    type: Number,
    required: [true, "Total price is required"],
  },
  status: {
    type: String,
    enum: ["pending_payment", "paid", "confirmed", "shipped", "delivered", "cancelled", "rejected"],
    default: "pending_payment",
  },
  stripePaymentIntentId: String,
  stripeSessionId: String,
  shippingAddress: { // Make sure it's shippingAddress
    firstName: {
      type: String,
      required: [true, "First name is required"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
    },
    state: {
      type: String,
      required: [true, "State is required"],
    },
    zipCode: {
      type: String,
      required: [true, "Zip code is required"],
    },
    country: {
      type: String,
      default: "Thailand",
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  paidAt: Date,
  updatedAt: Date,
});

export const Order = mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);