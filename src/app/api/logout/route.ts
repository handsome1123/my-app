// src/app/api/logout/route.ts

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    // Remove the 'authToken' cookie
    const cookieStore = await cookies();
    cookieStore.delete('authToken');

    // Return a success message or redirect to the login page
    return NextResponse.json({ message: 'Logout successful' }, { status: 200 });
  } catch (error) {
    console.error('Error during logout:', error);
    return NextResponse.json({ message: 'Error during logout' }, { status: 500 });
  }
}
