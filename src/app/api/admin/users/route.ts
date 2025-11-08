import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User"; 

export async function GET() {
  try {
    await connectToDatabase();

    // Fetch all users
    const users = await User.find().sort({ createdAt: -1 });

    // Count total number of users
    const totalUsers = await User.countDocuments();

    return NextResponse.json({ users, totalUsers });
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to fetch users" },
      { status: 500 }
    );
  }
}
