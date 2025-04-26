// app/api/resend-otp/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/mysqlConnection';
import { sendOtpEmail } from '@/lib/nodemailer';
import crypto from 'crypto';

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ message: 'Email is required' }, { status: 400 });
  }

  try {
    // Check if user exists
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const user = users[0];

    // Check if user is already verified
    if (user.is_verified) {
      return NextResponse.json({ message: 'User is already verified' }, { status: 400 });
    }

    // Generate new OTP code
    const otpCode = crypto.randomBytes(3).toString('hex'); // 6-character OTP

    // Set OTP expiration to 10 minutes from now
    const otpExpires = new Date();
    otpExpires.setMinutes(otpExpires.getMinutes() + 10);

    // Update user with new OTP
    await pool.query(
      'UPDATE users SET otp_code = ?, otp_expires = ? WHERE id = ?',
      [otpCode, otpExpires, user.id]
    );

    // Send new OTP email
    await sendOtpEmail(email, otpCode);

    return NextResponse.json({ message: 'OTP resent successfully' });
  } catch (error) {
    console.error('Error resending OTP:', error);
    return NextResponse.json({ message: 'Error resending OTP' }, { status: 500 });
  }
}