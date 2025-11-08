import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Order } from "@/models/Order";

export async function GET() {
  try {
    await connectToDatabase();

    // Fetch all orders, latest first
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("productId", "name price imageUrl")
      .populate("buyerId", "name email");

    // Total orders count
    const totalOrders = await Order.countDocuments();

    // Count pending orders
    const pendingOrders = await Order.countDocuments({ status: "pending" });

    return NextResponse.json({ orders, totalOrders, pendingOrders });
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
