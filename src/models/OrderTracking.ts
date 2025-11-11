import mongoose, { Schema, model, models, Document } from "mongoose";

export interface OrderTrackingDocument extends Document {
  orderId: mongoose.Schema.Types.ObjectId;
  status: "pending_payment" | "paid" | "confirmed" | "shipped" | "delivered" | "cancelled" | "rejected";
  message: string;
  location?: string; // For shipping updates
  carrier?: string; // Shipping carrier name
  trackingNumber?: string; // Tracking number
  estimatedDelivery?: Date;
  isActive: boolean; // Current active status
  createdAt: Date;
  updatedAt: Date;
}

const orderTrackingSchema = new Schema<OrderTrackingDocument>(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    status: {
      type: String,
      enum: ["pending_payment", "paid", "confirmed", "shipped", "delivered", "cancelled", "rejected"],
      required: true
    },
    message: { type: String, required: true },
    location: String,
    carrier: String,
    trackingNumber: String,
    estimatedDelivery: Date,
    isActive: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Compound index for efficient queries
orderTrackingSchema.index({ orderId: 1, createdAt: -1 });
orderTrackingSchema.index({ orderId: 1, isActive: 1 });

export const OrderTracking = models.OrderTracking || model<OrderTrackingDocument>("OrderTracking", orderTrackingSchema);