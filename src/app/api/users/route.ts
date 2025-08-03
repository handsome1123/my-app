// src/app/api/users/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';

export async function GET() {
  try {
    await DatabaseService.connect();
    
    // ✅ Method 1: Use the new getAllUsers method
    const users = await DatabaseService.getAllUsers();
    
    return NextResponse.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch users' 
      },
      { status: 500 }
    );
  }
}

// POST - Create a new user (using NextRequest)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, role } = body;

    if (!name || !email) {
      return NextResponse.json(
        { success: false, message: 'Name and email are required' },
        { status: 400 }
      );
    }

    const userData = {
      name,
      email,
      role: role || 'buyer',
      provider: 'credentials',
      emailVerified: false,
      phoneVerified: false
    };

    const user = await DatabaseService.createUser(userData);

    return NextResponse.json({
      success: true,
      user
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create user' },
      { status: 500 }
    );
  }
}

// Alternative implementation using direct import
// import User from '@/models/User';
// 
// export async function GET() {
//   try {
//     await DatabaseService.connect();
//     
//     // ✅ Method 2: Direct model usage
//     const users = await User.find({}, '-password');
//     
//     return NextResponse.json({
//       success: true,
//       users
//     });
//   } catch (error) {
//     console.error('Error fetching users:', error);
//     return NextResponse.json(
//       { 
//         success: false, 
//         message: 'Failed to fetch users' 
//       },
//       { status: 500 }
//     );
//   }
// }