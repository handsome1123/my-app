// /api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";

// Initialize Stripe with the latest stable API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-08-27.basil", // Match your Stripe SDK version
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text(); // raw body (important for webhook verification)
    const sig = req.headers.get("stripe-signature");

    if (!sig) {
      console.error("Missing Stripe signature header");
      return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch {
      console.error("Webhook signature verification failed:");
      return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
    }

    await connectDB();

    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        await Order.findOneAndUpdate(
          { stripePaymentIntentId: paymentIntent.id },
          {
            $set: {
              status: "paid",
              paymentCompletedAt: new Date(),
              updatedAt: new Date(),
              webhookProcessed: true,
            },
          }
        );

        console.log("✅ Payment succeeded:", paymentIntent.id);
        break;
      }

      case "payment_intent.payment_failed": {
        const failedPayment = event.data.object as Stripe.PaymentIntent;

        await Order.findOneAndUpdate(
          { stripePaymentIntentId: failedPayment.id },
          {
            $set: {
              status: "payment_failed",
              paymentFailedAt: new Date(),
              updatedAt: new Date(),
              failureReason:
                failedPayment.last_payment_error?.message || "Payment failed",
            },
          }
        );

        console.log("❌ Payment failed:", failedPayment.id);
        break;
      }

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
