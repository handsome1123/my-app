import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { SellerMessage } from "@/models/SellerMessage";
import { Order } from "@/models/Order";
import { User } from "@/models/User";
import { verifyToken } from "@/lib/jwt";

interface DecodedToken {
  id: string;
  role: string;
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    await connectToDatabase();

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token) as DecodedToken | null;
    if (!decoded || decoded.role !== "seller") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const sellerId = decoded.id;
    const { orderId } = await context.params;

    // Verify seller owns this order
    const order = await Order.findOne({ _id: orderId, sellerId });
    if (!order) {
      return NextResponse.json({ error: "Order not found or access denied" }, { status: 404 });
    }

    // Get all messages for this order
    const messages = await SellerMessage.find({ orderId })
      .sort({ createdAt: 1 })
      .populate("senderId", "name")
      .populate("buyerId", "name")
      .populate("sellerId", "name");

    // Mark messages from buyer as read
    await SellerMessage.updateMany(
      { orderId, senderType: "buyer", isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );

    // Get order and product details for context
    const orderDetails = await Order.findById(orderId)
      .populate("productId", "name imageUrl")
      .populate("buyerId", "name email");

    return NextResponse.json({
      messages,
      order: orderDetails,
      unreadCount: messages.filter(m => !m.isRead && m.senderType === "buyer").length
    });
  } catch (error: unknown) {
    console.error("Error fetching conversation:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    await connectToDatabase();

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token) as DecodedToken | null;
    if (!decoded || decoded.role !== "seller") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const sellerId = decoded.id;
    const { orderId } = await context.params;
    const { message, messageType = "text", attachments = [] } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Verify the order belongs to this seller
    const order = await Order.findOne({ _id: orderId, sellerId });
    if (!order) {
      return NextResponse.json({ error: "Order not found or access denied" }, { status: 404 });
    }

    const newMessage = new SellerMessage({
      orderId,
      sellerId,
      buyerId: order.buyerId,
      senderId: sellerId,
      senderType: "seller",
      message: message.trim(),
      messageType,
      attachments,
      isRead: false,
    });

    await newMessage.save();

    // Update order's last activity
    await Order.findByIdAndUpdate(orderId, {
      lastMessageAt: new Date(),
      updatedAt: new Date()
    });

    // Populate sender info for response
    await newMessage.populate("senderId", "name");

    return NextResponse.json({
      success: true,
      message: newMessage
    });
  } catch (error: unknown) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Server error" },
      { status: 500 }
    );
  }
}