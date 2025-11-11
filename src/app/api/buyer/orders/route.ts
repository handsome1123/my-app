import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { verifyToken } from "@/lib/jwt";
import { ObjectId } from "mongodb";

interface DecodedToken {
  id: string;
  role?: string;
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    // Get buyer from token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token) as DecodedToken | null;

    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const buyerId = decoded.id;

    // Fetch buyer's orders using MongoDB directly to ensure proper population
    const { db } = await connectToDatabase();
    const ordersCol = db.collection("orders");

    // Convert buyerId to ObjectId for proper matching
    const buyerObjectId = new ObjectId(buyerId);

    const orders = await ordersCol.aggregate([
      { $match: { buyerId: buyerObjectId } },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: { path: "$items", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "itemProduct"
        }
      },
      { $unwind: { path: "$itemProduct", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$_id",
          buyerId: { $first: "$buyerId" },
          sellerId: { $first: "$sellerId" },
          items: { $push: "$items" },
          subtotal: { $first: "$subtotal" },
          shipping: { $first: "$shipping" },
          total: { $first: "$total" },
          totalPrice: { $first: "$totalPrice" },
          status: { $first: "$status" },
          shippingAddress: { $first: "$shippingAddress" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
          productDetails: { $first: "$itemProduct" }
        }
      },
      {
        $project: {
          _id: 1,
          buyerId: 1,
          sellerId: 1,
          productId: "$productDetails._id",
          quantity: { $arrayElemAt: ["$items.quantity", 0] },
          totalPrice: { $ifNull: ["$totalPrice", "$total"] },
          status: 1,
          shippingAddress: 1,
          createdAt: 1,
          updatedAt: 1,
          productDetails: {
            _id: "$productDetails._id",
            name: "$productDetails.name",
            price: "$productDetails.price",
            imageUrl: "$productDetails.imageUrl"
          }
        }
      },
      { $match: { productId: { $ne: null } } }, // Only include orders with valid products
      { $sort: { createdAt: -1 } }
    ]).toArray();

    console.log(`Found ${orders.length} orders for buyer ${buyerId}`);
    if (orders.length > 0) {
      console.log("Sample order:", {
        id: orders[0]._id,
        status: orders[0].status,
        product: orders[0].productDetails?.name,
        total: orders[0].totalPrice
      });
      console.log("Shipping address:", orders[0].shippingAddress);
      console.log("Full sample:", JSON.stringify(orders[0], null, 2));
    }

    // Transform the data to match frontend expectations
    const transformedOrders = orders.map(order => ({
      _id: order._id,
      productId: {
        _id: order.productDetails?._id,
        name: order.productDetails?.name || "Unknown Product",
        imageUrl: order.productDetails?.imageUrl,
        price: order.productDetails?.price
      },
      quantity: order.quantity || 1,
      totalPrice: order.totalPrice || order.total || 0,
      status: order.status,
      shippingAddress: order.shippingAddress,
      createdAt: order.createdAt,
      paymentSlipUrl: order.paymentSlipUrl
    }));

    console.log(`Returning ${transformedOrders.length} transformed orders`);

    return NextResponse.json({ orders: transformedOrders });
  } catch (err) {
    console.error("Fetch orders error:", err);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
