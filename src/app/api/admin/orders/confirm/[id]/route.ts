// /app/api/admin/orders/confirm/[id]/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, context: Params) {
  try {
    await connectDB();
    
    // Await the params since it's now a Promise
    const { id: orderId } = await context.params;

    const order = await Order.findById(orderId);
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    if (order.status !== "pending") {
      return NextResponse.json({ error: "Order cannot be confirmed" }, { status: 400 });
    }

    order.status = "confirmed";
    await order.save();

    return NextResponse.json({ message: "Payment confirmed and seller notified", order });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to confirm payment" }, { status: 500 });
  }
}