// pages/api/login.ts or app/api/login/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/mysqlConnection';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  try {
    // Find user with the provided email
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const user = users[0];

    // Check if user is verified
    if (!user.is_verified) {
      return NextResponse.json({ message: 'Please verify your email first' }, { status: 401 });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Set token in HTTP-only cookie
    cookies().set('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    // Return user data (excluding sensitive information)
    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error logging in:', error);
    return NextResponse.json({ message: 'Error during login' }, { status: 500 });
  }
}