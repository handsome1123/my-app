import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { verifyToken } from "@/lib/jwt";

// Define what your token should look like
interface DecodedToken {
  id: string;
  role?: string;
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    // ✅ Get buyer from JWT token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token) as DecodedToken | null;
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const buyerId = decoded.id;

    // Fetch buyer profile
    const buyer = await User.findById(buyerId).select("-password"); // exclude password
    if (!buyer) {
      return NextResponse.json({ error: "Buyer not found" }, { status: 404 });
    }

    return NextResponse.json({
      name: buyer.name,
      email: buyer.email,
      phone: buyer.phone,
      address: buyer.address,
      shippingAddresses: buyer.shippingAddresses || [],
      isVerified: buyer.isVerified
    }, { status: 200 });
  } catch (error: unknown) {
    console.error("GET /api/buyer/profile error:", error);
    return NextResponse.json({ error: (error as Error).message || "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await connectToDatabase();

    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token) as DecodedToken | null;
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const buyerId = decoded.id;
    const body = await req.json();
    const { name, email, phone, address, shippingAddress } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;

    // Handle shipping address addition
    if (shippingAddress) {
      updateData.$push = { shippingAddresses: shippingAddress };
    }

    const user = await User.findByIdAndUpdate(buyerId, updateData, { new: true });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      shippingAddresses: user.shippingAddresses || [],
      isVerified: user.isVerified
    });
  } catch (error: unknown) {
    console.error("PATCH /api/buyer/profile error:", error);
    return NextResponse.json({ error: (error as Error).message || "Server error" }, { status: 500 });
  }
}
