// src/app/api/products/[id]/route.ts

import { NextRequest } from 'next/server';

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  // Example logic
  return new Response(JSON.stringify({ message: `Product ID: ${id}` }), {
    status: 200,
  });
}
