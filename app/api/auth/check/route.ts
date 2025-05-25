import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { User } from 'lucide-react';

export async function GET(request: Request) {
  try {
    const user = await verifyToken(request);
   
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Not authenticated",
          isAuthenticated: false 
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Authenticated",
      isAuthenticated: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Error checking authentication",
        isAuthenticated: false 
      },
      { status: 500 }
    );
  }
} 