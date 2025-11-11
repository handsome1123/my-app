import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Product } from "@/models/Product";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status"); // "pending", "approved", "rejected", "active"
    const seller = searchParams.get("seller");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "newest";

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    if (status) query.status = status;
    if (seller) query.sellerId = seller;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    // Build sort options
    const sortOptions: any = {};
    switch (sortBy) {
      case "oldest":
        sortOptions.createdAt = 1;
        break;
      case "price-low":
        sortOptions.price = 1;
        break;
      case "price-high":
        sortOptions.price = -1;
        break;
      case "name":
        sortOptions.name = 1;
        break;
      case "newest":
      default:
        sortOptions.createdAt = -1;
        break;
    }

    // Fetch products with population
    const products = await Product.find(query)
      .populate("sellerId", "name email")
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    // Count total
    const totalProducts = await Product.countDocuments(query);

    // Get status breakdown
    const statusStats = await Product.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const stats = {
      total: totalProducts,
      approved: statusStats.find(s => s._id === "approved")?.count || 0,
      pending: statusStats.find(s => s._id === "pending")?.count || 0,
      rejected: statusStats.find(s => s._id === "rejected")?.count || 0,
      active: statusStats.find(s => s._id === "active")?.count || 0,
      suspended: statusStats.find(s => s._id === "suspended")?.count || 0,
      inactive: statusStats.find(s => s._id === "inactive")?.count || 0
    };

    return NextResponse.json({
      products,
      stats,
      pagination: {
        page,
        limit,
        total: totalProducts,
        pages: Math.ceil(totalProducts / limit)
      }
    });
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await connectToDatabase();

    const { productIds, action, reason } = await req.json();

    if (!productIds || !Array.isArray(productIds) || !action) {
      return NextResponse.json({ error: "Product IDs and action required" }, { status: 400 });
    }

    const updateData: any = {};

    switch (action) {
      case "approve":
        updateData.status = "approved";
        updateData.moderatedAt = new Date();
        updateData.moderationReason = "Approved by admin";
        break;
      case "reject":
        updateData.status = "rejected";
        updateData.moderatedAt = new Date();
        updateData.rejectionReason = reason || "Product rejected by admin";
        break;
      case "activate":
        updateData.status = "active";
        break;
      case "deactivate":
        updateData.status = "inactive";
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const result = await Product.updateMany(
      { _id: { $in: productIds } },
      updateData
    );

    return NextResponse.json({
      message: `${result.modifiedCount} products updated`,
      action,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error("❌ Error updating products:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to update products" },
      { status: 500 }
    );
  }
}
