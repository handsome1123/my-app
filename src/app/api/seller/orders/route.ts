import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { verifyToken } from "@/lib/jwt";

interface DecodedToken {
  id: string;
  role: string;
}

// ---------------- GET ----------------
export async function GET(req: Request) {
  try {
    await connectDB();

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer "))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token) as DecodedToken | null;

    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    if (decoded.role !== "seller")
      return NextResponse.json({ error: "Only sellers can view orders" }, { status: 403 });

    // Find all orders where sellerId matches logged-in seller
    const orders = await Order.find({ sellerId: decoded.id })
      .sort({ createdAt: -1 })
      .populate("productId", "name price imageUrl")
      .populate("buyerId", "name email");

    return NextResponse.json({ success: true, orders }, { status: 200 });
  } catch (error: unknown) {
    console.error("GET /api/seller/orders error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Server error" },
      { status: 500 }
    );
  }
}
