import { NextResponse } from 'next/server';
import pool from '@/lib/mysqlConnection'; // ✅ correct import

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM test');
    return NextResponse.json({ data: rows });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error fetching data' }, { status: 500 });
  }
}
