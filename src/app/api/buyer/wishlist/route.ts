import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectToMongoDB } from "@/lib/mongodb";
import { Wishlist } from "@/models/Wishlist";
import { User } from "@/models/User";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
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

    const wishlistItems = await Wishlist.find({ userId: decoded.userId })
      .populate({
        path: "productId",
        populate: { path: "sellerId", select: "name email" }
      })
      .sort({ createdAt: -1 });

    return NextResponse.json({ wishlist: wishlistItems });
  } catch (error) {
    console.error("GET /api/buyer/wishlist error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

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

    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    // Check if already in wishlist
    const existingItem = await Wishlist.findOne({
      userId: decoded.userId,
      productId: productId
    });

    if (existingItem) {
      // Remove from wishlist
      await Wishlist.findByIdAndDelete(existingItem._id);
      return NextResponse.json({ message: "Removed from wishlist", action: "removed" });
    } else {
      // Add to wishlist
      const newItem = new Wishlist({
        userId: decoded.userId,
        productId: productId
      });
      await newItem.save();
      return NextResponse.json({ message: "Added to wishlist", action: "added" });
    }
  } catch (error) {
    console.error("POST /api/buyer/wishlist error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
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

    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    await Wishlist.findOneAndDelete({
      userId: decoded.userId,
      productId: productId
    });

    return NextResponse.json({ message: "Removed from wishlist" });
  } catch (error) {
    console.error("DELETE /api/buyer/wishlist error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}