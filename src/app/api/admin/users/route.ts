import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User"; 

export async function GET() {
  try {
    await connectDB();

    // Fetch all users
    const users = await User.find().sort({ createdAt: -1 });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("❌ Error fetching users:", error); // Fixed: Updated error message
    return NextResponse.json(
      { error: (error as Error).message || "Failed to fetch users" }, // Fixed: Updated error message
      { status: 500 }
    );
  }
}