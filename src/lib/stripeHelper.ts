// src/lib/stripeHelper.ts
import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export function getStripeInstance(): Stripe {
  if (stripeInstance) return stripeInstance;
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) throw new Error("Stripe secret key not configured");
  stripeInstance = new Stripe(stripeSecret);
  return stripeInstance;
}
