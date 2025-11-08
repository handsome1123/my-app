import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const { name, email, password } = await req.json();

    // Check if email already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({ name, email, password: hashed, role: "seller" });

    // Sign token
    const token = signToken({ id: user._id, role: "seller" });

    return NextResponse.json(
      { token, user: { name: user.name, email: user.email, role: user.role } },
      { status: 201 }
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error("Server error");
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
