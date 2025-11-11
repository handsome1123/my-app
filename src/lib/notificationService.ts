import { connectToMongoDB } from "@/lib/mongodb";
import { Notification } from "@/models/Notification";
import { User } from "@/models/User";
import nodemailer from "nodemailer";

export interface NotificationData {
  userId: string;
  type: string;
  title: string;
  message: string;
  payload?: Record<string, any>;
  sendEmail?: boolean;
}

export class NotificationService {
  static async createNotification(data: NotificationData) {
    try {
      await connectToMongoDB();

      // Create in-app notification
      const notification = new Notification({
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        payload: data.payload,
      });

      await notification.save();

      // Send email if requested
      if (data.sendEmail) {
        await this.sendEmailNotification(data);
      }

      // Update user's unread notification count
      await User.findByIdAndUpdate(data.userId, {
        $inc: { unreadNotifications: 1, notificationsCount: 1 }
      });

      return notification;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  static async sendEmailNotification(data: NotificationData) {
    try {
      const user = await User.findById(data.userId);
      if (!user?.email) return;

      const emailData = {
        to: user.email,
        subject: data.title,
        html: this.generateEmailTemplate(data),
      };

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_APP_PASSWORD,
        },
        tls: { rejectUnauthorized: false },
      });

      await transporter.sendMail(emailData);
    } catch (error) {
      console.error("Error sending email notification:", error);
      // Don't throw error to avoid breaking notification creation
    }
  }

  static generateEmailTemplate(data: NotificationData): string {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${data.title}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 30px 20px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${data.title}</h1>
            </div>
            <div class="content">
              <p>${data.message}</p>

              ${this.getNotificationSpecificContent(data)}

              <a href="${baseUrl}/buyer/dashboard" class="button">View in App</a>

              <div class="footer">
                <p>You received this email because you have notifications enabled for your account.</p>
                <p><a href="${baseUrl}/buyer/profile">Manage notification preferences</a></p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  static getNotificationSpecificContent(data: NotificationData): string {
    switch (data.type) {
      case "order_status_update":
        if (data.payload?.orderId) {
          return `<p><a href="${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/buyer/orders/${data.payload.orderId}">Track your order</a></p>`;
        }
        break;
      case "review_request":
        if (data.payload?.orderId) {
          return `<p><a href="${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/buyer/products/${data.payload.productId}/write-review">Write a review</a></p>`;
        }
        break;
      case "refund_processed":
        return `<p>Your refund has been processed and should appear in your account within 3-5 business days.</p>`;
    }
    return "";
  }

  static async createOrderStatusNotification(
    userId: string,
    orderId: string,
    status: string,
    productName?: string
  ) {
    const statusMessages = {
      paid: "Your payment has been confirmed!",
      confirmed: "Your order has been confirmed by the seller.",
      shipped: "Your order has been shipped!",
      delivered: "Your order has been delivered!",
      cancelled: "Your order has been cancelled.",
      rejected: "Your order has been rejected."
    };

    const title = `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`;
    const message = statusMessages[status as keyof typeof statusMessages] || `Your order status has been updated to ${status}.`;

    return this.createNotification({
      userId,
      type: "order_status_update",
      title,
      message: productName ? `${message} (${productName})` : message,
      payload: { orderId, status },
      sendEmail: true
    });
  }

  static async createReviewRequestNotification(userId: string, orderId: string, productId: string, productName: string) {
    return this.createNotification({
      userId,
      type: "review_request",
      title: "How was your purchase?",
      message: `Tell others about your experience with "${productName}". Your review helps other buyers!`,
      payload: { orderId, productId, productName },
      sendEmail: false // Reviews are requested in-app only
    });
  }

  static async createRefundNotification(userId: string, orderId: string, refundAmount: number, status: string) {
    const title = status === "approved" ? "Refund Approved" : "Refund Processed";
    const message = status === "approved"
      ? `Your refund request for ฿${refundAmount} has been approved.`
      : `Your refund of ฿${refundAmount} has been processed.`;

    return this.createNotification({
      userId,
      type: "refund_processed",
      title,
      message,
      payload: { orderId, refundAmount, status },
      sendEmail: true
    });
  }
}