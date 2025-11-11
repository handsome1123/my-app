import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const role = searchParams.get("role"); // "buyer", "seller", "admin", or null for all
    const search = searchParams.get("search");
    const status = searchParams.get("status"); // "active", "suspended", etc.

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    if (role) query.role = role;
    if (status === "verified") query.isVerified = true;
    if (status === "unverified") query.isVerified = false;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    // Fetch users with pagination
    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Count total
    const totalUsers = await User.countDocuments(query);

    // Get role breakdown
    const roleStats = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } }
    ]);

    const stats = {
      total: totalUsers,
      buyers: roleStats.find(s => s._id === "buyer")?.count || 0,
      sellers: roleStats.find(s => s._id === "seller")?.count || 0,
      admins: roleStats.find(s => s._id === "admin")?.count || 0,
      verified: await User.countDocuments({ isVerified: true }),
      unverified: await User.countDocuments({ isVerified: false })
    };

    return NextResponse.json({
      users,
      stats,
      pagination: {
        page,
        limit,
        total: totalUsers,
        pages: Math.ceil(totalUsers / limit)
      }
    });
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await connectToDatabase();

    const { userIds, action, reason } = await req.json();

    if (!userIds || !Array.isArray(userIds) || !action) {
      return NextResponse.json({ error: "User IDs and action required" }, { status: 400 });
    }

    const updateData: any = {};

    switch (action) {
      case "verify":
        updateData.isVerified = true;
        updateData.verificationToken = undefined;
        updateData.verificationTokenExpires = undefined;
        break;
      case "unverify":
        updateData.isVerified = false;
        break;
      case "suspend":
        updateData.role = "suspended";
        break;
      case "activate":
        // Need to determine original role - this is simplified
        updateData.role = "buyer"; // Default fallback
        break;
      case "promote_to_admin":
        updateData.role = "admin";
        break;
      case "demote_to_buyer":
        updateData.role = "buyer";
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const result = await User.updateMany(
      { _id: { $in: userIds } },
      updateData
    );

    return NextResponse.json({
      message: `${result.modifiedCount} users updated`,
      action,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error("❌ Error updating users:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to update users" },
      { status: 500 }
    );
  }
}
