import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { verifyToken } from "@/lib/jwt";

interface DecodedToken {
  id: string;
  role: string;
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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
    const { id: orderId } = await context.params;
    const { note } = await req.json();

    if (!note?.trim()) {
      return NextResponse.json({ error: "Note content is required" }, { status: 400 });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.sellerId.toString() !== sellerId) {
      return NextResponse.json({ error: "Not authorized for this order" }, { status: 403 });
    }

    // Initialize notes array if it doesn't exist
    if (!order.notes) {
      order.notes = [];
    }

    // Add new note
    order.notes.push({
      content: note.trim(),
      author: "Seller",
      createdAt: new Date(),
    });

    await order.save();

    return NextResponse.json({
      success: true,
      message: "Note added successfully",
      notes: order.notes
    });
  } catch (error: unknown) {
    console.error("Error adding note:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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
    const { id: orderId } = await context.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.sellerId.toString() !== sellerId) {
      return NextResponse.json({ error: "Not authorized for this order" }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      notes: order.notes || []
    });
  } catch (error: unknown) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Server error" },
      { status: 500 }
    );
  }
}