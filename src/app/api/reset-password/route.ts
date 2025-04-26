// /pages/api/reset-password.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/mysqlConnection';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  const { email, newPassword } = await request.json();

  try {
    // Check if user exists
    const [rows]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return NextResponse.json({ message: 'Email not found' }, { status: 404 });
    }

    const user = rows[0];
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password in the database
    await pool.query('UPDATE users SET password_hash = ? WHERE email = ?', [hashedPassword, email]);

    return NextResponse.json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
