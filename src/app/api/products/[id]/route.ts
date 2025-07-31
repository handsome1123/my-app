import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Product from '@/models/Product';

export async function GET(
  _req: NextRequest,
  context: { params: { id: string } }
) {
  await dbConnect();

  const { id } = context.params;
  const product = await Product.findById(id).populate('owner', 'email');

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  return NextResponse.json(product);
}
