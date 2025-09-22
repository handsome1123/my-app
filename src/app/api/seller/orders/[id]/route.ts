// app/api/seller/orders/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order as OrderModel } from "@/models/Order";
import { verifyToken } from "@/lib/jwt";
import nodemailer from "nodemailer";

interface DecodedToken {
  id: string;
  role: string;
}

// interface ShippingAddress {
//   firstName: string;
//   lastName: string;
//   email: string;
//   phone: string;
//   address: string;
//   city: string;
//   state: string;
//   zipCode: string;
// }

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: orderId } = await context.params;

  try {
    await connectDB();

    // 🔑 Verify seller token
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
    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: "Missing status" }, { status: 400 });
    }

    const validStatuses = ["pending", "confirmed", "rejected", "delivered"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // 🔍 Find order with buyer & product populated (keep as Mongoose document)
    const order = await OrderModel.findById(orderId)
      .populate("buyerId", "name email")
      .populate("productId", "name price imageUrl");

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (order.sellerId.toString() !== sellerId) {
      return NextResponse.json({ error: "Not authorized for this order" }, { status: 403 });
    }

    // 📋 Status transition logic
    switch (status) {
      case "confirmed":
        if (order.status !== "pending") {
          return NextResponse.json({ error: "Only pending orders can be confirmed" }, { status: 400 });
        }
        order.confirmedAt = new Date();
        order.status = "confirmed";
        await order.save();

        // ✅ Email buyer
        if (order.buyerId?.email) {
          const paymentUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/${order._id}`;
          await sendEmail(
            order.buyerId.email, 
            order.buyerId.name, 
            `🛒 Your order #${order._id} is ready for payment`, 
            `
            <p>Hi <strong>${order.buyerId.name}</strong>,</p>
            <p>Your order <strong>${order._id}</strong> has been <span style="color:green;">confirmed by the seller</span>.</p>
            <p>Please proceed to payment to complete your order:</p>
            <p><a href="${paymentUrl}" style="padding:10px 20px; background-color:#6b21a8; color:#fff; text-decoration:none;">Pay Now</a></p>
          `);
        }
        break;

      case "rejected":
        if (order.status !== "pending") {
          return NextResponse.json({ error: "Only pending orders can be rejected" }, { status: 400 });
        }
        order.rejectedAt = new Date();
        order.status = "rejected";
        await order.save();

        // ✅ Email buyer
        if (order.buyerId?.email) {
          await sendEmail(
            order.buyerId.email, 
            order.buyerId.name, 
            `❌ Your order #${order._id} was rejected`, 
            `
            <p>Hi <strong>${order.buyerId.name}</strong>,</p>
            <p>We regret to inform you that your order <strong>${order._id}</strong> has been <span style="color:red;">rejected by the seller</span>.</p>
            <p>If you have any questions, please contact our support team.</p>
          `);
        }
        break;

      case "delivered":
        if (order.status !== "shipped") {
          return NextResponse.json({ error: "Only shipped orders can be marked as delivered" }, { status: 400 });
        }
        order.deliveredAt = new Date();
        order.status = "delivered";
        await order.save();
        break;

      default:
        break;
    }

    return NextResponse.json({ success: true, message: `Order ${status} successfully`, order });
  } catch (error: unknown) {
    console.error("Error updating order status:", error);
    return NextResponse.json({ error: (error as Error).message || "Server error" }, { status: 500 });
  }
}

// PUT for backward compatibility
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return PATCH(req, context);
}

// ---------------------
// Helper: Send email via Gmail
async function sendEmail(to: string, name: string, subject: string, html: string) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
    tls: { rejectUnauthorized: false },
  });

  await transporter.sendMail({
    from: `"SecondHand MFU" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  }).catch(console.error);
}