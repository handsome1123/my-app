import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Product from '@/models/Product';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

export async function DELETE(req: Request) {
  await dbConnect();

  const url = new URL(req.url);
  const id = url.pathname.split('/').pop();

  if (!id) {
    return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  const user = session?.user;

  // ✅ Ensure user and role exist before checking
  if (!user || user.role !== 'seller') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const product = await Product.findOne({ _id: id });

  // ✅ Make sure the product exists and belongs to this seller
  if (!product || product.owner.toString() !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await Product.findByIdAndDelete(id);

  return NextResponse.json({ message: 'Deleted' });
}
