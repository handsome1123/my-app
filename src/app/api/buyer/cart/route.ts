import { NextResponse } from "next/server";
import { Document, ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import { connectToDatabase } from "@/lib/mongodb";

async function resolveUserIdFromToken(token: string | null): Promise<string | null> {
  if (!token) return null;
  const jwtSecret = process.env.JWT_SECRET;
  if (jwtSecret) {
    try {
      const payload = jwt.verify(token, jwtSecret);
      if (typeof payload === "string") {
        // Token payload is just a string, not an object
        return null;
      }
      const data = payload as jwt.JwtPayload & { userId?: string; id?: string };
      return data.sub || data.userId || data.id || null;
    } catch {
      return null;
    }
  }
  return token;
}

export async function GET(req: Request) {
  try {
    const auth = req.headers.get("authorization") || "";
    if (!auth.startsWith("Bearer ")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const token = auth.split(" ")[1];
    const userId = await resolveUserIdFromToken(token);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { db } = await connectToDatabase();
    const cartsCol = db.collection("carts");
    const productsCol = db.collection("products");

    // find cart
    const cartDoc = await cartsCol.findOne({ userId: new ObjectId(userId) });
    if (!cartDoc || !Array.isArray(cartDoc.items) || cartDoc.items.length === 0) {
      return NextResponse.json({ cart: { userId: new ObjectId(userId), items: [] } });
    }

    // collect productIds and fetch product details
    const productIds = cartDoc.items.map((it: { productId: string }) => new ObjectId(it.productId));
    const products = await productsCol.find({ _id: { $in: productIds } }).toArray();
    const productsMap = new Map(products.map((p: Document) => [String(p._id), p]));

    // build populated items with current product snapshot (name, price, stock, imageUrl)
    const populatedItems = cartDoc.items.map((it: { productId: string, quantity: number }) => {
      const pid = String(it.productId);
      const prod = productsMap.get(pid);
      return {
        productId: {
          _id: pid,
          name: prod?.name ?? null,
          price: prod?.price ?? null,
          stock: prod?.stock ?? null,
          imageUrl: prod?.imageUrl ?? null,
        },
        quantity: it.quantity,
      };
    });

    return NextResponse.json({ cart: { userId: String(cartDoc.userId), items: populatedItems } });
  } catch (err) {
    console.error("GET /api/buyer/cart", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = req.headers.get("authorization") || "";
    if (!auth.startsWith("Bearer ")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const token = auth.split(" ")[1];
    const userId = await resolveUserIdFromToken(token);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { productId, quantity = 1 } = body || {};
    if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

    const { db } = await connectToDatabase();
    const carts = db.collection("carts");
    const cart = await carts.findOne({ userId: new ObjectId(userId) });

    if (cart) {
      // update or push
      await carts.updateOne(
        { _id: cart._id },
        { $pull: { items: { productId: new ObjectId(productId) } } }
      );
      await carts.updateOne(
        { _id: cart._id },
        { $push: { items: { productId: new ObjectId(productId), quantity: Number(quantity) } } }
      );
      const updated = await carts.findOne({ _id: cart._id });
      return NextResponse.json({ cart: updated });
    } else {
      const insert = await carts.insertOne({
        userId: new ObjectId(userId),
        items: [{ productId: new ObjectId(productId), quantity: Number(quantity) }],
        updatedAt: new Date(),
      });
      const newCart = await carts.findOne({ _id: insert.insertedId });
      return NextResponse.json({ cart: newCart });
    }
  } catch (err) {
    console.error("POST /api/buyer/cart", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const auth = req.headers.get("authorization") || "";
    if (!auth.startsWith("Bearer ")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const token = auth.split(" ")[1];
    const userId = await resolveUserIdFromToken(token);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const productId = url.searchParams.get("productId");
    if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

    const { db } = await connectToDatabase();
    await db.collection("carts").updateOne(
      { userId: new ObjectId(userId) },
      { $pull: { items: { productId: new ObjectId(productId) } } }
    );

    const cart = await db.collection("carts").findOne({ userId: new ObjectId(userId) });
    return NextResponse.json({ cart });
  } catch (err) {
    console.error("DELETE /api/buyer/cart", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
