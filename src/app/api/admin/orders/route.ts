import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order"; 

export async function GET() {
  try {
    await connectDB();

    // Fetch all orders, latest first
    const orders = await Order.find().sort({ createdAt: -1 });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
