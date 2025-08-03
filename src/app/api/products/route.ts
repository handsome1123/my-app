import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

// GET all products
export async function GET(request: NextRequest) {
  try {
    await DatabaseService.connect();
    
    const { searchParams } = new URL(request.url);
    const owner = searchParams.get('owner');
    
    let products;
    if (owner) {
      products = await DatabaseService.getProductsByOwner(owner);
    } else {
      products = await DatabaseService.getAllProducts();
    }
    
    return NextResponse.json({
      success: true,
      products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch products'
    }, { status: 500 });
  }
}

// POST create new product
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // ✅ Require auth
    if (!session || session.user.role !== 'seller') {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized',
      }, { status: 401 });
    }

    const { name, price, imageUrl } = await request.json();

    // ✅ Validate input (owner is no longer passed in request body)
    if (!name || !price || !imageUrl) {
      return NextResponse.json({
        success: false,
        message: 'Name, price, and imageUrl are required',
      }, { status: 400 });
    }

    // ✅ Use session user ID as the owner
    const owner = session.user.id;

    // Create product
    const product = await DatabaseService.createProduct({
      name,
      price: Number(price),
      owner,
      imageUrl,
    });

    return NextResponse.json({
      success: true,
      product,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create product',
    }, { status: 500 });
  }
}

// PUT update product
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'seller') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, name, price, imageUrl } = await request.json();
    if (!id || !name || !price) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const product = await DatabaseService.updateProduct(id, {
      name,
      price: Number(price),
      imageUrl
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update product'
    }, { status: 500 });
  }
}

// DELETE delete product
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'seller') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const product = await DatabaseService.deleteProduct(id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to delete product'
    }, { status: 500 });
  }
}
