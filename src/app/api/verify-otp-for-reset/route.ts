// /app/api/verify-otp-for-reset/route.ts

import { NextResponse } from 'next/server';
import pool from '@/lib/mysqlConnection';

export async function POST(request: Request) {
  const { email, otpCode } = await request.json();

  console.log("Verification attempt:", { email, otpCode });

  try {
    // Check if the OTP matches for the given email
    const [rows]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length === 0) {
      return NextResponse.json({ message: 'Email not found' }, { status: 404 });
    }

    const user = rows[0];

    // Check if OTP is correct and within expiration time
    if (user.otp_code !== otpCode) {
      return NextResponse.json({ message: 'Invalid OTP' }, { status: 400 });
    }

    if (new Date(user.otp_expires) < new Date()) {
      return NextResponse.json({ message: 'OTP has expired' }, { status: 400 });
    }

    // OTP verified successfully
    return NextResponse.json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
