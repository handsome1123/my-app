// Load .env.local into process.env without external deps
import fs from "fs";
import path from "path";

(() => {
	// Load .env.local (if present) and populate process.env for the test runtime
	const envFile = path.resolve(process.cwd(), ".env.local");
	if (fs.existsSync(envFile)) {
		const src = fs.readFileSync(envFile, "utf8");
		src.split(/\r?\n/).forEach((line) => {
			const s = line.trim();
			if (!s || s.startsWith("#")) return;
			const idx = s.indexOf("=");
			if (idx === -1) return;
			const key = s.slice(0, idx).trim();
			let val = s.slice(idx + 1).trim();
			// Strip surrounding quotes if any
			if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
				val = val.slice(1, -1);
			}
			// Do not overwrite existing env vars set by CI or the shell
			if (process.env[key] === undefined) process.env[key] = val;
		});
	}
})();

import { test, expect, APIRequestContext } from "@playwright/test";
import { connectToDatabase } from "@/lib/mongodb";
import jwt from "jsonwebtoken";
import Stripe from "stripe";
import { ObjectId, Db } from "mongodb";
import { commissionService } from "@/lib/commission";

interface Order {
    _id: ObjectId;
    status: string;
    paidAt?: Date;
    stripePaymentIntentId?: string;
    items?: {
        sellerId: ObjectId;
        price: number;
        quantity: number;
    }[];
}

interface Product {
    _id: ObjectId;
    stock: number;
}

// Test data cleanup helper
async function cleanupTestData(db: Db, ids: { buyerId?: ObjectId; sellerId?: ObjectId; productId?: ObjectId; orderId?: string }) {
  try {
    if (ids.orderId) {
      const oid = new ObjectId(ids.orderId);
      await db.collection("orders").deleteOne({ _id: oid });
      await db.collection("payouts").deleteMany({ orderId: oid });
    }
    if (ids.buyerId) {
      await db.collection("users").deleteOne({ _id: ids.buyerId });
      await db.collection("carts").deleteMany({ userId: ids.buyerId });
    }
    if (ids.productId) await db.collection("products").deleteOne({ _id: ids.productId });
    if (ids.sellerId) await db.collection("users").deleteOne({ _id: ids.sellerId });
  } catch (err) {
    console.warn("Cleanup error:", err);
  }
}

test.describe("Checkout + Stripe webhook flow", () => {
  let testIds: { buyerId?: ObjectId; sellerId?: ObjectId; productId?: ObjectId; orderId?: string } = {};
  let db: Db;
  let stripe: Stripe;

  test.beforeAll(async () => {
    const conn = await connectToDatabase();
    db = conn.db;
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: "2022-11-15" });
  });

  test.afterEach(async () => {
    await cleanupTestData(db, testIds);
    // Also cleanup stripe_events
    await db.collection("stripe_events").deleteMany({});
  });

  test("create order and process webhook events", async ({ request }) => {
    // ensure env variables are present
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const jwtSecret = process.env.JWT_SECRET;
    if (!stripeSecret || !webhookSecret || !jwtSecret) {
      test.skip(true, "Missing STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET / JWT_SECRET in environment");
      return;
    }

    // connect to DB
    const { db } = await connectToDatabase();

    // create test seller user
    const sellerRes = await db.collection("users").insertOne({
      name: "Test Seller",
      email: `seller+${Date.now()}@example.com`,
      role: "seller",
      createdAt: new Date(),
      connectedAccountId: process.env.SELLER_CONNECTED_ACCOUNT_ID || null,
    });
    const sellerId = sellerRes.insertedId;

    // create test buyer user
    const buyerRes = await db.collection("users").insertOne({
      name: "Test Buyer",
      email: `buyer+${Date.now()}@example.com`,
      role: "buyer",
      createdAt: new Date(),
    });
    const buyerId = buyerRes.insertedId;

    // Create JWT token for buyer (signed with JWT_SECRET)
    const token = jwt.sign({ sub: String(buyerId), email: `buyer+${Date.now()}@example.com` }, jwtSecret as string, { expiresIn: "1h" });

    // create a product
    const productRes = await db.collection("products").insertOne({
      name: "E2E Test Product",
      description: "Test product for E2E",
      price: 199.5,
      stock: 10,
      imageUrl: "",
      sellerId,
      createdAt: new Date(),
    });
    const productId = productRes.insertedId;

    // Add item to cart via API
    const addRes = await request.post("/api/buyer/cart", {
      headers: { Authorization: `Bearer ${token}` },
      data: { productId: String(productId), quantity: 1 },
    });
    expect(addRes.ok()).toBeTruthy();

    // Create order via API (from cart)
    const createRes = await request.post("/api/buyer/create-order", {
      headers: { Authorization: `Bearer ${token}` },
      data: {},
    });
    expect(createRes.ok()).toBeTruthy();
    const createJson = await createRes.json();
    expect(createJson.orderId).toBeTruthy();
    expect(createJson.clientSecret).toBeTruthy();
    const orderId = createJson.orderId;

    // Simulate Stripe webhook payment_intent.succeeded
    const stripe = new Stripe(stripeSecret as string, { apiVersion: "2022-11-15" });

    const paymentIntent = {
      id: `pi_test_${Date.now()}`,
      metadata: { orderId },
    };

    const eventPayload = {
      id: `evt_test_${Date.now()}`,
      object: "event",
      type: "payment_intent.succeeded",
      data: { object: paymentIntent },
    };

    const payloadString = JSON.stringify(eventPayload);

    // generate test signature header (Stripe helper)
    // NOTE: stripe.webhooks.generateTestHeaderString exists in stripe SDK for testing
    const header = stripe.webhooks.generateTestHeaderString({
      payload: payloadString,
      secret: webhookSecret as string,
    });

    const webhookRes = await request.post("/api/webhooks/stripe", {
      headers: {
        "stripe-signature": header,
        "Content-Type": "application/json",
      },
      data: payloadString,
    });

    expect(webhookRes.ok()).toBeTruthy();
    const webhookJson = await webhookRes.json();
    expect(webhookJson.received).toBeTruthy();

    // Verify in DB: order status changed to paid
    const orderDoc = await db.collection<Order>("orders").findOne({ _id: new ObjectId(orderId) });
    expect(orderDoc).toBeTruthy();
    expect(orderDoc!.status).toBe("paid");

    // Additional assertions for order state
    const orderAfterPaid = await db.collection<Order>("orders").findOne({ _id: new ObjectId(orderId) });
    expect(orderAfterPaid!.status).toBe("paid");
    expect(orderAfterPaid!.paidAt).toBeTruthy();
    expect(orderAfterPaid!.stripePaymentIntentId).toBeTruthy();

    // Verify payout details
    const payouts = await db.collection("payouts").find({ orderId: new ObjectId(orderId) }).toArray();
    expect(payouts.length).toBe(1);
    expect(payouts[0].status).toBe("pending");
    expect(payouts[0].grossAmount).toBe(199.5);
    expect(payouts[0].commission).toBe(19.95);
    expect(payouts[0].netAmount).toBe(179.55);

    // Test payment_failed webhook
    const failedEvent = {
      id: `evt_test_failed_${Date.now()}`,
      object: "event",
      type: "payment_intent.payment_failed",
      data: { 
        object: {
          id: `pi_test_failed_${Date.now()}`,
          metadata: { orderId }
        }
      }
    };

    const failedRes = await request.post("/api/webhooks/stripe", {
      headers: {
        "stripe-signature": stripe.webhooks.generateTestHeaderString({
          payload: JSON.stringify(failedEvent),
          secret: webhookSecret as string,
        }),
        "Content-Type": "application/json",
      },
      data: JSON.stringify(failedEvent),
    });

    expect(failedRes.ok()).toBeTruthy();

    // Verify order status updated for failed payment
    const orderAfterFailed = await db.collection<Order>("orders").findOne({ _id: new ObjectId(orderId) });
    expect(orderAfterFailed!.status).toBe("payment_failed");
  });

  test("should handle concurrent order attempts for same product", async ({ request }) => {
    // Setup: Create product with limited stock
    const { productId, buyerId, token } = await setupTestData(db, { stock: 1 });
    testIds = { productId, buyerId };

    // Add item to cart first
    await request.post("/api/buyer/cart", {
      headers: { Authorization: `Bearer ${token}` },
      data: { productId: String(productId), quantity: 1 },
    });

    // Try to create order (should succeed)
    const res1 = await request.post("/api/buyer/create-order", {
      headers: { Authorization: `Bearer ${token}` },
      data: {},
    });

    // Try to create another order (should fail due to insufficient stock)
    const res2 = await request.post("/api/buyer/create-order", {
      headers: { Authorization: `Bearer ${token}` },
      data: {},
    });

    // One should succeed, one should fail due to insufficient stock
    expect(res1.ok()).toBeTruthy();
    expect(res2.ok()).toBeFalsy();

    // Check product stock is 0
    const product = await db.collection<Product>("products").findOne({ _id: productId });
    expect(product!.stock).toBe(0);
  });

  test("should handle refund webhook", async ({ request }) => {
    // Setup: Create and pay for an order first
    const { orderId, token } = await createAndPayOrder(db, request);
    testIds.orderId = orderId;

    // Simulate refund.created webhook
    const refundEvent = {
      id: `evt_refund_${Date.now()}`,
      type: "charge.refunded",
      data: {
        object: {
          payment_intent: `pi_${Date.now()}`,
          metadata: { orderId }
        }
      }
    };

    const webhookRes = await request.post("/api/webhooks/stripe", {
      headers: {
        "stripe-signature": stripe.webhooks.generateTestHeaderString({
          payload: JSON.stringify(refundEvent),
          secret: process.env.STRIPE_WEBHOOK_SECRET as string,
        }),
        "Content-Type": "application/json",
      },
      data: JSON.stringify(refundEvent),
    });

    expect(webhookRes.ok()).toBeTruthy();

    // Verify order and payout states after refund
    const order = await db.collection<Order>("orders").findOne({ _id: new ObjectId(orderId) });
    expect(order!.status).toBe("refunded");

    const payouts = await db.collection("payouts").find({ orderId: new ObjectId(orderId) }).toArray();
    for (const payout of payouts) {
      expect(payout.status).toBe("canceled");
    }
  });
});

// Helper functions
async function setupTestData(db: Db, opts = { stock: 10 }) {
  const sellerId = new ObjectId();
  const buyerId = new ObjectId();

  await db.collection("users").insertMany([
    { _id: sellerId, role: "seller", name: "Test Seller", email: `seller+${Date.now()}@example.com`, createdAt: new Date() },
    { _id: buyerId, role: "buyer", name: "Test Buyer", email: `buyer+${Date.now()}@example.com`, createdAt: new Date() }
  ]);

  const productId = new ObjectId();
  await db.collection("products").insertOne({
    _id: productId,
    sellerId,
    name: "Test Product",
    description: "Test product for E2E",
    price: 100,
    stock: opts.stock,
    imageUrl: "",
    createdAt: new Date(),
  });

  const token = jwt.sign(
    { sub: String(buyerId), email: `buyer+${Date.now()}@example.com` },
    process.env.JWT_SECRET as string,
    { expiresIn: "1h" }
  );

  return { sellerId, buyerId, productId, token };
}

async function createAndPayOrder(db: Db, request: APIRequestContext) {
  const { token } = await setupTestData(db);

  const orderRes = await request.post("/api/buyer/create-order", {
    headers: { Authorization: `Bearer ${token}` },
    data: {},
  });

  const orderData = await orderRes.json();
  const { orderId } = orderData;

  // Simulate successful payment
  await simulateSuccessfulPayment(db, orderId);

  return { orderId, token };
}

async function simulateSuccessfulPayment(db: Db, orderId: string) {
  const paymentIntent = {
    id: `pi_test_${Date.now()}`,
    metadata: { orderId },
  };

  await db.collection("orders").updateOne(
    { _id: new ObjectId(orderId) },
    {
      $set: {
        status: "paid",
        paidAt: new Date(),
        stripePaymentIntentId: paymentIntent.id,
        updatedAt: new Date(),
      },
    }
  );

  // Create payout records
  const order = await db.collection("orders").findOne({ _id: new ObjectId(orderId) });
  if (order?.items) {
    for (const item of order.items) {
      if (!item.sellerId) continue;
      const gross = item.price * item.quantity;
      const { commission, netAmount } = commissionService.calculate(gross);

      await db.collection("payouts").insertOne({
        orderId: new ObjectId(orderId),
        sellerId: new ObjectId(item.sellerId),
        grossAmount: gross,
        commission,
        netAmount,
        currency: "THB",
        status: "pending",
        createdAt: new Date(),
      });
    }
  }

  return paymentIntent;
}