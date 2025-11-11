import mongoose, { Schema, model, models, Document } from "mongoose";

export interface SupportMessageDocument extends Document {
  ticketId: mongoose.Schema.Types.ObjectId;
  senderId: mongoose.Schema.Types.ObjectId; // User or Admin
  senderType: "user" | "admin" | "support_agent";
  message: string;
  attachments?: string[]; // File URLs
  isInternal?: boolean; // Internal notes not visible to user
  readAt?: Date;
  createdAt: Date;
}

const supportMessageSchema = new Schema<SupportMessageDocument>(
  {
    ticketId: { type: mongoose.Schema.Types.ObjectId, ref: "SupportTicket", required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    senderType: {
      type: String,
      enum: ["user", "admin", "support_agent"],
      required: true
    },
    message: { type: String, required: true, maxlength: 2000 },
    attachments: [{ type: String }],
    isInternal: { type: Boolean, default: false },
    readAt: Date,
  },
  { timestamps: true }
);

// Indexes for efficient queries
supportMessageSchema.index({ ticketId: 1, createdAt: 1 });
supportMessageSchema.index({ senderId: 1, createdAt: -1 });

export const SupportMessage = models.SupportMessage || model<SupportMessageDocument>("SupportMessage", supportMessageSchema);