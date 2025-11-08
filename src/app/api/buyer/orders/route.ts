import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { verifyToken } from "@/lib/jwt";

interface DecodedToken {
  id: string;
  role?: string;
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    // Get buyer from token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token) as DecodedToken | null;

    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const buyerId = decoded.id;

    // Fetch buyer's orders
    const orders = await Order.find({ buyerId })
      .populate("productId") // populate product details
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, orders });
  } catch (err) {
    console.error("Fetch orders error:", err);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
