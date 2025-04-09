import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req: Request) {
  try {
    // Get token from cookie
    const token = req.headers.get('cookie')?.split('token=')[1]?.split(';')[0];
    console.log('Token from cookie:', token ? 'Present' : 'Missing');

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = await verifyToken(token);
    console.log('Token verification result:', decoded ? 'Success' : 'Failed');

    if (!decoded) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Connect to database and get user
    await connectDB();
    const user = await User.findById(decoded.id);
    console.log('User found:', user ? 'Yes' : 'No');
    console.log('User AWS role ARN:', user?.awsRoleArn);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found', message: 'Please log in again' },
        { status: 404 }
      );
    }

    // Parse AWS Role ARN to extract necessary information
    let amiId = '';
    let keyPairName = '';
    let securityGroupId = '';
    let region = 'us-east-1';

    if (user.awsRoleArn) {
      // Example ARN format: arn:aws:iam::123456789012:role/EC2DeploymentRole
      const arnParts = user.awsRoleArn.split(':');
      if (arnParts.length >= 6) {
        // Extract region from ARN (part 3)
        region = arnParts[3];
        
        // Extract account ID from ARN (part 4)
        const accountId = arnParts[4];
        
        // Extract role name from ARN (part 6)
        const roleName = arnParts[5].split('/').pop();

        // Construct AMI ARN using the account ID and region
        // This assumes a standard AMI naming convention in your account
        amiId = `ami-${accountId.substring(0, 8)}`;
        
        // Construct key pair name using role name
        keyPairName = `${roleName}-keypair`;
        
        // Construct security group ID using account ID
        securityGroupId = `sg-${accountId.substring(0, 8)}`;

        console.log('Extracted from ARN:', {
          region,
          accountId,
          roleName,
          amiId,
          keyPairName,
          securityGroupId
        });
      }
    }

    // Return user's AWS credentials
    const credentials = {
      amiArn: amiId,
      keyPairName: keyPairName,
      securityGroupId: securityGroupId,
      region: region
    };

    console.log('Returning credentials:', credentials);

    return NextResponse.json({ credentials });
  } catch (error) {
    console.error('Error fetching user credentials:', error);
    return NextResponse.json(
      { error: 'Server error', message: 'Failed to fetch credentials' },
      { status: 500 }
    );
  }
} 