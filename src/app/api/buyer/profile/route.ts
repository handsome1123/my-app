import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { verifyToken } from "@/lib/jwt";

// Define what your token should look like
interface DecodedToken {
  id: string;
  role?: string;
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

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

    return NextResponse.json({ success: true, buyer }, { status: 200 });
  } catch (error: unknown) {
    console.error("GET /api/buyer/products error:", error);
    return NextResponse.json({ error: (error as Error).message || "Server error" }, { status: 500 });
  }
}
