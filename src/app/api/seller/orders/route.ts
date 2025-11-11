import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { verifyToken } from "@/lib/jwt";
import { ObjectId } from "mongodb";

interface DecodedToken {
  id: string;
  role: string;
}

// ---------------- GET ----------------
export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer "))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token) as DecodedToken | null;

    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    if (decoded.role !== "seller")
      return NextResponse.json({ error: "Only sellers can view orders" }, { status: 403 });

    const sellerId = decoded.id;
    const sellerObjectId = new ObjectId(sellerId);

    // Use MongoDB aggregation to properly handle the items array structure
    const { db } = await connectToDatabase();
    const ordersCol = db.collection("orders");

    const orders = await ordersCol.aggregate([
      { $match: { "items.sellerId": sellerObjectId } },
      {
        $lookup: {
          from: "users",
          localField: "buyerId",
          foreignField: "_id",
          as: "buyerId"
        }
      },
      { $unwind: { path: "$items", preserveNullAndEmptyArrays: true } },
      { $match: { "items.sellerId": sellerObjectId } },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "productId"
        }
      },
      { $unwind: { path: "$productId", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$_id",
          buyerId: { $first: "$buyerId" },
          items: { $push: "$items" },
          subtotal: { $first: "$subtotal" },
          shipping: { $first: "$shipping" },
          total: { $first: "$total" },
          totalPrice: { $first: "$totalPrice" },
          status: { $first: "$status" },
          shippingAddress: { $first: "$shippingAddress" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
          productId: { $first: "$productId" }
        }
      },
      {
        $project: {
          _id: 1,
          buyerId: {
            _id: { $arrayElemAt: ["$buyerId._id", 0] },
            name: { $arrayElemAt: ["$buyerId.name", 0] },
            email: { $arrayElemAt: ["$buyerId.email", 0] },
            phone: { $arrayElemAt: ["$buyerId.phone", 0] },
            address: { $arrayElemAt: ["$buyerId.address", 0] },
            city: { $arrayElemAt: ["$buyerId.city", 0] },
            state: { $arrayElemAt: ["$buyerId.state", 0] },
            zipCode: { $arrayElemAt: ["$buyerId.zipCode", 0] }
          },
          productId: {
            _id: "$productId._id",
            name: "$productId.name",
            price: "$productId.price"
          },
          quantity: { $arrayElemAt: ["$items.quantity", 0] },
          totalPrice: { $ifNull: ["$totalPrice", "$total"] },
          status: 1,
          shippingAddress: 1,
          createdAt: 1,
          updatedAt: 1
        }
      },
      { $match: { "productId._id": { $ne: null } } },
      { $sort: { createdAt: -1 } }
    ]).toArray();

    return NextResponse.json({ success: true, count: orders.length, orders }, { status: 200 });
  } catch (error: unknown) {
    console.error("GET /api/seller/orders error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Server error" },
      { status: 500 }
    );
  }
}

// ---------------- PUT ----------------
// export async function PUT(
//   req: NextRequest,
//   context: { params: Promise<{ id: string }> }
// ) {
//   try {
//     await connectDB();

//     // 🔑 Verify seller token
//     const authHeader = req.headers.get("Authorization");
//     if (!authHeader?.startsWith("Bearer ")) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const token = authHeader.split(" ")[1];
//     const decoded = verifyToken(token) as { id: string; role?: string } | null;

//     if (!decoded || decoded.role !== "seller") {
//       return NextResponse.json({ error: "Access denied" }, { status: 403 });
//     }

//     const sellerId = decoded.id;
//     const body = await req.json();
//     const { status } = body;

//     if (!status) {
//       return NextResponse.json({ error: "Missing status" }, { status: 400 });
//     }

//     // 🔍 Await params for Next.js 15
//     const { id } = await context.params;
//     const order = await Order.findById(id);
//     if (!order) {
//       return NextResponse.json({ error: "Order not found" }, { status: 404 });
//     }

//     // ✅ Ensure seller owns this order
//     if (order.sellerId.toString() !== sellerId) {
//       return NextResponse.json({ error: "Not authorized for this order" }, { status: 403 });
//     }

//     // ⛔ Prevent confirming without payment slip
//     if (status === "confirmed" && !order.paymentSlipUrl) {
//       return NextResponse.json(
//         { error: "Cannot confirm order. No payment slip uploaded." },
//         { status: 400 }
//       );
//     }

//     // ✅ Update status
//     order.status = status;
//     await order.save();

//     return NextResponse.json({ success: true, order });
//   } catch (error) {
//     console.error("Error updating order:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }
