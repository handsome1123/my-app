import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { User } from "@/models/User";
import { verifyToken } from "@/lib/jwt";

interface DecodedToken {
  id: string;
  role: string;
}

// DELETE /api/admin/orders/:id
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
      const user = await User.findById(decoded.id);
      if (!user || user.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      // 🗑️ Delete order
      const { id } = await context.params;
      const deletedOrder = await Order.findByIdAndDelete(id);

      if (!deletedOrder) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      return NextResponse.json(
        { message: "Order deleted successfully" },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error deleting order:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
