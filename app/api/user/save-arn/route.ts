import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import User from '@/models/User';
import connectDB from '@/lib/mongodb';

export async function POST(req: Request) {
  try {
    // 1. Verify Authentication
    const cookies = req.headers.get('cookie');
    if (!cookies) {
      return NextResponse.json({ error: 'Unauthorized: No cookies found' }, { status: 401 });
    }

    const tokenMatch = cookies.match(/token=([^;]+)/);
    if (!tokenMatch) {
      return NextResponse.json({ error: 'Unauthorized: No token found in cookies' }, { status: 401 });
    }

    const token = tokenMatch[1];
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

    // 4. Update user's awsRoleArn field
    const user = await User.findByIdAndUpdate(
      decoded.id,
      { 
        awsRoleArn: arn.trim(),
        'awsCredentials.region': arn.split(':')[3] || 'us-east-1' // Extract region from ARN
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { error: 'Failed to update user profile' },
        { status: 500 }
      );
    }

    // 5. Return success response
    return NextResponse.json({
      success: true,
      message: 'ARN saved successfully',
      data: {
        arn: arn.trim(),
        service: service.toLowerCase(),
        description: description || '',
        region: arn.split(':')[3] || 'us-east-1'
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