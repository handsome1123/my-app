import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Product from '@/models/Product';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function GET() {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'seller') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const products = await Product.find({ owner: session.user.id });
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'seller') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name, price } = await req.json();

  console.log('Session user:', session.user);

  const ownerId = session.user.id;

  if (!ownerId) {
    return NextResponse.json({ error: 'User ID not found in session' }, { status: 400 });
  }

  const newProduct = await Product.create({
    name,
    price,
    owner: ownerId,
  });

  // const ownerEmail = session.user.email;

  // if (!ownerEmail) {
  //   return NextResponse.json({ error: 'User email not found in session' }, { status: 400 });
  // }

  // const newProduct = await Product.create({
  //   name,
  //   price,
  //   owner: ownerEmail,
  // });


  return NextResponse.json(newProduct);
}

