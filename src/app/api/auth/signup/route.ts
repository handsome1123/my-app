import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "@/lib/mailer";
import { User } from "@/models/User";
import { connectDB } from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    await connectDB();

    const { email, password, name, role } = await request.json();

    // 1️⃣ Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // 2️⃣ Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // 3️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 4️⃣ Create verification token (not stored in DB)
    const token = jwt.sign(
      {
        email,
        name,
        password: hashedPassword,
        role: role || "buyer",
      },
      process.env.EMAIL_VERIFY_SECRET!, // must be set in .env
      { expiresIn: "1h" }
    );

    // 5️⃣ Send verification email
    await sendVerificationEmail(email, token);

    // ⚠️ Do NOT save user yet!
    return NextResponse.json({
      message:
        "Verification email sent! Please check your inbox to complete registration.",
    });
  } catch (error: unknown) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
