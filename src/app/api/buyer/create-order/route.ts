import { NextResponse } from "next/server";
import { Document, ObjectId } from "mongodb";
import { connectToDatabase } from "@/lib/mongodb";
import { resolveUserIdFromToken } from "@/lib/jwtHelper";
import { getStripeInstance } from "@/lib/stripeHelper";
import { getErrorMessage } from "@/lib/errorHandler";

/*
POST /api/buyer/create-order
- Authenticates buyer
- Builds order from productId or cart
- Validates stock & prices
- Atomically decrements stock
- Creates Stripe PaymentIntent
- Returns { ok, orderId, clientSecret }
*/

export async function POST(req: Request) {
  try {
    // Auth
    const auth = req.headers.get("authorization") || "";
    if (!auth.startsWith("Bearer ")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const token = auth.split(" ")[1];
    const buyerId = await resolveUserIdFromToken(token);
    if (!buyerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { productId, quantity, shippingAddress } = body || {};

    const { db } = await connectToDatabase();
    const productsCol = db.collection("products");
    const cartsCol = db.collection("carts");
    const ordersCol = db.collection("orders");

    // Build items from productId or cart
    let items: { productId: ObjectId; quantity: number }[] = [];
    if (productId) {
      const qty = Number(quantity || 1);
      if (!ObjectId.isValid(productId)) return NextResponse.json({ error: "Invalid productId" }, { status: 400 });
      items = [{ productId: new ObjectId(productId), quantity: qty }];
    } else {
      const cart = await cartsCol.findOne({ userId: new ObjectId(buyerId) });
      if (!cart?.items?.length) return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
      items = cart.items.map((it: { productId: string; quantity: number }) => ({
        productId: new ObjectId(it.productId),
        quantity: Number(it.quantity || 1),
      }));
    }

    // Fetch product snapshots
    const productIds = items.map(it => it.productId);
    const products = await productsCol.find({ _id: { $in: productIds } }).toArray();
    const prodMap = new Map(products.map((p: Document) => [String(p._id), p]));

    // Validate stock and compute totals
    let subtotal = 0;
    const validated: { productId: ObjectId; name: string; price: number; quantity: number; sellerId: ObjectId | null }[] = [];
    for (const it of items) {
      const prod = prodMap.get(String(it.productId));
      if (!prod) return NextResponse.json({ error: `Product ${it.productId} not found` }, { status: 404 });
      const price = Number(prod.price ?? 0);
      const stock = Number(prod.stock ?? 0);
      if (stock < it.quantity) {
        return NextResponse.json({ error: "insufficient_stock", details: { productId: String(it.productId), available: stock, requested: it.quantity } }, { status: 400 });
      }
      subtotal += price * it.quantity;
      validated.push({ productId: prod._id, name: prod.name, price, quantity: it.quantity, sellerId: prod.sellerId ?? null });
    }

    // Atomically decrement stock, rollback if fails
    const decremented: { productId: ObjectId; quantity: number }[] = [];
    for (const it of validated) {
      const res = await productsCol.updateOne({ _id: it.productId, stock: { $gte: it.quantity } }, { $inc: { stock: -it.quantity } });
      if (!res.matchedCount) {
        for (const d of decremented) await productsCol.updateOne({ _id: d.productId }, { $inc: { stock: d.quantity } });
        return NextResponse.json({ error: "insufficient_stock_during_reserve", details: { productId: String(it.productId) } }, { status: 409 });
      }
      decremented.push({ productId: it.productId, quantity: it.quantity });
    }

    // Create order document
    const orderDoc: Document = {
      buyerId: new ObjectId(buyerId),
      items: validated.map(v => ({ ...v, sellerId: v.sellerId ? new ObjectId(v.sellerId) : null })),
      subtotal,
      shipping: 0,
      total: subtotal,
      currency: "THB",
      status: "pending_payment",
      shippingAddress: shippingAddress || null, // Include shipping address
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log("Creating order with shipping address:", shippingAddress);
    const insertRes = await ordersCol.insertOne(orderDoc);
    const orderId = insertRes.insertedId;

    // Stripe PaymentIntent
    try {
      const stripe = getStripeInstance();
      const pi = await stripe.paymentIntents.create({
        amount: Math.round(orderDoc.total * 100),
        currency: orderDoc.currency.toLowerCase(),
        payment_method_types: ["promptpay"],
        metadata: { orderId: orderId.toString(), buyerId },
      });
      await ordersCol.updateOne({ _id: orderId }, { $set: { paymentIntentId: pi.id, clientSecret: pi.client_secret, updatedAt: new Date() } });

      if (!productId) await cartsCol.deleteOne({ userId: new ObjectId(buyerId) });

      return NextResponse.json({ ok: true, orderId: orderId.toString(), clientSecret: pi.client_secret, amount: orderDoc.total });
    } catch (stripeErr) {
      const message = getErrorMessage(stripeErr);
      // Rollback stock & delete order
      for (const d of decremented) await productsCol.updateOne({ _id: d.productId }, { $inc: { stock: d.quantity } });
      await ordersCol.deleteOne({ _id: orderId });
      return NextResponse.json({ error: "payment_intent_failed", details: message }, { status: 500 });
    }
  } catch (err) {
    return NextResponse.json({ error: "Server error", details: getErrorMessage(err) }, { status: 500 });
  }
}
