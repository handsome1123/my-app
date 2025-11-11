import mongoose, { Schema, model, models, Document } from "mongoose";

export interface SupportTicketDocument extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  orderId?: mongoose.Schema.Types.ObjectId;
  subject: string;
  message: string;
  category: "order_issue" | "product_question" | "refund_request" | "technical_issue" | "account_issue" | "other";
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "waiting_for_customer" | "resolved" | "closed";
  assignedTo?: mongoose.Schema.Types.ObjectId; // Admin/Support agent
  attachments?: string[]; // File URLs
  tags?: string[];
  resolution?: string;
  satisfactionRating?: number; // 1-5 stars
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  lastRepliedAt?: Date;
}

const supportTicketSchema = new Schema<SupportTicketDocument>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    subject: { type: String, required: true, maxlength: 200 },
    message: { type: String, required: true, maxlength: 2000 },
    category: {
      type: String,
      enum: ["order_issue", "product_question", "refund_request", "technical_issue", "account_issue", "other"],
      required: true
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium"
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "waiting_for_customer", "resolved", "closed"],
      default: "open"
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    attachments: [{ type: String }],
    tags: [{ type: String }],
    resolution: { type: String, maxlength: 1000 },
    satisfactionRating: { type: Number, min: 1, max: 5 },
    resolvedAt: Date,
    lastRepliedAt: Date,
  },
  { timestamps: true }
);

// Indexes for efficient queries
supportTicketSchema.index({ userId: 1, createdAt: -1 });
supportTicketSchema.index({ status: 1, priority: -1, createdAt: -1 });
supportTicketSchema.index({ assignedTo: 1, status: 1 });

export const SupportTicket = models.SupportTicket || model<SupportTicketDocument>("SupportTicket", supportTicketSchema);