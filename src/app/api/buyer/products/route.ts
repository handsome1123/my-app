import { NextResponse } from "next/server";
import { connectToMongoDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("search") || "";
    const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
    const limit = Math.min(100, Number(url.searchParams.get("limit") || "20"));
    const skip = (page - 1) * limit;

    await connectToMongoDB();

    // MongoDB query filter
    const filter: Record<string, unknown> = { stock: { $gt: 0 } };

    if (q) {
      filter.name = { $regex: q, $options: "i" }; // case-insensitive
    }

    const [total, docs] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter)
        .select('name description price imageUrl stock sellerId status category condition isFeatured')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    // convert ObjectIds and return full product data
    const products = docs.map((d) => ({
      _id: String(d._id),
      name: d.name,
      description: d.description,
      price: d.price,
      imageUrl: d.imageUrl,
      stock: d.stock,
      sellerId: String(d.sellerId),
      status: d.status,
      moderatedBy: d.moderatedBy,
      moderatedAt: d.moderatedAt,
      moderationReason: d.moderationReason,
      rejectionReason: d.rejectionReason,
      category: d.category,
      condition: d.condition,
      tags: d.tags,
      isFeatured: d.isFeatured,
      viewCount: d.viewCount,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
      __v: d.__v,
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
