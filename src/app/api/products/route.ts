import { NextResponse } from 'next/server';
import pool from '@/lib/mysqlConnection'; // use your mysqlConnection

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM products'); // change 'products' to your table
    return NextResponse.json({ data: rows });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error fetching products' }, { status: 500 });
  }
}
