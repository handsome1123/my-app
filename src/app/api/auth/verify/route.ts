import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

interface EmailTokenPayload {
  email: string;
  password: string;
  name: string;
  role?: string;
  iat?: number;
  exp?: number;
}

export async function GET(request: Request) {
  await connectDB();

  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_API_URL}/verify?status=missing`);
  }

  try {
    // 1️⃣ Decode token safely
    const decoded = jwt.verify(token, process.env.EMAIL_VERIFY_SECRET!) as EmailTokenPayload;

    if (!decoded.email || !decoded.password || !decoded.name) {
      throw new Error("Invalid token payload");
    }

    // 2️⃣ Check if already exists
    const existingUser = await User.findOne({ email: decoded.email });
    if (existingUser) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_API_URL}/verify?status=exists`);
    }

    // 3️⃣ Create verified user
    const newUser = new User({
      email: decoded.email,
      password: decoded.password,
      name: decoded.name,
      role: decoded.role || "buyer",
      isVerified: true,
    });

    await newUser.save();

    // 4️⃣ Redirect to success page
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_API_URL}/verify?status=success`);
  } catch (err) {
    console.error("Verification error:", err);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_API_URL}/verify?status=invalid`);
  }
}
