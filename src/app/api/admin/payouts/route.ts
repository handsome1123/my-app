import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Document, ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

/*
  GET /api/admin/payouts?status=pending
  Admin-only: verifies JWT and checks users.role === "admin"
*/

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get("status") || "pending";

    const auth = req.headers.get("authorization") || "";
    if (!auth.startsWith("Bearer ")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const token = auth.split(" ")[1];

    const adminId = await resolveUserIdFromToken(token);
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { db } = await connectToDatabase();
    const usersCol = db.collection("users");
    const admin = await usersCol.findOne({ _id: new ObjectId(adminId) });
    if (!admin || admin.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const payoutsCol = db.collection("payouts");
    const cursor = payoutsCol.find({ status }).sort({ createdAt: -1 }).limit(500);
    const docs = await cursor.toArray();

    // convert ObjectId to string for client
    const payouts = docs.map((d: Document) => ({
      _id: String(d._id),
      orderId: String(d.orderId || ""),
      sellerId: String(d.sellerId || ""),
      grossAmount: d.grossAmount,
      commission: d.commission,
      netAmount: d.netAmount,
      currency: d.currency,
      status: d.status,
      createdAt: d.createdAt,
      providerId: d.providerId || null,
    }));

    return NextResponse.json({ payouts });
  } catch (err) {
    console.error("GET /api/admin/payouts error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/* Helpers */

async function resolveUserIdFromToken(token: string): Promise<string | null> {
  const jwtSecret = process.env.JWT_SECRET;
  if (jwtSecret) {
    try {
      const payload = jwt.verify(token, jwtSecret);
      if (typeof payload === 'string') {
        return null;
      }
      const jwtPayload = payload as jwt.JwtPayload;
      return jwtPayload.sub || jwtPayload.userId || jwtPayload.id || null;
    } catch (err) {
      console.warn("JWT verify failed:", err);
      return null;
    }
  }
  return token || null;
}
