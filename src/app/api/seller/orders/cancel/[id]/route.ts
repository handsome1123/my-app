// /api/seller/orders/cancel/[id].ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, context: Params) {
  try {
    await connectDB();

    const { id: orderId } = await context.params;

    const order = await Order.findById(orderId);
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    // Only confirmed orders can be cancelled by seller
    if (order.status !== "confirmed") {
      return NextResponse.json({ error: "Order cannot be cancelled" }, { status: 400 });
    }

    order.status = "cancelled";
    await order.save();

    // TODO: Refund buyer (depending on payment gateway)
    // Example: Stripe refund or manual bank refund logic here

    return NextResponse.json({ message: "Order cancelled and buyer refunded", order });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to cancel order" }, { status: 500 });
  }
}
