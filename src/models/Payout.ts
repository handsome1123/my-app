// models/Payout.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IPayout extends Document {
  orderId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  grossAmount: number;
  commission: number;
  netAmount: number;
  currency: string;
  status: "pending" | "processing" | "paid" | "canceled" | "failed" | "retrying";
  paidAt?: Date;
  canceledAt?: Date;
  cancelReason?: string;
  transferId?: string;
  lastError?: string;
  lastErrorAt?: Date;
  retryCount?: number;
  nextRetryAt?: Date;
  processedBy?: mongoose.Types.ObjectId;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PayoutSchema = new Schema<IPayout>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    grossAmount: {
      type: Number,
      required: true,
    },
    commission: {
      type: Number,
      required: true,
    },
    netAmount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "THB",
    },
    status: {
      type: String,
      enum: ["pending", "processing", "paid", "canceled", "failed", "retrying"],
      default: "pending",
    },
    paidAt: Date,
    canceledAt: Date,
    cancelReason: String,
    transferId: String,
    lastError: String,
    lastErrorAt: Date,
    retryCount: {
      type: Number,
      default: 0,
    },
    nextRetryAt: Date,
    processedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    processedAt: Date,
  },
  { timestamps: true }
);

export const Payout = mongoose.models.Payout || mongoose.model<IPayout>("Payout", PayoutSchema);