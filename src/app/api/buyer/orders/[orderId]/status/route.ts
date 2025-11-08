// /api/buyer/orders/[orderId]/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Order } from "@/models/Order";
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

    // 🔐 Get auth
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token) as DecodedToken | null;

    if (!decoded || decoded.role !== "buyer") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // ✅ Await params
    const { orderId } = await context.params;

    // 🔎 Find the order
    const order = await Order.findOne({
      _id: orderId,
      buyerId: decoded.id,
    }).populate("productId");

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      orderId: order._id,
      status: order.status,
      sellerResponse: order.sellerResponse,
      confirmedAt: order.confirmedAt,
      rejectedAt: order.rejectedAt,
    });
  } catch (error) {
    console.error("❌ Error checking order status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
