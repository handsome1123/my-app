import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import jwt, { JwtPayload } from "jsonwebtoken";
import { connectToDatabase } from "@/lib/mongodb";
import { commissionService } from "@/lib/commission";

/*
  POST body: { orderId: string }
  Environment required: MONGODB_URI, MONGODB_DB, COMMISSION_PERCENT (optional), JWT_SECRET (optional)
*/

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId } = body || {};
    if (!orderId) return NextResponse.json({ error: "Missing orderId" }, { status: 400 });

    const auth = req.headers.get("authorization") || "";
    if (!auth.startsWith("Bearer ")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const token = auth.split(" ")[1];

    // Verify token -> buyerId
    const buyerId = await resolveUserIdFromToken(token);
    if (!buyerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { db } = await connectToDatabase();

    // Fetch order
    const ordersCol = db.collection("orders");
    const order = await ordersCol.findOne({ _id: new ObjectId(orderId) });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    if (String(order.buyerId) !== String(buyerId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    console.log(`Confirming receipt for order ${orderId} by buyer ${buyerId}`);

    // Update order status to 'completed'
    await ordersCol.updateOne(
      { _id: order._id },
      { $set: { status: "completed", completedAt: new Date() } }
    );

    console.log(`Order ${orderId} marked as completed`);

    // Create payout request using centralized commission service
    const gross = Number(order.total ?? order.totalPrice ?? 0);
    const { commission, netAmount } = commissionService.calculate(gross);

    const payoutsCol = db.collection("payouts");
    const insertRes = await payoutsCol.insertOne({
      orderId: order._id,
      sellerId: order.sellerId,
      grossAmount: gross,
      commission,
      netAmount,
      currency: order.currency ?? "THB",
      status: "pending",
      createdAt: new Date(),
    });

    console.log(`Payout request created for seller ${order.sellerId}, amount: ${netAmount}`);

    return NextResponse.json({ ok: true, payoutId: insertRes.insertedId.toString() });
  } catch (err) {
    console.error("confirm order error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/* ---------- Helpers ---------- */
async function resolveUserIdFromToken(token: string): Promise<string | null> {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) return token || null;

  try {
    const payload = jwt.verify(token, jwtSecret);

    if (typeof payload === "string") {
      // JWT payload is a plain string
      return null;
    }

    // Cast to include optional fields
    const data = payload as JwtPayload & { userId?: string; id?: string };
    return data.sub || data.userId || data.id || null;
  } catch (err) {
    console.warn("JWT verify failed:", err);
    return null;
  }
}
