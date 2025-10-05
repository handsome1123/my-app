import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { Order } from "@/models/Order";
import { User } from "@/models/User";
import { verifyToken } from "@/lib/jwt";

// Initialize Stripe with the latest stable API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

// console.log(`Stripe SDK version: ${Stripe.version}`);

// Allowed payment methods
const ALLOWED_PAYMENT_METHODS: string[] = ["card", "promptpay"];

// Interface for request body
interface RequestBody {
  productId: string;
  quantity: number;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    // Connect to MongoDB
    await connectDB();

    // Token verification
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized: Missing or invalid token" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token) as { id: string } | null;
    if (!decoded) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid token" },
        { status: 401 }
      );
    }
    const buyerId = decoded.id;

    // Parse and validate body
    const body: RequestBody = await req.json();
    const { productId, quantity = 1, customerInfo } = body;

    if (!productId || !customerInfo) {
      return NextResponse.json(
        { error: "Missing required fields: productId and customerInfo are required" },
        { status: 400 }
      );
    }

    // Validate customerInfo fields
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "address",
      "city",
      "state",
      "zipCode",
      "country",
    ];
    const missingFields = requiredFields.filter(
      (field) => !customerInfo[field as keyof typeof customerInfo]?.trim()
    );
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required customer info fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate quantity
    if (!Number.isInteger(quantity) || quantity < 1) {
      return NextResponse.json(
        { error: "Invalid quantity: Must be a positive integer" },
        { status: 400 }
      );
    }

    // Fetch product and buyer
    const product = await Product.findById(productId);
    const buyer = await User.findById(buyerId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    if (!buyer) {
      return NextResponse.json({ error: "Buyer not found" }, { status: 404 });
    }

    // Calculate total price
    const totalPrice = product.price * quantity;
    if (totalPrice <= 0) {
      return NextResponse.json(
        { error: "Invalid total price: Must be greater than zero" },
        { status: 400 }
      );
    }

    // Check for duplicate pending orders
    const existingOrder = await Order.findOne({
      productId,
      buyerId,
      status: "pending_payment",
    });
    
    if (existingOrder && existingOrder.stripePaymentIntentId) {
      // Return existing payment intent if it's still valid
      try {
        const existingPI = await stripe.paymentIntents.retrieve(
          existingOrder.stripePaymentIntentId
        );
        
        if (existingPI.status === "requires_payment_method" || existingPI.status === "requires_confirmation") {
          return NextResponse.json({
            orderId: existingOrder._id.toString(),
            clientSecret: existingPI.client_secret,
            status: "pending_payment",
            stripePaymentIntentId: existingPI.id,
          });
        }
      } catch (err) {
        console.error("Failed to retrieve existing payment intent:", err);
        // Continue to create new order if retrieval fails
      }
    }

    // Create preliminary order
    const order = await Order.create({
      productId: product._id,
      buyerId: buyer._id,
      sellerId: product.sellerId,
      quantity,
      totalPrice,
      status: "pending_payment",
      shippingAddress: customerInfo,
    });

    // Create Stripe PaymentIntent
    let paymentIntent: Stripe.PaymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalPrice * 100), // Convert THB to satangs
        currency: "thb",
        payment_method_types: ALLOWED_PAYMENT_METHODS, // ✅ use it here
        metadata: {
          orderId: order._id.toString(),
          productId,
          buyerId,
        },
        // Optional: Add description for better tracking
        description: `Order ${order._id} - ${product.name}`,
        // Optional: Add receipt email
        receipt_email: customerInfo.email,
      });

      console.log(
        `✅ Stripe PaymentIntent created: ${paymentIntent.id} for order ${order._id}`
      );
    } catch (err: unknown) {
      console.error(
        `❌ Stripe PaymentIntent creation failed for order ${order._id}:`,
        err
      );
      
      // Clean up failed order
      await Order.deleteOne({ _id: order._id });
      
      // Type guard for Stripe errors
      const isStripeError = (error: unknown): error is Stripe.StripeRawError => {
        return typeof error === 'object' && error !== null && 'type' in error;
      };
      
      // Handle specific Stripe errors
      if (isStripeError(err)) {
        const stripeType = err.type as string; // cast to string
        if (stripeType === "StripeInvalidRequestError") {
          if (err.message?.includes("Invalid Stripe API version")) {
            return NextResponse.json(
              { error: "Invalid Stripe API version. Please contact support." },
              { status: 500 }
            );
          }
          return NextResponse.json(
            { error: `Invalid request: ${err.message}` },
            { status: 400 }
          );
        }
        
        if (stripeType === "StripeAuthenticationError") {
          return NextResponse.json(
            { error: "Payment system authentication failed. Please contact support." },
            { status: 500 }
          );
        }
        
        return NextResponse.json(
          { error: `Failed to create payment intent: ${err.message || "Unknown error"}` },
          { status: 400 }
        );
      }
      
      // Handle non-Stripe errors
      return NextResponse.json(
        { error: "Failed to create payment intent: Unknown error" },
        { status: 400 }
      );
    }

    // Update order with PaymentIntent ID
    order.stripePaymentIntentId = paymentIntent.id;
    await order.save();

    // Return response
    return NextResponse.json({
      orderId: order._id.toString(),
      clientSecret: paymentIntent.client_secret,
      status: "pending_payment",
      stripePaymentIntentId: paymentIntent.id,
    });
  } catch (err: unknown) {
    console.error(`❌ Unexpected server error:`, err);
    
    const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
    
    return NextResponse.json(
      { 
        error: "Server error: Unable to process payment intent",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}