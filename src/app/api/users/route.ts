// app/api/users/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  const users = await User.find({}, '-password'); // exclude passwords
  return NextResponse.json(users);
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { userId, newRole } = await req.json();
  if (!userId || !newRole) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  await dbConnect();
  await User.findByIdAndUpdate(userId, { role: newRole });
  return NextResponse.json({ message: 'User role updated' });
}
