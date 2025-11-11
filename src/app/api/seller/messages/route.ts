import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { SellerMessage } from "@/models/SellerMessage";
import { Order } from "@/models/Order";
import { verifyToken } from "@/lib/jwt";

interface DecodedToken {
  id: string;
  role: string;
}

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token) as DecodedToken | null;
    if (!decoded || decoded.role !== "seller") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const sellerId = decoded.id;
    const url = new URL(req.url);
    const orderId = url.searchParams.get("orderId");

    const filter: any = { sellerId };

    if (orderId) {
      filter.orderId = orderId;
    }

    // Get conversation threads grouped by order
    const conversations = await SellerMessage.aggregate([
      { $match: filter },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: "$orderId",
          lastMessage: { $first: "$$ROOT" },
          messageCount: { $sum: 1 },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ["$isRead", false] },
                  { $eq: ["$senderType", "buyer"] }
                ]},
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "_id",
          as: "order"
        }
      },
      {
        $unwind: "$order"
      },
      {
        $lookup: {
          from: "products",
          localField: "order.items.productId",
          foreignField: "_id",
          as: "product"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "order.buyerId",
          foreignField: "_id",
          as: "buyer"
        }
      },
      {
        $project: {
          orderId: "$_id",
          lastMessage: 1,
          messageCount: 1,
          unreadCount: 1,
          orderNumber: { $substr: ["$order._id", 20, 4] },
          productName: { $arrayElemAt: ["$product.name", 0] },
          buyerName: { $arrayElemAt: ["$buyer.name", 0] },
          orderStatus: "$order.status",
          lastActivity: "$lastMessage.createdAt"
        }
      },
      {
        $sort: { lastActivity: -1 }
      }
    ]);

    const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

    return NextResponse.json({
      conversations,
      totalUnread,
      totalConversations: conversations.length
    });
  } catch (error: unknown) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token) as DecodedToken | null;
    if (!decoded || decoded.role !== "seller") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const sellerId = decoded.id;
    const { orderId, message, messageType = "text", attachments = [] } = await req.json();

    if (!orderId || !message?.trim()) {
      return NextResponse.json({ error: "Order ID and message are required" }, { status: 400 });
    }

    // Verify the order belongs to this seller
    const order = await Order.findOne({ _id: orderId, sellerId });
    if (!order) {
      return NextResponse.json({ error: "Order not found or access denied" }, { status: 404 });
    }

    const newMessage = new SellerMessage({
      orderId,
      sellerId,
      buyerId: order.buyerId,
      senderId: sellerId,
      senderType: "seller",
      message: message.trim(),
      messageType,
      attachments,
      isRead: false,
    });

    await newMessage.save();

    // Update order's last activity
    await Order.findByIdAndUpdate(orderId, {
      lastMessageAt: new Date(),
      updatedAt: new Date()
    });

    return NextResponse.json({
      success: true,
      message: newMessage
    });
  } catch (error: unknown) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Server error" },
      { status: 500 }
    );
  }
}