import { NextResponse, NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';
// import bcrypt from 'bcryptjs'; // Not needed if using pre-save hook

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { name, email, password } = await req.json();

    if (!email || !password || !name) {
      console.log('Missing required fields:', { email: !!email, password: !!password, name: !!name });
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists with email:', email);
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 400 }
      );
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password, // Let the pre-save hook handle hashing
      awsRoleArn: null // Initialize ARN as null
    });

    console.log('New user created:', user.email);

    // Generate token
    const token = generateToken({ id: user._id.toString(), email: user.email });

    // Create response WITHOUT user data in body
    const response = NextResponse.json(
      {
        success: true,
        message: 'User registered successfully'
        // Redirect will be handled client-side or via middleware now
      },
      { status: 201 }
    );

    // Set token in HTTP-only cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    // Don't return user details in body, rely on cookie for session
    // Don't explicitly redirect here, let the frontend handle it after signup success
    return response;

  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
} 