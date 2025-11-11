import mongoose, { Schema, model, models, Document } from "mongoose";

export interface SellerMessageDocument extends Document {
  orderId: mongoose.Schema.Types.ObjectId;
  sellerId: mongoose.Schema.Types.ObjectId;
  buyerId: mongoose.Schema.Types.ObjectId;
  senderId: mongoose.Schema.Types.ObjectId;
  senderType: "seller" | "buyer";
  message: string;
  messageType: "text" | "image" | "file";
  attachments?: string[];
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const sellerMessageSchema = new Schema<SellerMessageDocument>(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    senderType: {
      type: String,
      enum: ["seller", "buyer"],
      required: true
    },
    message: {
      type: String,
      required: true,
      maxlength: 1000
    },
    messageType: {
      type: String,
      enum: ["text", "image", "file"],
      default: "text"
    },
    attachments: [{ type: String }],
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: Date,
  },
  { timestamps: true }
);

// Indexes for efficient queries
sellerMessageSchema.index({ orderId: 1, createdAt: 1 });
sellerMessageSchema.index({ sellerId: 1, buyerId: 1, createdAt: -1 });
sellerMessageSchema.index({ senderId: 1, createdAt: -1 });
sellerMessageSchema.index({ sellerId: 1, isRead: 1 });

export const SellerMessage = models.SellerMessage || model<SellerMessageDocument>("SellerMessage", sellerMessageSchema);