
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { generatePayoutAnalytics, getPayoutPerformanceMetrics, exportPayoutData } from "@/lib/payoutAnalytics";
import { connectToDatabase } from "@/lib/mongodb";

/*
  GET /api/admin/payouts/analytics - Get payout analytics and metrics
  POST /api/admin/payouts/analytics/export - Export payout data as CSV

  Query parameters:
  - startDate: ISO date string
  - endDate: ISO date string
  - sellerId: string
  - status: string
  - currency: string
  - days: number (for performance metrics, default 30)
*/

export async function GET(req: Request) {
  try {
    // Authenticate admin
    const auth = req.headers.get("authorization") || "";
    if (!auth.startsWith("Bearer ")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const token = auth.split(" ")[1];

    const adminId = await resolveUserIdFromToken(token);
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { db } = await connectToDatabase();
    const usersCol = db.collection("users");
    const admin = await usersCol.findOne({ _id: adminId as any });
    if (!admin || admin.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Parse query parameters
    const url = new URL(req.url);
    const filters = {
      startDate: url.searchParams.get("startDate") ? new Date(url.searchParams.get("startDate")!) : undefined,
      endDate: url.searchParams.get("endDate") ? new Date(url.searchParams.get("endDate")!) : undefined,
      sellerId: url.searchParams.get("sellerId") || undefined,
      status: url.searchParams.get("status") || undefined,
      currency: url.searchParams.get("currency") || undefined,
    };

    const days = parseInt(url.searchParams.get("days") || "30");

    // Generate analytics
    const [analytics, performance] = await Promise.all([
      generatePayoutAnalytics(filters),
      getPayoutPerformanceMetrics(days)
    ]);

    return NextResponse.json({
      analytics,
      performance,
      filters
    });
  } catch (err) {
    console.error("GET /api/admin/payouts/analytics error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // Authenticate admin
    const auth = req.headers.get("authorization") || "";
    if (!auth.startsWith("Bearer ")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const token = auth.split(" ")[1];

    const adminId = await resolveUserIdFromToken(token);
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { db } = await connectToDatabase();
    const usersCol = db.collection("users");
    const admin = await usersCol.findOne({ _id: adminId as any });
    if (!admin || admin.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Parse request body for export filters
    const body = await req.json();
    const filters = {
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      sellerId: body.sellerId || undefined,
      status: body.status || undefined,
      currency: body.currency || undefined,
    };

    // Export data as CSV
    const csvData = await exportPayoutData(filters);

    return new Response(csvData, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=payout-analytics.csv"
      }
    });
  } catch (err) {
    console.error("POST /api/admin/payouts/analytics/export error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/* ---------- Helpers ---------- */

interface JwtPayload {
  sub?: string;
  userId?: string;
  id?: string;
}

async function resolveUserIdFromToken(token: string): Promise<string | null> {
  const jwtSecret = process.env.JWT_SECRET;
  if (jwtSecret) {
    try {
      const payload = jwt.verify(token, jwtSecret) as JwtPayload;
      return payload.sub || payload.userId || payload.id || null;
    } catch (err) {
      console.warn("JWT verify failed:", err);
      return null;
    }
  }
  return token || null;
}