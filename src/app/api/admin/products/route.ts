import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";  // <-- make sure you have this model defined

export async function GET() {
  try {
    await connectDB();

    // Fetch all products, latest first
    const products = await Product.find().sort({ createdAt: -1 });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}
