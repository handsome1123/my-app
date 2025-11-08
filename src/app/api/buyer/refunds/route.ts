import { NextResponse } from "next/server";
import { Document, ObjectId } from "mongodb";
import jwt, { JwtPayload } from "jsonwebtoken";
import { connectToDatabase } from "@/lib/mongodb";

/*
POST /api/buyer/refunds
  body: { orderId, amount?, reason, details?, evidenceUrls?: string[] }

GET /api/buyer/refunds
  returns list of refunds for authenticated buyer
*/

async function resolveUserIdFromToken(token: string | null): Promise<string | null> {
  if (!token) return null;
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) return token;

  try {
    const payload = jwt.verify(token, jwtSecret);
    if (typeof payload === "string") return null; // plain string payload
    const data = payload as JwtPayload & { userId?: string; id?: string };
    return data.sub || data.userId || data.id || null;
  } catch (err) {
    console.warn("JWT verify failed:", err);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const tokenHeader = req.headers.get("authorization") || "";
    if (!tokenHeader.startsWith("Bearer "))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = tokenHeader.split(" ")[1];
    const buyerId = await resolveUserIdFromToken(token);
    if (!buyerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { orderId, amount, reason, details, evidenceUrls } = body || {};

    if (!orderId || !reason)
      return NextResponse.json({ error: "orderId and reason are required" }, { status: 400 });

    const { db } = await connectToDatabase();

    const ordersCol = db.collection("orders");
    const order = await ordersCol.findOne({ _id: new ObjectId(orderId) });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (String(order.buyerId) !== String(buyerId))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const refundAmount = typeof amount === "number" ? amount : Number(order.total ?? order.totalPrice ?? 0);

    const refundsCol = db.collection("refunds");
    const insertRes = await refundsCol.insertOne({
      orderId: order._id,
      buyerId: new ObjectId(buyerId),
      sellerId: order.sellerId ? new ObjectId(order.sellerId) : null,
      amount: refundAmount,
      currency: order.currency ?? "THB",
      reason,
      details: details ?? "",
      evidenceUrls: Array.isArray(evidenceUrls) ? evidenceUrls : [],
      status: "pending",
      requestedAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ ok: true, refundId: insertRes.insertedId.toString() });
  } catch (err) {
    console.error("POST /api/buyer/refunds error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const tokenHeader = req.headers.get("authorization") || "";
    if (!tokenHeader.startsWith("Bearer "))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = tokenHeader.split(" ")[1];
    const buyerId = await resolveUserIdFromToken(token);
    if (!buyerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { db } = await connectToDatabase();
    const refundsCol = db.collection("refunds");
    const docs = await refundsCol
      .find({ buyerId: new ObjectId(buyerId) })
      .sort({ requestedAt: -1 })
      .limit(200)
      .toArray();

    const refunds = docs.map((d: Document) => ({
      id: String(d._id),
      orderId: String(d.orderId),
      amount: d.amount,
      currency: d.currency,
      reason: d.reason,
      details: d.details,
      evidenceUrls: d.evidenceUrls || [],
      status: d.status,
      requestedAt: d.requestedAt,
      updatedAt: d.updatedAt,
    }));

    return NextResponse.json({ refunds });
  } catch (err) {
    console.error("GET /api/buyer/refunds error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
