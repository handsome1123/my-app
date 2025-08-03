// app/api/products/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';

// Option 1: Using async/await (Recommended)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    // Your logic here
    const product = await getProductById(id);
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Option 2: Alternative syntax with Promise.resolve()
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const { id } = params;
  
  const body = await request.json();
  
  // Your POST logic here
  return NextResponse.json({ message: `Updated product ${id}`, data: body });
}

// Option 3: If you need other HTTP methods
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const productId = resolvedParams.id;
  
  // Your PUT logic here
  return NextResponse.json({ message: `Product ${productId} updated` });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  // Your DELETE logic here
  return NextResponse.json({ message: `Product ${id} deleted` });
}

// Helper function example
async function getProductById(id: string) {
  // Simulate database call
  return { id, name: `Product ${id}`, price: 99.99 };
}