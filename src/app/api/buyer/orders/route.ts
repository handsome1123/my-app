import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { verifyToken } from "@/lib/jwt";

// Define what your token should look like
interface DecodedToken {
  id: string;
  role?: string;
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Get buyer from token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token) as DecodedToken | null;
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const buyerId = decoded.id;

    // Optional: filter by status
    const url = new URL(req.url);
    const status = url.searchParams.get("status"); // e.g., ?status=shipped

    const query: { buyer: string; status?: string } = { buyer: buyerId };
    if (status) query.status = status;

    // Fetch orders
    const orders = await Order.find(query)
      .populate("product") // populate product info
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, orders }, { status: 200 });
  } catch (error: unknown) {
    console.error("Fetch orders error:", error);
    return NextResponse.json({ error: (error as Error).message || "Server error" }, { status: 500 });
  }
}

