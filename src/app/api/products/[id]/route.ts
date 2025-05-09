// pages/api/products/[id].ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import pool from '@/lib/mysqlConnection';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = params.id;

  if (isNaN(Number(id))) {
    return NextResponse.json({ message: 'Invalid product ID' }, { status: 400 });
  }

  try {
    // Query the database for the product by ID
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);

    console.log('Rows:', rows); // Debugging log to check if the data is being returned correctly

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product: rows[0] });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ message: 'Error fetching product' }, { status: 500 });
  }
}
