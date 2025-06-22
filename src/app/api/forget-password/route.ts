import { NextResponse } from 'next/server';
import pool from '@/lib/mysqlConnection';
import { sendOtpEmail } from '@/lib/nodemailer';

interface UserRow {
  id: number;
  email: string;
  // add other fields if needed like name, otp_code, otp_expires, etc.
}

export async function POST(request: Request) {
  const { email } = await request.json();

  try {
    // 1. Check if user exists
    const [rows] = await pool.query<UserRow[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: 'Email not found' }, { status: 404 });
    }

    // 2. Generate new OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiration

    // 3. Update OTP in database
    await pool.query(
      'UPDATE users SET otp_code = ?, otp_expires = ? WHERE email = ?',
      [otpCode, otpExpires, email]
    );

    // 4. Send OTP Email
    await sendOtpEmail(email, otpCode);

    return NextResponse.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
