import { NextRequest, NextResponse } from "next/server";
import { connectToMongoDB } from "@/lib/mongodb";
import { Notification } from "@/models/Notification";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  try {
    await connectToMongoDB();

    // Get token from Authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    const query: any = { userId: decoded.userId };
    if (unreadOnly) {
      query.isRead = false;
    }

    const skip = (page - 1) * limit;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      userId: decoded.userId,
      isRead: false
    });

    return NextResponse.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      unreadCount
    });
  } catch (error) {
    console.error("GET /api/buyer/notifications error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await connectToMongoDB();

    // Get token from Authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { notificationIds, action } = await req.json();

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json({ error: "Notification IDs required" }, { status: 400 });
    }

    if (action === "markAsRead") {
      await Notification.updateMany(
        { _id: { $in: notificationIds }, userId: decoded.userId },
        { isRead: true, readAt: new Date() }
      );
      return NextResponse.json({ message: "Notifications marked as read" });
    }

    if (action === "markAsUnread") {
      await Notification.updateMany(
        { _id: { $in: notificationIds }, userId: decoded.userId },
        { isRead: false, $unset: { readAt: 1 } }
      );
      return NextResponse.json({ message: "Notifications marked as unread" });
    }

    if (action === "delete") {
      await Notification.deleteMany({
        _id: { $in: notificationIds },
        userId: decoded.userId
      });
      return NextResponse.json({ message: "Notifications deleted" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("PATCH /api/buyer/notifications error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}