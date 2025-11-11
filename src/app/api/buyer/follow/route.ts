import { NextRequest, NextResponse } from "next/server";
import { connectToMongoDB } from "@/lib/mongodb";
import { SellerFollow } from "@/models/SellerFollow";
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

    // Get followed sellers with their info
    const follows = await SellerFollow.find({ followerId: decoded.userId })
      .populate("sellerId", "name email _id")
      .sort({ createdAt: -1 });

    return NextResponse.json({ followedSellers: follows });
  } catch (error) {
    console.error("GET /api/buyer/follow error:", error);
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

    const { sellerId, action } = await req.json();
    if (!sellerId) {
      return NextResponse.json({ error: "Seller ID required" }, { status: 400 });
    }

    // Check if seller exists and is actually a seller
    const seller = await User.findOne({ _id: sellerId, role: "seller" });
    if (!seller) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    // Prevent self-following
    if (decoded.userId === sellerId) {
      return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
    }

    const existingFollow = await SellerFollow.findOne({
      followerId: decoded.userId,
      sellerId: sellerId
    });

    if (action === "follow") {
      if (existingFollow) {
        return NextResponse.json({ error: "Already following this seller" }, { status: 409 });
      }

      const newFollow = new SellerFollow({
        followerId: decoded.userId,
        sellerId: sellerId
      });

      await newFollow.save();
      return NextResponse.json({ message: "Successfully followed seller" });
    } else if (action === "unfollow") {
      if (!existingFollow) {
        return NextResponse.json({ error: "Not following this seller" }, { status: 404 });
      }

      await SellerFollow.findByIdAndDelete(existingFollow._id);
      return NextResponse.json({ message: "Successfully unfollowed seller" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("POST /api/buyer/follow error:", error);
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

    const { sellerId } = await req.json();
    if (!sellerId) {
      return NextResponse.json({ error: "Seller ID required" }, { status: 400 });
    }

    await SellerFollow.findOneAndDelete({
      followerId: decoded.userId,
      sellerId: sellerId
    });

    return NextResponse.json({ message: "Unfollowed seller" });
  } catch (error) {
    console.error("DELETE /api/buyer/follow error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}