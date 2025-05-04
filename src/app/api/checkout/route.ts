import { NextResponse } from 'next/server';
import pool from '@/lib/mysqlConnection';

export async function POST(req: Request) {
  const { productId, email, address } = await req.json();

  try {
    await pool.query(
      'INSERT INTO orders (user_email, product_id, address, status) VALUES (?, ?, ?, ?)',
      [email, productId, address, 'pending']
    );

    return NextResponse.json({ message: 'Order placed successfully' });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ message: 'Checkout failed' }, { status: 500 });
  }
}
