// /api/buyer/request-seller-confirmation/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { User } from "@/models/User";
import { verifyToken } from "@/lib/jwt";
import nodemailer from "nodemailer";

interface CheckoutForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
  stock?: number; // Changed from stockCount to match your data structure
  stockCount?: number; // Keep both for compatibility
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Verify buyer token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token) as { id: string; role?: string } | null;

    if (!decoded || decoded.role !== "buyer") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const buyerId = decoded.id;
    const body = await req.json();
    const { productId, quantity, customerInfo }: { productId: string; quantity: number; customerInfo: CheckoutForm } = body;

    if (!productId || !quantity || !customerInfo) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Fetch product
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Fetch seller
    const seller = await User.findOne({ _id: product.sellerId, role: "seller" });
    if (!seller) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    // Create order matching your schema
    const newOrder = await Order.create({
      buyerId,
      productId,
      sellerId: product.sellerId,
      quantity,
      totalPrice: product.price * quantity,
      status: "pending", // must match enum
      shippingAddress: customerInfo,
    });

    // Create confirmation URLs
    const confirmUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/seller/orders/confirm?orderId=${newOrder._id}&action=confirm`;
    const rejectUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/seller/orders/confirm?orderId=${newOrder._id}&action=reject`;


    // Send email
    await sendSellerEmail(seller.email, seller.name || seller.username, product, quantity, customerInfo, product.price * quantity, confirmUrl, rejectUrl, newOrder._id.toString());

    return NextResponse.json({
      orderId: newOrder._id,
      status: newOrder.status,
      message: "Notification sent to seller successfully",
    });
  } catch (error) {
    console.error("Error in request-seller-confirmation:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Email sending function
async function sendSellerEmail(
  sellerEmail: string,
  sellerName: string,
  product: Product,
  quantity: number,
  customerInfo: CheckoutForm,
  totalPrice: number,
  confirmUrl: string,
  rejectUrl: string,
  orderId: string
) {
  const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // ✅ allow self-signed certs for testing
  },
});

  const html = `
  <h2>New Order Confirmation Required</h2>
  <p>Hello ${sellerName},</p>
  <p>You have a new order for <strong>${product.name}</strong> (${quantity} pcs). Total: ฿${totalPrice}</p>
  <p>Customer: ${customerInfo.firstName} ${customerInfo.lastName}, Email: ${customerInfo.email}, Phone: ${customerInfo.phone}</p>
  <p>Order ID: ${orderId}</p>
  <br/>
  <p>
    👉 Please log in to your dashboard to confirm or reject this order:  
    <a href="${process.env.NEXT_PUBLIC_BASE_URL}/login" 
       style="display:inline-block;padding:10px 20px;background:#4F46E5;color:#fff;
              text-decoration:none;border-radius:6px;font-weight:bold;">
      Go to Dashboard
    </a>
  </p>
`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: sellerEmail,
    subject: `🛍️ New Order #${orderId} - Confirmation Required`,
    html,
  });
}
