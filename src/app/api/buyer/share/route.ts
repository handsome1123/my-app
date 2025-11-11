import { NextRequest, NextResponse } from "next/server";
import { connectToMongoDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    await connectToMongoDB();

    // Get token from Authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { productId, platform } = await req.json();
    if (!productId || !platform) {
      return NextResponse.json({ error: "Product ID and platform required" }, { status: 400 });
    }

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const productUrl = `${baseUrl}/buyer/products/${productId}`;
    const shareText = `Check out this amazing product: ${product.name}`;

    let shareUrl = "";

    switch (platform.toLowerCase()) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(productUrl)}`;
        break;
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${productUrl}`)}`;
        break;
      case "telegram":
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(productUrl)}&text=${encodeURIComponent(shareText)}`;
        break;
      case "line":
        shareUrl = `https://line.me/R/msg/text/?${encodeURIComponent(`${shareText} ${productUrl}`)}`;
        break;
      case "copy":
        // For copy to clipboard, return the URL
        return NextResponse.json({
          message: "URL copied to clipboard",
          url: productUrl,
          text: `${shareText} ${productUrl}`
        });
      default:
        return NextResponse.json({ error: "Unsupported platform" }, { status: 400 });
    }

    return NextResponse.json({
      message: "Share URL generated",
      shareUrl,
      platform,
      productUrl,
      shareText
    });
  } catch (error) {
    console.error("POST /api/buyer/share error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}