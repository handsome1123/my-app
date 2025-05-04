import { NextResponse } from 'next/server';
import pool from '@/lib/mysqlConnection';

type Product = {
  id: number;
  name: string;
  price: number;
  // Add other fields as per your table
};

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  if (isNaN(Number(id))) {
    return NextResponse.json({ message: 'Invalid product ID' }, { status: 400 });
  }

  try {
    const [rows]: [Product[], any] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);

    if (!rows.length) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product: rows[0] });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ message: 'Error fetching product' }, { status: 500 });
  }
}
