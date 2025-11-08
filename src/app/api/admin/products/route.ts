import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Product } from "@/models/Product";

export async function GET() {
  try {
    await connectToDatabase();

    // Fetch all products, latest first
    const products = await Product.find().sort({ createdAt: -1 });

    // Count total number of products
    const totalProducts = await Product.countDocuments();

    return NextResponse.json({ products, totalProducts });
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}
