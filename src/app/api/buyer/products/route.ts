// /api/buyer/products/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";


// This route show product randomly + show only more than 0
export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const random = searchParams.get("random");

    if (random) {
      // 🎯 Get 6 random products with stock > 0
      const randomProducts = await Product.aggregate([
        { $match: { stock: { $gt: 0 } } },
        { $sample: { size: 6 } }
      ]);
      return NextResponse.json({ products: randomProducts });
    }

    // Default: return all products with stock > 0, sorted by latest
    const products = await Product.find({ stock: { $gt: 0 } }).sort({ createdAt: -1 });
    return NextResponse.json({ products });
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}
