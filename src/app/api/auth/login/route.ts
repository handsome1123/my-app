import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/jwt";


export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { email, password } = await req.json();

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Generate token
    const token = signToken({ id: user._id, role: user.role });

    return NextResponse.json({
      token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: unknown) {
    // Type-safe error handling
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
