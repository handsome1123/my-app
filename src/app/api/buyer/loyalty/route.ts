import { NextRequest, NextResponse } from "next/server";
import { connectToMongoDB } from "@/lib/mongodb";
import { LoyaltyPoints } from "@/models/LoyaltyPoints";
import { LoyaltyReward } from "@/models/LoyaltyReward";
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

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "points"; // "points" or "rewards"

    if (type === "points") {
      // Get user's loyalty points
      let loyaltyData = await LoyaltyPoints.findOne({ userId: decoded.userId });

      // Create loyalty account if it doesn't exist
      if (!loyaltyData) {
        loyaltyData = new LoyaltyPoints({
          userId: decoded.userId,
          totalPoints: 0,
          lifetimePoints: 0,
          level: 1,
          levelName: "Bronze",
          nextLevelThreshold: 100
        });
        await loyaltyData.save();
      }

      // Calculate current level based on lifetime points
      const levelThresholds = [
        { level: 1, name: "Bronze", threshold: 100 },
        { level: 2, name: "Silver", threshold: 500 },
        { level: 3, name: "Gold", threshold: 1500 },
        { level: 4, name: "Platinum", threshold: 3500 },
        { level: 5, name: "Diamond", threshold: 7500 }
      ];

      const currentLevel = levelThresholds.reduce((acc, threshold) => {
        return loyaltyData.lifetimePoints >= threshold.threshold ? threshold : acc;
      }, levelThresholds[0]);

      const nextLevel = levelThresholds.find(t => t.level > currentLevel.level) || currentLevel;

      // Update level if changed
      if (loyaltyData.level !== currentLevel.level) {
        loyaltyData.level = currentLevel.level;
        loyaltyData.levelName = currentLevel.name;
        loyaltyData.nextLevelThreshold = nextLevel.threshold;
        await loyaltyData.save();
      }

      return NextResponse.json({
        points: loyaltyData.totalPoints,
        lifetimePoints: loyaltyData.lifetimePoints,
        level: currentLevel.level,
        levelName: currentLevel.name,
        progressToNext: Math.min(loyaltyData.lifetimePoints / nextLevel.threshold, 1),
        nextLevelThreshold: nextLevel.threshold,
        transactions: loyaltyData.transactions.slice(-20).reverse() // Last 20 transactions
      });
    } else if (type === "rewards") {
      // Get available rewards
      const userLoyalty = await LoyaltyPoints.findOne({ userId: decoded.userId });
      const userLevel = userLoyalty?.level || 1;

      const rewards = await LoyaltyReward.find({
        isActive: true,
        minimumLevel: { $lte: userLevel },
        $or: [
          { validUntil: { $exists: false } },
          { validUntil: { $gte: new Date() } }
        ]
      }).sort({ pointsRequired: 1 });

      return NextResponse.json({
        rewards,
        userPoints: userLoyalty?.totalPoints || 0,
        userLevel
      });
    }

    return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 });
  } catch (error) {
    console.error("GET /api/buyer/loyalty error:", error);
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

    const { action, rewardId } = await req.json();

    if (action === "redeem" && rewardId) {
      // Redeem a reward
      const userLoyalty = await LoyaltyPoints.findOne({ userId: decoded.userId });
      if (!userLoyalty) {
        return NextResponse.json({ error: "Loyalty account not found" }, { status: 404 });
      }

      const reward = await LoyaltyReward.findById(rewardId);
      if (!reward || !reward.isActive) {
        return NextResponse.json({ error: "Reward not available" }, { status: 404 });
      }

      if (userLoyalty.totalPoints < reward.pointsRequired) {
        return NextResponse.json({ error: "Insufficient points" }, { status: 400 });
      }

      if (userLoyalty.level < reward.minimumLevel) {
        return NextResponse.json({ error: "Insufficient loyalty level" }, { status: 400 });
      }

      // Check usage limits
      if (reward.maxUses && reward.currentUses >= reward.maxUses) {
        return NextResponse.json({ error: "Reward limit reached" }, { status: 400 });
      }

      // Redeem the reward
      userLoyalty.totalPoints -= reward.pointsRequired;
      userLoyalty.transactions.push({
        type: "redeemed",
        points: reward.pointsRequired,
        reason: `Redeemed: ${reward.title}`,
        createdAt: new Date()
      });

      reward.currentUses += 1;

      await userLoyalty.save();
      await reward.save();

      return NextResponse.json({
        message: "Reward redeemed successfully",
        remainingPoints: userLoyalty.totalPoints,
        reward: reward.title
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("POST /api/buyer/loyalty error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}