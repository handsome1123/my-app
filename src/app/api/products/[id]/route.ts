// src/app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/mysqlConnection';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ message: 'Invalid product ID' }, { status: 400 });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product: rows[0] });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error fetching product' }, { status: 500 });
  }
}
