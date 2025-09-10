import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { Order } from "@/models/Order";
import { User } from "@/models/User";
import { verifyToken } from "@/lib/jwt";

interface DecodedToken {
  id: string;
  role?: string;
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { productId, quantity } = body;

    // Get buyer from token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token) as DecodedToken | null;
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const buyerId = decoded.id;

    if (!productId) return NextResponse.json({ error: "Product ID is required" }, { status: 400 });

    // Fetch product and buyer
    const product = await Product.findById(productId);
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const buyer = await User.findById(buyerId);
    if (!buyer) return NextResponse.json({ error: "Buyer not found" }, { status: 404 });

    // Create order
    const order = await Order.create({
      product: product._id,
      buyer: buyer._id,
      quantity: quantity || 1,
      buyerName: buyer.name,
      buyerEmail: buyer.email,
      buyerPhone: buyer.phone || "N/A",
      buyerAddress: buyer.address || "N/A",
      status: "pending",
    });

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error: unknown) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: (error as Error).message || "Server error" }, { status: 500 });
  }
}

