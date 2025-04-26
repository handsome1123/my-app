// pages/api/verify-otp.ts or app/api/verify-otp/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/mysqlConnection';

export async function POST(request: Request) {
  const { email, otpCode } = await request.json();
  
  console.log("Verification attempt:", { email, otpCode });

  try {
    // Log the query we're about to run
    console.log(`Searching for user with email ${email} and OTP ${otpCode}`);
    
    // Find user with the provided email and OTP
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ? AND otp_code = ?',
      [email, otpCode]
    );
    
    console.log(`Found ${users.length} matching users`);

    if (users.length === 0) {
      console.log("No matching user found - invalid OTP");
      return NextResponse.json({ message: 'Invalid OTP code' }, { status: 400 });
    }

    const user = users[0];
    console.log("User found:", { id: user.id, email: user.email, otpExpires: user.otp_expires });

    // Check if OTP has expired
    const now = new Date();
    if (now > new Date(user.otp_expires)) {
      console.log("OTP expired:", { now, expires: user.otp_expires });
      return NextResponse.json({ message: 'OTP has expired' }, { status: 400 });
    }

    // Mark user as verified and clear OTP
    console.log("Updating user as verified");
    await pool.query(
      'UPDATE users SET is_verified = true, otp_code = NULL, otp_expires = NULL WHERE id = ?',
      [user.id]
    );

    return NextResponse.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json({ message: 'Error verifying OTP' }, { status: 500 });
  }
}