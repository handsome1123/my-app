import { NextRequest, NextResponse } from "next/server";
import { connectToMongoDB } from "@/lib/mongodb";
import { SupportTicket } from "@/models/SupportTicket";
import { SupportMessage } from "@/models/SupportMessage";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  try {
    await connectToMongoDB();

    // Get token from Authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "all";
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");

    const query: any = { userId: decoded.userId };
    if (status !== "all") {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const tickets = await SupportTicket.find(query)
      .populate("orderId", "productId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await SupportTicket.countDocuments(query);

    return NextResponse.json({
      tickets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("GET /api/buyer/support error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToMongoDB();

    // Get token from Authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { subject, message, category, orderId, priority = "medium" } = await req.json();

    if (!subject || !message || !category) {
      return NextResponse.json({
        error: "Subject, message, and category are required"
      }, { status: 400 });
    }

    // Validate category
    const validCategories = ["order_issue", "product_question", "refund_request", "technical_issue", "account_issue", "other"];
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    // If orderId provided, verify it belongs to user
    if (orderId) {
      const Order = (await import("@/models/Order")).Order;
      const order = await Order.findOne({ _id: orderId, buyerId: decoded.userId });
      if (!order) {
        return NextResponse.json({ error: "Order not found or access denied" }, { status: 404 });
      }
    }

    const ticket = new SupportTicket({
      userId: decoded.userId,
      orderId: orderId || undefined,
      subject,
      message,
      category,
      priority,
    });

    await ticket.save();

    // Create initial message
    const initialMessage = new SupportMessage({
      ticketId: ticket._id,
      senderId: decoded.userId,
      senderType: "user",
      message,
    });

    await initialMessage.save();

    return NextResponse.json({
      message: "Support ticket created successfully",
      ticket
    });
  } catch (error) {
    console.error("POST /api/buyer/support error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}