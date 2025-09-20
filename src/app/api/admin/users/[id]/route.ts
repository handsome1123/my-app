import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

// PUT /api/admin/users/[id]
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // params is now a Promise
) {
  try {
    const { id: userId } = await params; // await params before using
    console.log("PUT /api/admin/users", userId);

    await connectDB();

    const { role } = await req.json();
    console.log("New role:", role);

    // Validate role
    if (!["buyer", "seller", "admin"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    // Update user role in database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updatedUser);
  } catch (err) {
    console.error("Role update failed:", err);
    return NextResponse.json(
      { error: "Failed to update role" },
      { status: 500 }
    );
  }
}