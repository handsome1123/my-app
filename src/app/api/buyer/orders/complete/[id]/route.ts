// /api/buyer/orders/complete/[id].ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, context: Params) {
  try {
    await connectDB();

    const { id:orderId } = await context.params;

    const order = await Order.findById(orderId);
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    if (order.status !== "shipped") {
      return NextResponse.json({ error: "Only shipped orders can be completed" }, { status: 400 });
    }

    order.status = "delivered";
    await order.save();

    return NextResponse.json({ message: "Order completed successfully", order });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to complete order" }, { status: 500 });
  }
}
