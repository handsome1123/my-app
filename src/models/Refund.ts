// models/Refund.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IRefund extends Document {
  orderId: mongoose.Types.ObjectId;
  buyerId: mongoose.Types.ObjectId;
  sellerId?: mongoose.Types.ObjectId;
  requestedAmount: number;
  approvedAmount?: number;
  currency: string;
  reason: string;
  details?: string;
  evidenceUrls?: string[];
  status: "pending" | "approved" | "rejected" | "processed" | "failed";
  stripeRefundId?: string;
  refundedAt?: Date;
  rejectedAt?: Date;
  rejectReason?: string;
  processedAt?: Date;
  lastError?: string;
  lastErrorAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RefundSchema = new Schema<IRefund>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    requestedAmount: {
      type: Number,
      required: true,
    },
    approvedAmount: Number,
    currency: {
      type: String,
      default: "THB",
    },
    reason: {
      type: String,
      required: true,
    },
    details: String,
    evidenceUrls: [String],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "processed", "failed"],
      default: "pending",
    },
    stripeRefundId: String,
    refundedAt: Date,
    rejectedAt: Date,
    rejectReason: String,
    processedAt: Date,
    lastError: String,
    lastErrorAt: Date,
  },
  { timestamps: true }
);

export const Refund = mongoose.models.Refund || mongoose.model<IRefund>("Refund", RefundSchema);