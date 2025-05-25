import { NextResponse, NextRequest } from 'next/server';
import { verifyTokenAndGetUser } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    // Connect to MongoDB first
    try {
      await connectDB();
      console.log('MongoDB connected successfully in profile API');
    } catch (dbError) {
      console.error('MongoDB connection error in profile API:', dbError);
      return NextResponse.json(
        { success: false, message: 'Database connection error' },
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store'
          }
        }
      );
    }

    // 1. Verify Authentication & Get User
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: No token provided' },
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store'
          }
        }
      );
    }
    
    // Use the function that includes DB lookup
    const user = await verifyTokenAndGetUser(token); 
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized or User not found' },
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store'
          }
        }
      );
    }

    // 2. Return User Profile Data
    const userData = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      awsRoleArn: user.awsRoleArn || null,
      awsCredentials: {
        region: user.awsCredentials?.region || 'us-east-1',
        accessKey: user.awsCredentials?.accessKey || null,
        secretKey: user.awsCredentials?.secretKey || null,
        amiArn: user.awsCredentials?.amiArn || null,
        keyPairName: user.awsCredentials?.keyPairName || null,
        securityGroupId: user.awsCredentials?.securityGroupId || null
      }
    };

    return NextResponse.json(
      { success: true, user: userData },
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        }
      }
    );

  } catch (error) {
    console.error('Error in profile API:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        }
      }
    );
  }
} 