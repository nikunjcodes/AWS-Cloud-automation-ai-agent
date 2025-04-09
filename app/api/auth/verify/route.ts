import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { isValid: false, message: 'Token is required' },
        { status: 400 }
      );
    }

    const user = await verifyToken(token);

    if (!user) {
      return NextResponse.json(
        { isValid: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      isValid: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { isValid: false, message: 'Error verifying token' },
      { status: 500 }
    );
  }
} 