import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { verifyToken } from "@/lib/jwt";

interface DecodedToken {
  id: string;
  role: string;
}

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

// DELETE /api/admin/users/:id
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
  ) {
  try {
    await connectDB();

    // 🔑 Get token from Authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];

    // ✅ Verify token
    const decoded = verifyToken(token) as DecodedToken | null;
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // 🔒 Check if user is admin
    const adminUser = await User.findById(decoded.id);
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;

    // 🗑️ Prevent admin from deleting themselves
    if (decoded.id === id) {
      return NextResponse.json(
        { error: "Admin cannot delete themselves" },
        { status: 400 }
      );
    }

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}