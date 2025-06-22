import { NextResponse } from 'next/server';
import pool from '@/lib/mysqlConnection';
import { sendOtpEmail } from '@/lib/nodemailer';
import bcrypt from 'bcryptjs';

// Define the type for a user row (add other fields if needed)
interface UserRow {
  id: number;
  email: string;
}

export async function POST(request: Request) {
  const { fullName, email, password, phone, address } = await request.json();

  // Check if the email is already registered
  const [rows] = await pool.query<UserRow[]>(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );

  if (rows.length > 0) {
    return NextResponse.json({ message: 'Email already exists' }, { status: 400 });
  }

  const generateNumericOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const otpCode = generateNumericOtp();

  const otpExpires = new Date();
  otpExpires.setMinutes(otpExpires.getMinutes() + 10);

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // We don't need to use the result of the insert, so just `await` it
    await pool.query(
      `INSERT INTO users (full_name, email, password_hash, phone, address, otp_code, otp_expires)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [fullName, email, hashedPassword, phone, address, otpCode, otpExpires]
    );

    await sendOtpEmail(email, otpCode);

    return NextResponse.json({ message: 'Registration successful. Please verify your email.' });
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json({ message: 'Error registering user' }, { status: 500 });
  }
}
