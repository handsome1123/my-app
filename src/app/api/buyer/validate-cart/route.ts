import { NextResponse } from "next/server";
import { Document, ObjectId } from "mongodb";
import jwt, { JwtPayload } from "jsonwebtoken";
import { connectToDatabase } from "@/lib/mongodb";

async function resolveUserIdFromToken(token: string | null): Promise<string | null> {
  if (!token) return null;
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) return token; // fallback for dev/local

  try {
    const payload = jwt.verify(token, jwtSecret);
    if (typeof payload === "string") return null; // JWT payload is just a string
    const data = payload as JwtPayload & { userId?: string; id?: string };
    return data.sub || data.userId || data.id || null;
  } catch (err) {
    console.warn("JWT verify failed:", err);
    return null;
  }
}

export async function GET(req: Request) {
  try {
    const auth = req.headers.get("authorization") || "";
    if (!auth.startsWith("Bearer "))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = auth.split(" ")[1];
    const userId = await resolveUserIdFromToken(token);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { db } = await connectToDatabase();
    const cartsCol = db.collection("carts");
    const productsCol = db.collection("products");

    const cart = await cartsCol.findOne({ userId: new ObjectId(userId) });
    if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
      return NextResponse.json({ valid: true, items: [], subtotal: 0 });
    }

    const items = cart.items;
    const productIds = items.map((it: { productId: string }) => new ObjectId(it.productId));
    const products = await productsCol.find({ _id: { $in: productIds } }).toArray();
    const productsMap = new Map(products.map((p: Document) => [String(p._id), p]));

    let subtotal = 0;
    const validatedItems = items.map((it: { productId: string; quantity: number }) => {
      const pid = String(it.productId);
      const prod = productsMap.get(pid);
      const price = Number(prod?.price ?? 0);
      const stock = Number(prod?.stock ?? 0);
      const quantity = Number(it.quantity || 0);
      const available = stock >= quantity;
      const lineTotal = price * quantity;
      subtotal += lineTotal;
      return {
        productId: pid,
        name: prod?.name ?? null,
        imageUrl: prod?.imageUrl ?? null,
        price,
        quantity,
        stock,
        available,
        lineTotal,
      };
    });

    const hasIssues = validatedItems.some((i) => !i.available);
    return NextResponse.json({ valid: !hasIssues, hasIssues, items: validatedItems, subtotal });
  } catch (err) {
    console.error("GET /api/buyer/validate-cart", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
