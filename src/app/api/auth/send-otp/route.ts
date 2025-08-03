import { NextRequest, NextResponse } from 'next/server';
// import { DatabaseService } from '@/lib/database';
import { emailService } from '@/lib/emailService';
import { smsService } from '@/lib/smsService';

// In-memory OTP storage (in production, use Redis or database)
const otpStore = new Map<string, { otp: string; expires: number }>();

export async function POST(request: NextRequest) {
  try {
    const { email, phone, name, type } = await request.json();
    
    if (!email && !phone) {
      return NextResponse.json({
        success: false,
        message: 'Email or phone is required'
      }, { status: 400 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP
    const key = email || phone;
    otpStore.set(key, { otp, expires });

    let sent = false;
    
    if (type === 'email' && email) {
      // Send real email OTP
      sent = await emailService.sendOTP(email, otp, name);
      
      if (!sent) {
        return NextResponse.json({
          success: false,
          message: 'Failed to send email OTP. Please check your email configuration.'
        }, { status: 500 });
      }
    } else if (type === 'phone' && phone) {
      // Send real SMS OTP
      const formattedPhone = smsService.formatPhoneNumber(phone);
      sent = await smsService.sendOTP(formattedPhone, otp);
      
      if (!sent) {
        return NextResponse.json({
          success: false,
          message: 'Failed to send SMS OTP. Please check your SMS configuration.'
        }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      message: `OTP sent to your ${type === 'email' ? 'email' : 'phone'}`
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to send OTP'
    }, { status: 500 });
  }
} 