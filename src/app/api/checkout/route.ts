import { NextResponse } from 'next/server';
import pool from '@/lib/mysqlConnection'; // same as your productdetail page

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const { userId, items, totalAmount, shippingAddress, phone, email } = data;

    // Insert into orders table
    const [result] = await pool.query(
      `INSERT INTO orders (user_id, total_amount, shipping_address, phone, email, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [userId, totalAmount, shippingAddress, phone, email, 'Pending']
    );

    const orderId = result.insertId; // Get the newly created order's ID

    // Insert order items into order_items table (if you have one)
    for (const item of items) {
      await pool.query(
        `INSERT INTO order_items (order_id, product_id, quantity)
         VALUES (?, ?, ?)`,
        [orderId, item.productId, item.quantity]
      );
    }

    return NextResponse.json({ message: 'Order created successfully', orderId }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error creating order' }, { status: 500 });
  }
}
