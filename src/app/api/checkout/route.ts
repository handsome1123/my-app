import { NextResponse } from 'next/server';
import pool from '@/lib/mysqlConnection';

export async function POST(req: Request) {
  const { productId, email, address, quantity } = await req.json();

  try {
    // 1. Get user_id from email
    const [userRows]: any = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (userRows.length === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const userId = userRows[0].id;

    // 2. Get product price
    const [productRows]: any = await pool.query(
      'SELECT price FROM products WHERE id = ?',
      [productId]
    );

    if (productRows.length === 0) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const price = parseFloat(productRows[0].price);
    const totalPrice = price * quantity;

    // 3. Insert into orders
    await pool.query(
      `INSERT INTO orders (user_id, product_id, quantity, total_price, shipping_address, status, payment_status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, productId, quantity, totalPrice, address, 'pending', 'unpaid']
    );

    return NextResponse.json({ message: 'Order placed successfully' });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ message: 'Checkout failed' }, { status: 500 });
  }
}
