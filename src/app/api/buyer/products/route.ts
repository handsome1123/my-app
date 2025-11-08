import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Product } from "@/models/Product";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("search") || "";
    const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
    const limit = Math.min(100, Number(url.searchParams.get("limit") || "20"));
    const skip = (page - 1) * limit;

    await connectToDatabase();

    // MongoDB query filter
    const filter: Record<string, unknown> = { stock: { $gt: 0 } };

    if (q) {
      filter.name = { $regex: q, $options: "i" }; // case-insensitive
    }

    const [total, docs] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
    ]);

    // convert ObjectIds and ensure minimal fields
    const products = docs.map((d) => ({
      _id: String(d._id),
      name: d.name,
      description: d.description,
      price: d.price,
      stock: d.stock,
      imageUrl: d.imageUrl,
      sellerId: d.sellerId,
    }));

    return NextResponse.json({ products, total, page, limit });
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}
