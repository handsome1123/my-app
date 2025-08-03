import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Product from '@/models/Product';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

export async function GET() {
  await dbConnect();
  const products = await Product.find().populate('owner', 'email');
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'seller') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name, price, imageUrl } = await req.json();
  if (!name || !price) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  await dbConnect();

  const newProduct = new Product({
    name,
    price,
    imageUrl,
    owner: session.user.id,
  });
  await newProduct.save();

  return NextResponse.json(newProduct);
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'seller') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ✅ Fixed: Added imageUrl to the destructuring
  const { id, name, price, imageUrl } = await req.json();
  if (!id || !name || !price) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  await dbConnect();

  const product = await Product.findById(id);
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }
  if (product.owner.toString() !== session.user.id) {
    return NextResponse.json({ error: 'Not your product' }, { status: 403 });
  }

  product.name = name;
  product.price = price;
  // ✅ Now imageUrl is properly defined
  if (imageUrl !== undefined) {
    product.imageUrl = imageUrl;
  }
  await product.save();

  return NextResponse.json(product);
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'seller') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  await dbConnect();

  const product = await Product.findById(id);
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }
  if (product.owner.toString() !== session.user.id) {
    return NextResponse.json({ error: 'Not your product' }, { status: 403 });
  }

  await product.deleteOne();
  return NextResponse.json({ message: 'Product deleted' });
}