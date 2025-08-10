import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const access_token = request.cookies.get('sb-access-token')?.value;
  if (!access_token) return NextResponse.redirect(new URL('/login', request.url));

  // You can optionally validate role via Supabase Admin API if needed here
  return NextResponse.next();
}
