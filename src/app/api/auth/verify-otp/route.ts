import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';
import User from '@/models/User'; // Import User model directly

// In-memory OTP storage (NOTE: for production, use Redis or DB with expiry)
const otpStore = new Map<string, { otp: string; expires: number }>();

interface UserData {
  email?: string;
  phone?: string;
  name?: string;
  role: 'buyer' | 'seller' | 'admin';
  provider: 'credentials' | string;
  emailVerified: boolean;
  phoneVerified: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const { otp, email, phone, name } = await request.json();

    if (!otp) {
      return NextResponse.json(
        { success: false, message: 'OTP is required' },
        { status: 400 }
      );
    }

    const key = email || phone;
    const storedOtp = otpStore.get(key);

    if (!storedOtp) {
      return NextResponse.json(
        { success: false, message: 'OTP not found or expired' },
        { status: 400 }
      );
    }

    if (Date.now() > storedOtp.expires) {
      otpStore.delete(key);
      return NextResponse.json(
        { success: false, message: 'OTP has expired' },
        { status: 400 }
      );
    }

    if (storedOtp.otp !== otp) {
      return NextResponse.json(
        { success: false, message: 'Invalid OTP' },
        { status: 400 }
      );
    }

    await DatabaseService.connect();

    let user = null;

    if (email) {
      user = await DatabaseService.findUserByEmail(email);
    } else if (phone) {
      // ✅ Direct database query as alternative to missing method
      user = await User.findOne({ phone }).exec();
    }

    if (!user) {
      const userData: UserData = {
        email: email || undefined,
        phone: phone || undefined,
        name: name || undefined,
        role: 'buyer',
        provider: 'credentials',
        emailVerified: !!email,
        phoneVerified: !!phone
      };

      user = await DatabaseService.createUser(userData);
    }

    otpStore.delete(key);

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}