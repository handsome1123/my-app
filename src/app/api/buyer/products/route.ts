import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product, ProductDocument } from "@/models/Product";

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    // MongoDB query filter
    const filter: Record<string, unknown> = { stock: { $gt: 0 } };

    if (search) {
      filter.name = { $regex: search, $options: "i" }; // case-insensitive
    }

    let products: ProductDocument[];

    if (search) {
      // filtered search
      products = await Product.find(filter).sort({ createdAt: -1 });
    } else {
      // shuffle all
      products = (await Product.aggregate([
        { $match: filter },
        { $sample: { size: 100000 } },
      ])) as ProductDocument[];
    }

    return NextResponse.json({ products });
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}
