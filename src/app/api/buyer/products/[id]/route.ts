import { NextResponse } from "next/server";
import { connectToMongoDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectToMongoDB();

    const { id } = await context.params; // ✅ await params

    const product = await Product.findById(id).populate('sellerId', 'name email');
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}
