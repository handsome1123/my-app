import { NextRequest, NextResponse } from "next/server";
import { connectToMongoDB } from "@/lib/mongodb";
import { OrderTracking } from "@/models/OrderTracking";
import { Order } from "@/models/Order";
import jwt from "jsonwebtoken";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
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

    const { orderId } = await params;

    // Verify order belongs to user
    const order = await Order.findOne({
      _id: orderId,
      buyerId: decoded.userId
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const tracking = await OrderTracking.find({ orderId: orderId })
      .sort({ createdAt: -1 });

    return NextResponse.json({ tracking, currentStatus: order.status });
  } catch (error) {
    console.error("GET /api/buyer/orders/[orderId]/tracking error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}