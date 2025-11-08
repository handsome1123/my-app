// app/api/seller/orders/cancel/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { User } from "@/models/User";
import { verifyToken } from "@/lib/jwt";

interface DecodedToken {
  id: string;
  role: string;
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    // 🔑 Verify seller token
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

    // ⚡ Await params
    const { id: orderId } = await context.params;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    // 🔍 Find order
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // ✅ Ensure seller owns this order
    if (order.sellerId.toString() !== sellerId) {
      return NextResponse.json({ error: "Not authorized for this order" }, { status: 403 });
    }

    // ⛔ Check if order can be cancelled
    if (order.status === "cancelled" || order.status === "delivered") {
      return NextResponse.json(
        { error: `Order is already ${order.status}` },
        { status: 400 }
      );
    }

    // ⛔ If order was shipped, handle differently
    if (order.status === "shipped") {
      return NextResponse.json(
        { error: "Cannot cancel shipped order. Contact support for returns." },
        { status: 400 }
      );
    }

    // 💰 Refund money to buyer (add back to wallet)
    if (order.buyerId) {
      const buyer = await User.findById(order.buyerId);
      if (buyer) {
        buyer.wallet = (buyer.wallet || 0) + order.totalPrice;
        await buyer.save();
      }
    }

    // ✅ Update order status
    order.status = "cancelled";
    order.cancelledAt = new Date();
    order.cancelledBy = "seller";
    order.refundAmount = order.totalPrice;
    await order.save();

    // 📦 Get updated order with populated data
    const updatedOrder = await Order.findById(orderId)
      .populate("productId", "name price imageUrl")
      .populate("buyerId", "name email");

    return NextResponse.json({
      success: true,
      message: "Order cancelled successfully. Money refunded to buyer.",
      order: updatedOrder,
      refundAmount: order.totalPrice,
    });
  } catch (error: unknown) {
    console.error("Error cancelling order:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Server error" },
      { status: 500 }
    );
  }
}
