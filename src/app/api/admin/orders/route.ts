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

    // Count pending orders (pending_payment or confirmed)
    const pendingOrders = await Order.countDocuments({
      status: { $in: ["pending_payment", "confirmed"] },
    });

    // Calculate total revenue
    const revenueData = await Order.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    // Calculate monthly revenue (current month)
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const monthlyRevenueData = await Order.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $gte: currentMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const monthlyRevenue = monthlyRevenueData.length > 0 ? monthlyRevenueData[0].total : 0;

    // Calculate average order value
    const completedOrders = await Order.find({ status: "completed" });
    const avgOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

    // Transform orders for the dashboard (limit to recent ones)
    const transformedOrders = orders.slice(0, 10).map((order) => ({
      id: order._id.toString(),
      customerName: order.buyerId?.name || "Unknown",
      product: order.productId?.name || "Unknown Product",
      amount: order.totalAmount || 0,
      status: order.status,
      date: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A",
    }));

    return NextResponse.json({
      orders: transformedOrders,
      count: totalOrders,
      totalRevenue,
      monthlyRevenue,
      avgOrderValue,
    });
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
