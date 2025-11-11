// /api/webhooks/stripe/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "@/lib/mongodb";
import { commissionService } from "@/lib/commission";

// Initialize Stripe with the latest stable API version
const stripeSecret = process.env.STRIPE_SECRET_KEY || "";
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!stripeSecret) {
  // no runtime throw here to allow build; handler will return errors if used without config
  console.warn("STRIPE_SECRET_KEY is not configured");
}
// Fixed line
const stripe = new Stripe(stripeSecret, { apiVersion: "2025-10-29.clover" });

/*
  POST /api/webhooks/stripe

  Handles Stripe webhooks and:
  - on payment_intent.succeeded: mark order paid and create per-seller payout requests
  - idempotent: avoids double-processing if order already marked paid
*/

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature") || "";

  // Read raw body as buffer (required for signature verification)
  let buf: Buffer;
  try {
    const ab = await req.arrayBuffer();
    buf = Buffer.from(ab);
  } catch (err) {
    console.error("Failed to read request body", err);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(buf, signature, webhookSecret);
    } else {
      // Development fallback: parse without verification (not recommended for production)
      event = JSON.parse(buf.toString()) as Stripe.Event;
    }
  } catch (err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  console.error("Stripe webhook signature verification failed:", msg);
  return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
 }


  // --- Deduplication: record & check event.id in DB ---
  const { db } = await connectToDatabase();
  const eventsCol = db.collection("stripe_events");

  try {
    // if we already processed this event id, return early (idempotent)
    const existing = await eventsCol.findOne({ id: event.id });
    if (existing) {
      console.info(`Stripe webhook event ${event.id} already processed (status=${existing.status})`);
      return NextResponse.json({ received: true, idempotent: true });
    }

    // Insert a processing marker to prevent concurrent reprocessing
    await eventsCol.insertOne({
      id: event.id,
      type: event.type,
      status: "processing",
      receivedAt: new Date(),
    });
  } catch (err) {
    console.error("Error checking/inserting stripe_events record:", err);
    // if DB check fails, still try to process (best-effort) — but return error to surface issue
    return NextResponse.json({ error: "Server error (event dedup check)" }, { status: 500 });
  }

  // --- Process event and update dedup record with result ---
  try {
    const ordersCol = db.collection("orders");
    const payoutsCol = db.collection("payouts");

    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const orderIdStr = pi.metadata?.orderId;
        if (!orderIdStr) {
          console.warn("payment_intent.succeeded missing orderId metadata");
          break;
        }

        const orderId = new ObjectId(orderIdStr);
        const order = await ordersCol.findOne({ _id: orderId });
        if (!order) {
          console.warn("Order not found for webhook orderId:", orderIdStr);
          break;
        }

        if (order.status === "paid" || order.status === "completed") {
          console.info("Order already marked paid, skipping:", orderIdStr);
          break;
        }

        await ordersCol.updateOne(
          { _id: orderId },
          {
            $set: {
              status: "paid",
              paidAt: new Date(),
              stripePaymentIntentId: pi.id,
              updatedAt: new Date(),
            },
          }
        );

        // Create per-seller payout requests
        const items: { sellerId?: ObjectId, price?: number, quantity?: number }[] = Array.isArray(order.items) ? order.items : [];
        const bySeller = new Map<string, { gross: number; currency: string }>();

        for (const it of items) {
          const sellerId = it.sellerId ? String(it.sellerId) : null;
          if (!sellerId) continue;
          const line = Number(it.price || 0) * Number(it.quantity || 0);
          const prev = bySeller.get(sellerId) || { gross: 0, currency: order.currency || "THB" };
          prev.gross += line;
          bySeller.set(sellerId, prev);
        }

        for (const [sellerId, summary] of bySeller.entries()) {
          const gross = Math.round(summary.gross * 100) / 100;
          const { commission, netAmount } = commissionService.calculate(gross);

          const existingPayout = await payoutsCol.findOne({
            orderId: orderId,
            sellerId: new ObjectId(sellerId),
          });
          if (existingPayout) {
            console.info("Payout already exists for order/seller:", orderIdStr, sellerId);
            continue;
          }

          await payoutsCol.insertOne({
            orderId: orderId,
            sellerId: new ObjectId(sellerId),
            grossAmount: gross,
            commission,
            netAmount,
            currency: summary.currency || "THB",
            status: "pending",
            createdAt: new Date(),
          });
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const orderIdStr = pi.metadata?.orderId;
        if (orderIdStr) {
          const orderId = new ObjectId(orderIdStr);
          await ordersCol.updateOne({ _id: orderId }, { $set: { status: "payment_failed", updatedAt: new Date() } });
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const pi = charge.payment_intent as string;
        
        // Find order by payment intent
        let order = await ordersCol.findOne({ stripePaymentIntentId: pi });

        if (!order) {
          const orderIdStr = (charge as Stripe.Charge & { metadata?: { orderId?: string } })?.metadata?.orderId;
          if (orderIdStr) {
            order = await ordersCol.findOne({ _id: new ObjectId(orderIdStr) });
          }
        }

        if (!order) {
          console.warn("Order not found for refund event (no matching payment_intent or orderId)");
          break;
        }


        // Update order status
        await ordersCol.updateOne(
          { _id: order._id },
          { 
            $set: { 
              status: "refunded",
              refundedAt: new Date(),
              updatedAt: new Date(),
            }
          }
        );

        // Cancel any pending payouts
        await payoutsCol.updateMany(
          { 
            orderId: order._id,
            status: "pending"
          },
          {
            $set: {
              status: "canceled",
              updatedAt: new Date(),
              cancelReason: "order_refunded"
            }
          }
        );
        break;
      }

      // add more event handlers as needed
      default:
        console.info(`Unhandled event type ${event.type}`);
    }

    // Mark event processed
    await eventsCol.updateOne({ id: event.id }, { $set: { status: "processed", processedAt: new Date() } });

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook processing error:", err);
    // Update event record as failed, record error
    try {
      await eventsCol.updateOne({ id: event.id }, { $set: { status: "failed", error: String(err), failedAt: new Date() } });
    } catch (updErr) {
      console.error("Failed to update stripe_events failure status:", updErr);
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
