import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import Stripe from "stripe";
import { connectToDatabase } from "@/lib/mongodb";

/*
POST body: { payoutId: string }
Requires secure admin auth. This handler marks payout as paid in DB.
Replace the "process with provider" block with actual SDK calls (Stripe Connect).
*/

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { payoutId } = body || {};
    if (!payoutId) return NextResponse.json({ error: "Missing payoutId" }, { status: 400 });

    const auth = req.headers.get("authorization") || "";
    if (!auth.startsWith("Bearer ")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const token = auth.split(" ")[1];

    // Resolve admin user id from JWT (or fallback token in dev)
    const adminUserId = await resolveUserIdFromToken(token);
    if (!adminUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { db } = await connectToDatabase();

    // verify admin role
    const usersCol = db.collection("users");
    const admin = await usersCol.findOne({ _id: new ObjectId(adminUserId) });
    if (!admin || admin.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const payoutsCol = db.collection("payouts");
    const payout = await payoutsCol.findOne({ _id: new ObjectId(payoutId) });
    if (!payout) return NextResponse.json({ error: "Payout not found" }, { status: 404 });
    if (payout.status !== "pending" && payout.status !== "retrying") return NextResponse.json({ error: "Payout already processed" }, { status: 400 });

    // fetch seller info
    const seller = await usersCol.findOne({ _id: new ObjectId(payout.sellerId) });
    if (!seller) return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    if (!seller.connectedAccountId) {
      return NextResponse.json({ error: "Seller missing payout account" }, { status: 400 });
    }

    // Initialize Stripe with server secret key
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) {
      return NextResponse.json({ error: "Payment provider not configured" }, { status: 500 });
    }
    const stripe = new Stripe(stripeSecret);

    // Create a Transfer to the connected account (Stripe Connect)
    // NOTE: Transfers require the platform to have available balance in the currency.
    // Depending on your integration you might instead create a separate PaymentIntent with transfer_data
    // or use payout APIs on the connected account. Adjust according to your Stripe integration model.
    const amountInCents = Math.round(Number(payout.netAmount) * 100);

    try {
      const transfer = await stripe.transfers.create({
        amount: amountInCents,
        currency: payout.currency || "thb",
        destination: seller.connectedAccountId,
        description: `Payout for order ${String(payout.orderId)}`,
        metadata: {
          payoutId: String(payout._id),
          orderId: String(payout.orderId),
        },
      });

      // mark payout as paid in DB
      await payoutsCol.updateOne(
        { _id: payout._id },
        {
          $set: {
            status: "paid",
            paidAt: new Date(),
            providerId: transfer.id,
            processedBy: new ObjectId(adminUserId),
            processedAt: new Date(),
          },
          $unset: {
            lastError: "",
            lastErrorAt: "",
            retryCount: "",
            nextRetryAt: "",
          },
        }
      );

      // Optionally: create a notification for the seller
      await db.collection("notifications").insertOne({
        userId: payout.sellerId,
        type: "payout_processed",
        payload: { payoutId: payout._id.toString(), transferId: transfer.id, amount: payout.netAmount },
        createdAt: new Date(),
      });

      return NextResponse.json({ ok: true, transferId: transfer.id });
    } catch (stripeErr) {
      console.error("Stripe transfer failed:", stripeErr);
      const message = stripeErr instanceof Stripe.errors.StripeError ? stripeErr.message : "Stripe transfer failed";
      const currentRetryCount = payout.retryCount || 0;
      const maxRetries = 3;
      const shouldRetry = currentRetryCount < maxRetries;

      const updateData: any = {
        lastError: message,
        lastErrorAt: new Date(),
        processedBy: new ObjectId(adminUserId),
        $inc: { retryCount: 1 },
      };

      if (shouldRetry) {
        // Mark for retry (exponential backoff: 1h, 4h, 12h)
        const retryDelays = [1, 4, 12]; // hours
        const delayHours = retryDelays[currentRetryCount] || 24;
        const nextRetryAt = new Date(Date.now() + delayHours * 60 * 60 * 1000);

        updateData.status = "retrying";
        updateData.nextRetryAt = nextRetryAt;

        console.info(`Payout ${payoutId} failed, will retry at ${nextRetryAt.toISOString()}`);
      } else {
        // Max retries reached, mark as failed
        updateData.status = "failed";
        console.error(`Payout ${payoutId} permanently failed after ${maxRetries} retries`);
      }

      await payoutsCol.updateOne({ _id: payout._id }, { $set: updateData });

      const responseMessage = shouldRetry ?
        `Payment provider error (will retry)` :
        `Payment provider error (max retries exceeded)`;

      return NextResponse.json({ error: responseMessage, details: message }, { status: 500 });
    }
  } catch (err) {
    console.error("process payout error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/* ---------- Helpers ---------- */

interface JwtPayload {
  sub?: string;
  userId?: string;
  id?: string;
}

async function resolveUserIdFromToken(token: string): Promise<string | null> {
  const jwtSecret = process.env.JWT_SECRET;
  if (jwtSecret) {
    try {
      const payload = jwt.verify(token, jwtSecret) as JwtPayload;
      return payload.sub || payload.userId || payload.id || null;
    } catch (err) {
      console.warn("JWT verify failed:", err);
      return null;
    }
  }
  // Fallback: treat token as userId for local/dev
  return token || null;
}
