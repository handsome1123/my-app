import { NextResponse } from 'next/server';
import pool from '@/lib/mysqlConnection'; // Adjust path if necessary

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    if (rows.length === 0) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ product: rows[0] });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error fetching product' }, { status: 500 });
  }
}
