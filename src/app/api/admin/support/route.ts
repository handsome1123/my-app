import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { SupportTicket } from "@/models/SupportTicket";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    // Total support tickets
    const total = await SupportTicket.countDocuments();

    // Pending tickets (open, in_progress, waiting_for_customer)
    const pending = await SupportTicket.countDocuments({
      status: { $in: ["open", "in_progress", "waiting_for_customer"] },
    });

    return NextResponse.json({
      total,
      pending,
    });
  } catch (error) {
    console.error("Support API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch support data" },
      { status: 500 }
    );
  }
}