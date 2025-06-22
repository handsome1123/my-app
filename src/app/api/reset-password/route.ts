import { NextResponse } from 'next/server';
import pool from '@/lib/mysqlConnection';
import bcrypt from 'bcryptjs';

interface User {
  id: number;
  email: string;
  password_hash: string;
  // add other fields if needed
}

export async function POST(request: Request) {
  const { email, newPassword } = await request.json();

  try {
    const [rows]: [User[]] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length === 0) {
      return NextResponse.json({ message: 'Email not found' }, { status: 404 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query('UPDATE users SET password_hash = ? WHERE email = ?', [hashedPassword, email]);

    return NextResponse.json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
