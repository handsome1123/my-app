import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { Order } from "@/models/Order";
import { User } from "@/models/User";
import { verifyToken } from "@/lib/jwt";
import cloudinary from "@/lib/cloudinary";

interface DecodedToken {
  id: string;
  role?: string;
}

interface CloudinaryUploadResult {
  secure_url: string;
  [key: string]: unknown;
}

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}


export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const form = await req.formData();
    const productId = form.get("productId") as string;
    const quantity = parseInt(form.get("quantity") as string, 10) || 1;
    const paymentSlip = form.get("paymentSlip") as File | null;
    const customerInfoRaw = form.get("customerInfo") as string | null;

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    if (!customerInfoRaw) {
      return NextResponse.json({ error: "Customer info is required" }, { status: 400 });
    }

    let customerInfo: CustomerInfo;
    try {
      customerInfo = JSON.parse(customerInfoRaw);
    } catch {
      return NextResponse.json({ error: "Invalid customer info format" }, { status: 400 });
    }

    // Token verification
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    let decoded: DecodedToken | null = null;
    try {
      decoded = verifyToken(token) as DecodedToken;
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const buyerId = decoded.id;

    // Fetch product and buyer
    const product = await Product.findById(productId);
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const buyer = await User.findById(buyerId);
    if (!buyer) return NextResponse.json({ error: "Buyer not found" }, { status: 404 });

    const totalPrice = (product.price || 0) * quantity;

    // Upload payment slip if provided
    let slipUrl: string | null = null;
    if (paymentSlip) {
      const buffer = Buffer.from(await paymentSlip.arrayBuffer());
      try {
        const uploaded = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "payment_slips" },
            (err, result) => (err ? reject(err) : resolve(result as CloudinaryUploadResult))
          );
          stream.end(buffer);
        });
        slipUrl = uploaded.secure_url;
      } catch (err) {
        console.error("Cloudinary upload error:", err);
        return NextResponse.json({ error: "Failed to upload payment slip" }, { status: 500 });
      }
    }

    const order = await Order.create({
      productId: product._id,
      buyerId: buyer._id,
      sellerId: product.sellerId,
      quantity,
      totalPrice,
      status: "pending",
      paymentSlipUrl: slipUrl,
      shippingAddress: {
        firstName: customerInfo.firstName || "",
        lastName: customerInfo.lastName || "",
        email: customerInfo.email || "",
        phone: customerInfo.phone || "",
        address: customerInfo.address || "",
        city: customerInfo.city || "",
        state: customerInfo.state || "",
        zipCode: customerInfo.zipCode || "",
      },
    });

    return NextResponse.json({ success: true, order: order.toObject() }, { status: 201 });
  } catch (error: unknown) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: (error as Error).message || "Server error" }, { status: 500 });
  }
}
