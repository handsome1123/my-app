import { NextRequest, NextResponse } from "next/server";
import { connectToMongoDB } from "@/lib/mongodb";
import { Review } from "@/models/Review";
import { Order } from "@/models/Order";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  try {
    await connectToMongoDB();

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    const reviews = await Review.find({ productId })
      .populate("userId", "name")
      .sort({ verified: -1, createdAt: -1 });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      : 0;

    const ratingDistribution = [1, 2, 3, 4, 5].map(rating =>
      reviews.filter(review => review.rating === rating).length
    );

    return NextResponse.json({
      reviews,
      stats: {
        total: totalReviews,
        average: averageRating,
        distribution: ratingDistribution
      }
    });
  } catch (error) {
    console.error("GET /api/buyer/reviews error:", error);
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

    const { productId, orderId, rating, title, comment } = await req.json();
    if (!productId || !orderId || !rating) {
      return NextResponse.json({ error: "Product ID, Order ID, and rating required" }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    // Verify the order belongs to the user and is delivered
    const order = await Order.findOne({
      _id: orderId,
      buyerId: decoded.userId,
      status: "delivered",
      productId: productId
    });

    if (!order) {
      return NextResponse.json({ error: "Invalid order or product not delivered" }, { status: 403 });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      userId: decoded.userId,
      productId: productId
    });

    if (existingReview) {
      return NextResponse.json({ error: "You have already reviewed this product" }, { status: 409 });
    }

    const newReview = new Review({
      userId: decoded.userId,
      productId: productId,
      orderId: orderId,
      rating: rating,
      title: title?.trim(),
      comment: comment?.trim(),
      verified: true
    });

    await newReview.save();

    return NextResponse.json({
      message: "Review submitted successfully",
      review: await Review.findById(newReview._id).populate("userId", "name")
    });
  } catch (error) {
    console.error("POST /api/buyer/reviews error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}