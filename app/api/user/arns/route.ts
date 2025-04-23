import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import User from '@/models/User';
import connectDB from '@/lib/mongodb';

export async function GET(req: Request) {
  try {
    // 1. Verify Authentication
    const cookies = req.headers.get('cookie');
    if (!cookies) {
      return NextResponse.json(
        { error: 'Unauthorized: No cookies found' },
        { status: 401 }
      );
    }

    const tokenMatch = cookies.match(/token=([^;]+)/);
    if (!tokenMatch) {
      return NextResponse.json(
        { error: 'Unauthorized: No token found in cookies' },
        { status: 401 }
      );
    }

    const token = tokenMatch[1];
    const decoded = await verifyToken(token);
    
    if (!decoded || typeof decoded !== 'object' || !('id' in decoded)) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid token' },
        { status: 401 }
      );
    }

    // 2. Connect to database
    await connectDB();

    // 3. Get user's ARN
    const user = await User.findById(decoded.id).select('awsRoleArn createdAt');
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // 4. Return ARN data
    return NextResponse.json({
      arns: [{
        _id: user._id.toString(),
        arn: user.awsRoleArn || '',
        service: 'iam',
        description: 'Cross-account IAM role for AWS automation',
        createdAt: user.createdAt
      }]
    });

  } catch (error) {
    console.error('Error fetching ARNs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 