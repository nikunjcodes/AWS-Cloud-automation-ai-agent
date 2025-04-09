import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import User from '@/models/User';
import connectDB from '@/lib/mongodb';

export async function POST(req: Request) {
  try {
    // 1. Verify Authentication
    const token = req.headers.get('cookie')?.split('token=')[1]?.split(';')[0];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    // 2. Get ARN data from request body
    const { arn, service, description } = await req.json();
    
    // Validate required fields
    if (!arn) {
      return NextResponse.json(
        { error: 'ARN is required' },
        { status: 400 }
      );
    }

    if (!service) {
      return NextResponse.json(
        { error: 'Service is required' },
        { status: 400 }
      );
    }

    // Validate ARN format
    if (!arn.startsWith('arn:aws:')) {
      return NextResponse.json(
        { error: 'Invalid ARN format. Must start with "arn:aws:"' },
        { status: 400 }
      );
    }

    // Validate service
    const validServices = ['ec2', 'rds', 's3', 'iam', 'lambda'];
    if (!validServices.includes(service.toLowerCase())) {
      return NextResponse.json(
        { error: `Invalid service. Must be one of: ${validServices.join(', ')}` },
        { status: 400 }
      );
    }

    // 3. Connect to database
    await connectDB();

    // 4. Check if ARN already exists for this user
    const existingArn = await User.findOne({
      _id: decoded.id,
      awsRoleArn: arn.trim()
    });

    if (existingArn) {
      return NextResponse.json(
        { error: 'This ARN is already saved' },
        { status: 400 }
      );
    }

    // 5. Update user's awsRoleArn field
    const user = await User.findByIdAndUpdate(
      decoded.id,
      { awsRoleArn: arn.trim() },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { error: 'Failed to update user profile' },
        { status: 500 }
      );
    }

    // 6. Return success response
    return NextResponse.json({
      success: true,
      message: 'ARN saved successfully',
      data: {
        arn: arn.trim(),
        service: service.toLowerCase(),
        description: description || ''
      }
    });

  } catch (error) {
    console.error('Error saving ARN:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 