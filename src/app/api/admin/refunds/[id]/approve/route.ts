import { NextResponse, NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import jwt, { JwtPayload } from "jsonwebtoken";
import Stripe from "stripe";
import { connectToDatabase } from "@/lib/mongodb";

async function resolveUserIdFromToken(token: string | null): Promise<string | null> {
  if (!token) return null;
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) return null;

  try {
    const payload = jwt.verify(token, jwtSecret);
    if (typeof payload === "string") return null;

    const data = payload as JwtPayload & { userId?: string; id?: string };
    return data.sub || data.userId || data.id || null;
  } catch {
    return null;
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const auth = req.headers.get("authorization") || "";
    if (!auth.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = auth.split(" ")[1];
    const adminId = await resolveUserIdFromToken(token);
    if (!adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const usersCol = db.collection("users");
    const admin = await usersCol.findOne({ _id: new ObjectId(adminId) });
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const refundsCol = db.collection("refunds");
    const refund = await refundsCol.findOne({ _id: new ObjectId(id) });
    if (!refund) {
      return NextResponse.json({ error: "Refund not found" }, { status: 404 });
    }
    if (refund.status !== "pending") {
      return NextResponse.json({ error: "Refund not pending" }, { status: 400 });
    }

    const ordersCol = db.collection("orders");
    const order = await ordersCol.findOne({ _id: refund.orderId });
    if (!order) {
      return NextResponse.json({ error: "Related order not found" }, { status: 404 });
    }

    const paymentIntentId = order.stripePaymentIntentId || order.paymentIntentId || null;
    if (!paymentIntentId) {
      return NextResponse.json({ error: "Order missing payment reference" }, { status: 400 });
    }

    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) {
      return NextResponse.json({ error: "Payment provider not configured" }, { status: 500 });
    }

    // ✅ Safe Stripe initialization
    const stripe = new Stripe(stripeSecret);

    try {
      const stripeRefund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: Math.round((refund.amount || refund.requestedAmount || 0) * 100),
      });

      await refundsCol.updateOne(
        { _id: refund._id },
        {
          $set: {
            status: "approved",
            providerRefundId: stripeRefund.id,
            processedAt: new Date(),
            processedBy: new ObjectId(adminId),
          },
        }
      );

      return NextResponse.json({ ok: true, providerRefundId: stripeRefund.id });
    } catch (stripeError) {
      const errorMessage =
        stripeError instanceof Error ? stripeError.message : String(stripeError);
      console.error("stripe refund error", stripeError);
      await refundsCol.updateOne(
        { _id: refund._id },
        { $set: { status: "failed", lastError: errorMessage, lastErrorAt: new Date() } }
      );
      return NextResponse.json(
        { error: "Provider refund failed", details: errorMessage },
        { status: 500 }
      );
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("admin refund approve error", err);
    return NextResponse.json(
      { error: "Server error", details: errorMessage },
      { status: 500 }
    );
  }
}
