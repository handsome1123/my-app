import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Payout } from "@/models/Payout";
import { verifyToken } from "@/lib/jwt";

interface DecodedToken {
  id: string;
  role: string;
}

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token) as DecodedToken | null;
    if (!decoded || decoded.role !== "seller") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const sellerId = decoded.id;

    // Get all payouts for this seller
    const payouts = await Payout.find({ sellerId })
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate earnings summary
    const totalEarnings = payouts
      .filter(p => p.status === "paid")
      .reduce((sum, p) => sum + p.netAmount, 0);

    const availableBalance = payouts
      .filter(p => p.status === "pending")
      .reduce((sum, p) => sum + p.netAmount, 0);

    const pendingPayouts = payouts
      .filter(p => p.status === "processing" || p.status === "retrying")
      .reduce((sum, p) => sum + p.netAmount, 0);

    const totalPaid = payouts
      .filter(p => p.status === "paid")
      .reduce((sum, p) => sum + p.netAmount, 0);

    const recentPayouts = payouts.slice(0, 5).map(payout => ({
      _id: payout._id.toString(),
      orderId: payout.orderId.toString(),
      grossAmount: payout.grossAmount,
      commission: payout.commission,
      netAmount: payout.netAmount,
      status: payout.status,
      createdAt: payout.createdAt.toISOString(),
      paidAt: payout.paidAt?.toISOString(),
    }));

    return NextResponse.json({
      totalEarnings,
      availableBalance,
      pendingPayouts,
      totalPaid,
      recentPayouts,
    });
  } catch (error: unknown) {
    console.error("Error fetching earnings:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Server error" },
      { status: 500 }
    );
  }
}