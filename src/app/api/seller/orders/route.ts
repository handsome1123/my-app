import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { verifyToken } from "@/lib/jwt";

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

    const filter = { sellerId: decoded.id };

    // Find all orders where sellerId matches logged-in seller
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate("productId", "name price imageUrl")
      .populate("buyerId", "name email");

    const count = await Order.countDocuments(filter);

    return NextResponse.json({ success: true, count, orders }, { status: 200 });
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
