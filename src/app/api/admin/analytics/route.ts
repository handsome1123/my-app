import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Order } from "@/models/Order";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    // Total sellers (users with role 'seller')
    const totalSellers = await User.countDocuments({ role: "seller" });

    // Active users (users who logged in within last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeUsers = await User.countDocuments({
      lastLogin: { $gte: thirtyDaysAgo },
    });

    // Conversion rate: percentage of users who made at least one purchase
    const totalUsers = await User.countDocuments();
    // Get unique buyers from orders
    const buyers = await Order.distinct("buyerId", { status: "completed" });
    const usersWithOrders = buyers.length;
    const conversionRate = totalUsers > 0 ? ((usersWithOrders / totalUsers) * 100) : 0;

    return NextResponse.json({
      totalSellers,
      activeUsers,
      conversionRate: parseFloat(conversionRate.toFixed(2)),
    });
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}