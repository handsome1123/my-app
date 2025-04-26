// lib/nodemailer.ts
import nodemailer from 'nodemailer';

// Configure transporter (replace with your email service details)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || 'secondhand.mfu@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'imyl viwi lugc irhb'
  }
});

export async function sendOtpEmail(email: string, otpCode: string) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Your App <no-reply@yourapp.com>',
      to: email,
      subject: 'Verify Your Email Address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Email Verification</h2>
          <p>Thank you for registering! Please use the following verification code to complete your registration:</p>
          <div style="background-color: #f4f4f4; padding: 12px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; margin: 20px 0;">
            ${otpCode}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}