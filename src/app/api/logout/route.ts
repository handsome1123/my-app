import { NextResponse } from 'next/server';

export async function POST() {
  // If you use cookies/session, you would clear it here.
  // For now, we just tell the client to remove localStorage manually.

  return NextResponse.json({ message: 'Logged out successfully' });
}
