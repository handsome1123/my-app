import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "@/lib/mongodb";
import { resolveUserIdFromToken } from "@/lib/jwtHelper";

/*
POST /api/buyer/confirm-payment
- Confirms payment after successful QR scan
- Updates order status to "paid"
*/

export async function POST(req: Request) {
  try {
    const auth = req.headers.get("authorization") || "";
    if (!auth.startsWith("Bearer ")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const token = auth.split(" ")[1];
    const buyerId = await resolveUserIdFromToken(token);
    if (!buyerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { orderId, paymentIntentId } = await req.json();

    const { db } = await connectToDatabase();
    const ordersCol = db.collection("orders");

    console.log(`Confirming payment for order ${orderId} by buyer ${buyerId}`);

    // Find and update order
    const order = await ordersCol.findOneAndUpdate(
      { _id: new ObjectId(orderId), buyerId: new ObjectId(buyerId) },
      { $set: { status: "paid", paidAt: new Date() } },
      { returnDocument: "after" }
    );

    if (!order) {
      console.log(`Order ${orderId} not found for buyer ${buyerId}`);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    console.log(`Order ${orderId} payment confirmed successfully`);

    // TODO: Notify seller about new order

    return NextResponse.json({ ok: true, message: "Payment confirmed" });
  } catch (err) {
    console.error("Confirm payment error:", err);
    return NextResponse.json({ error: "Failed to confirm payment" }, { status: 500 });
  }
}