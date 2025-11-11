import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
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

    const seller = await User.findById(sellerId).select("-password");
    if (!seller) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    return NextResponse.json(seller.settings || {});
  } catch (error: unknown) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
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
    const settingsData = await req.json();

    // Update seller settings
    const seller = await User.findByIdAndUpdate(
      sellerId,
      { $set: { settings: settingsData } },
      { new: true, runValidators: true }
    );

    if (!seller) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
      settings: seller.settings
    });
  } catch (error: unknown) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Server error" },
      { status: 500 }
    );
  }
}