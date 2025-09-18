// /api/seller/orders/ship/[id].ts
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

    if (order.status !== "confirmed") {
      return NextResponse.json({ error: "Only confirmed orders can be shipped" }, { status: 400 });
    }

    order.status = "shipped";
    await order.save();

    return NextResponse.json({ message: "Order marked as shipped", order });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to mark order as shipped" }, { status: 500 });
  }
}
