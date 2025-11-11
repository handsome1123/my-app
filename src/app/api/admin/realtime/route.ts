import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { SupportTicket } from "@/models/SupportTicket";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    // Authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response("Unauthorized", { status: 401 });
    }
    const token = authHeader.substring(7);

    // Verify token (basic check - in production, validate JWT properly)
    if (!token) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Set up SSE headers
    const responseStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        // Send initial connection message
        const initialMessage = `data: ${JSON.stringify({ type: "connected", message: "Real-time connection established" })}\n\n`;
        controller.enqueue(encoder.encode(initialMessage));

        // Function to fetch and send dashboard data
        const sendDashboardData = async () => {
          try {
            // Total revenue
            const revenueData = await Order.aggregate([
              { $match: { status: "completed" } },
              { $group: { _id: null, total: { $sum: "$totalAmount" } } },
            ]);
            const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

            // Monthly revenue
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

            // Total products
            const totalProducts = await Product.countDocuments();

            // Total orders and pending orders
            const totalOrders = await Order.countDocuments();
            const pendingOrders = await Order.countDocuments({
              status: { $in: ["pending_payment", "confirmed"] },
            });

            // Total users and sellers
            const totalUsers = await User.countDocuments();
            const totalSellers = await User.countDocuments({ role: "seller" });

            // Active users (last 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const activeUsers = await User.countDocuments({
              lastLogin: { $gte: thirtyDaysAgo },
            });

            // Conversion rate
            const buyers = await Order.distinct("buyerId", { status: "completed" });
            const usersWithOrders = buyers.length;
            const conversionRate = totalUsers > 0 ? ((usersWithOrders / totalUsers) * 100) : 0;

            // Average order value
            const completedOrders = await Order.find({ status: "completed" });
            const avgOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

            // Support tickets
            const supportTickets = await SupportTicket.countDocuments();
            const pendingTickets = await SupportTicket.countDocuments({
              status: { $in: ["open", "in_progress", "waiting_for_customer"] },
            });

            // Low stock products (mock - in production, check product inventory)
            const lowStockProducts = 3; // Mock data

            // Revenue change (mock - in production, compare with previous period)
            const revenueChange = 12.5;

            // Orders change (mock)
            const ordersChange = 8.3;

            // Recent orders
            const recentOrdersData = await Order.find()
              .sort({ createdAt: -1 })
              .limit(10)
              .populate("productId", "name")
              .populate("buyerId", "name");

            const recentOrders = recentOrdersData.map((order) => ({
              id: order._id.toString(),
              customerName: order.buyerId?.name || "Unknown",
              product: order.productId?.name || "Unknown Product",
              amount: order.totalAmount || 0,
              status: order.status,
              date: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A",
            }));

            const dashboardData = {
              type: "dashboard_update",
              timestamp: new Date().toISOString(),
              stats: {
                totalRevenue,
                totalProducts,
                totalOrders,
                totalUsers,
                totalSellers,
                pendingOrders,
                monthlyRevenue,
                revenueChange,
                ordersChange,
                lowStockProducts,
                activeUsers,
                conversionRate: parseFloat(conversionRate.toFixed(2)),
                avgOrderValue,
                supportTickets,
                pendingTickets,
              },
              recentOrders,
            };

            const message = `data: ${JSON.stringify(dashboardData)}\n\n`;
            controller.enqueue(encoder.encode(message));
          } catch (error) {
            console.error("Error fetching dashboard data:", error);
            const errorMessage = `data: ${JSON.stringify({ type: "error", message: "Failed to fetch dashboard data" })}\n\n`;
            controller.enqueue(encoder.encode(errorMessage));
          }
        };

        // Send initial data immediately
        await sendDashboardData();

        // Set up interval to send updates every 10 seconds
        const interval = setInterval(sendDashboardData, 10000);

        // Handle client disconnect
        req.signal.addEventListener("abort", () => {
          clearInterval(interval);
          controller.close();
        });
      },
    });

    return new Response(responseStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Cache-Control",
      },
    });
  } catch (error) {
    console.error("Realtime API error:", error);
    return NextResponse.json(
      { error: "Failed to establish real-time connection" },
      { status: 500 }
    );
  }
}