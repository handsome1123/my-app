import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { verifyToken } from "@/lib/jwt";

interface DecodedToken {
  id: string;
  role: "buyer" | "seller" | "admin";
}

export async function PUT(req: Request) {
  try {
    await connectDB();

    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = verifyToken(token) as DecodedToken | null;
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { accountNumber, bankName } = await req.json();

    const user = await User.findByIdAndUpdate(
      payload.id,
      { bankInfo: { accountNumber, bankName } },
      { new: true }
    );

    return NextResponse.json({ message: "Bank info updated", user });
  } catch (error: unknown) {
    console.error("Update bank info error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Server error" },
      { status: 500 }
    );
  }
}
