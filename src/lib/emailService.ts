import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
      tls: { rejectUnauthorized: false },
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"SecondHand MFU" <${process.env.EMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to ${options.to}`);
      return true;
    } catch (error) {
      console.error("Email sending failed:", error);
      return false;
    }
  }

  // Order-related email templates
  async sendOrderConfirmation(buyerEmail: string, buyerName: string, orderDetails: any) {
    const subject = `Order Confirmed: #${orderDetails.orderId}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">Order Confirmed!</h2>
        <p>Hi ${buyerName},</p>
        <p>Your order has been confirmed by the seller. Here are the details:</p>

        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Order Details</h3>
          <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
          <p><strong>Product:</strong> ${orderDetails.productName}</p>
          <p><strong>Quantity:</strong> ${orderDetails.quantity}</p>
          <p><strong>Total:</strong> ฿${orderDetails.totalPrice}</p>
        </div>

        <p>You can now proceed to payment. Please complete your payment within 24 hours to secure your order.</p>

        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/orders/${orderDetails.orderId}"
           style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
          View Order Details
        </a>

        <p>Thank you for shopping with us!</p>
      </div>
    `;

    return this.sendEmail({ to: buyerEmail, subject, html });
  }

  async sendOrderShipped(buyerEmail: string, buyerName: string, orderDetails: any) {
    const subject = `Order Shipped: #${orderDetails.orderId}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">Order Shipped!</h2>
        <p>Hi ${buyerName},</p>
        <p>Great news! Your order has been shipped and is on its way to you.</p>

        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Shipping Details</h3>
          <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
          <p><strong>Product:</strong> ${orderDetails.productName}</p>
          <p><strong>Shipping Method:</strong> ${orderDetails.shippingMethod || 'Standard'}</p>
          <p><strong>Tracking Number:</strong> ${orderDetails.trackingNumber || 'Will be provided soon'}</p>
        </div>

        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/orders/${orderDetails.orderId}"
           style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
          Track Your Order
        </a>

        <p>You'll receive another email when the order is delivered.</p>
      </div>
    `;

    return this.sendEmail({ to: buyerEmail, subject, html });
  }

  async sendOrderDelivered(buyerEmail: string, buyerName: string, orderDetails: any) {
    const subject = `Order Delivered: #${orderDetails.orderId}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">Order Delivered!</h2>
        <p>Hi ${buyerName},</p>
        <p>Your order has been successfully delivered. We hope you're happy with your purchase!</p>

        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Delivery Confirmation</h3>
          <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
          <p><strong>Product:</strong> ${orderDetails.productName}</p>
          <p><strong>Delivered On:</strong> ${new Date().toLocaleDateString()}</p>
        </div>

        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/orders/${orderDetails.orderId}"
           style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
          Leave a Review
        </a>

        <p>Thank you for choosing SecondHand MFU!</p>
      </div>
    `;

    return this.sendEmail({ to: buyerEmail, subject, html });
  }

  async sendOrderRejected(buyerEmail: string, buyerName: string, orderDetails: any) {
    const subject = `Order Update: #${orderDetails.orderId}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ef4444;">Order Update</h2>
        <p>Hi ${buyerName},</p>
        <p>We regret to inform you that your order has been cancelled by the seller.</p>

        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
          <h3>Order Details</h3>
          <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
          <p><strong>Product:</strong> ${orderDetails.productName}</p>
          <p><strong>Reason:</strong> ${orderDetails.reason || 'Seller cancelled the order'}</p>
        </div>

        <p>Your payment has been refunded and should appear in your account within 3-5 business days.</p>

        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/products"
           style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
          Browse More Products
        </a>

        <p>If you have any questions, please contact our support team.</p>
      </div>
    `;

    return this.sendEmail({ to: buyerEmail, subject, html });
  }

  // Seller notification emails
  async sendNewMessage(sellerEmail: string, buyerName: string, orderId: string) {
    const subject = `New Message from Buyer - Order #${orderId}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">New Customer Message</h2>
        <p>You have received a new message from ${buyerName} regarding Order #${orderId}.</p>

        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/seller/messages"
           style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
          View Message
        </a>

        <p>Please respond promptly to maintain good customer service.</p>
      </div>
    `;

    return this.sendEmail({ to: sellerEmail, subject, html });
  }

  async sendLowStockAlert(sellerEmail: string, productName: string, currentStock: number) {
    const subject = `Low Stock Alert: ${productName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">Low Stock Alert</h2>
        <p>Your product <strong>${productName}</strong> is running low on stock.</p>

        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <p><strong>Current Stock:</strong> ${currentStock} units</p>
          <p><strong>Recommended Action:</strong> Restock soon to avoid lost sales</p>
        </div>

        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/seller/products"
           style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
          Manage Inventory
        </a>
      </div>
    `;

    return this.sendEmail({ to: sellerEmail, subject, html });
  }

  async sendPayoutNotification(sellerEmail: string, amount: number, status: string) {
    const subject = `Payout ${status}: ฿${amount}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${status === 'paid' ? '#10b981' : '#3b82f6'};">Payout ${status}</h2>
        <p>Your payout of <strong>฿${amount}</strong> has been ${status}.</p>

        ${status === 'paid'
          ? '<p>The funds should appear in your account within 1-3 business days.</p>'
          : '<p>We\'ll notify you once the payout is processed.</p>'
        }

        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/seller/earnings"
           style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
          View Earnings
        </a>
      </div>
    `;

    return this.sendEmail({ to: sellerEmail, subject, html });
  }
}

export const emailService = new EmailService();