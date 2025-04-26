import { NextResponse } from 'next/server';
import pool from '@/lib/mysqlConnection'; // Your MySQL connection
import { sendOtpEmail } from '@/lib/nodemailer'; // Your nodemailer utility
import bcrypt from 'bcryptjs'; // Add bcrypt to hash the password securely

export async function POST(request: Request) {
  const { fullName, email, password, phone, address } = await request.json();

  // Check if the email is already registered
  const [existingUser] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  if (existingUser.length > 0) {
    return NextResponse.json({ message: 'Email already exists' }, { status: 400 });
  }

  const generateNumericOtp = () => {
    // Generate a random 6-digit number between 100000 and 999999
    return Math.floor(100000 + Math.random() * 900000).toString();
  };
  
  const otpCode = generateNumericOtp();

  // Set OTP expiration to 10 minutes from now
  const otpExpires = new Date();
  otpExpires.setMinutes(otpExpires.getMinutes() + 10);

  // Hash the password securely before saving to the database
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert user record with OTP and OTP expiration time
  try {
    const result = await pool.query(
      'INSERT INTO users (full_name, email, password_hash, phone, address, otp_code, otp_expires) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [fullName, email, hashedPassword, phone, address, otpCode, otpExpires]
    );

    // Send OTP email
    await sendOtpEmail(email, otpCode);

    return NextResponse.json({ message: 'Registration successful. Please verify your email.' });
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json({ message: 'Error registering user' }, { status: 500 });
  }
}
