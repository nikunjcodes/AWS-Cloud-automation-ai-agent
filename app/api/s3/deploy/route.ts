import { NextResponse, NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // 1. Verify Authentication
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized: No token provided' }, { status: 401 });
    }
    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    // 2. Get Deployment Parameters from Request Body
    const params = await request.json();
    const { bucketName } = params;

    if (!bucketName) {
      return NextResponse.json({ success: false, message: 'Missing required deployment parameter: bucketName' }, { status: 400 });
    }

    // 3. Forward Request to the Actual Deployment API
    const deploymentApiUrl = process.env.DEPLOYMENT_API_URL;
    if (!deploymentApiUrl) {
       console.error('DEPLOYMENT_API_URL environment variable is not set.');
       return NextResponse.json({ success: false, message: 'Server configuration error' }, { status: 500 });
    }

    const deployResponse = await fetch(deploymentApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Add resourceType for the backend lambda
      body: JSON.stringify({ resourceType: "s3", ...params }),
    });

    // 4. Process Deployment API Response
    const deployData = await deployResponse.json();

    if (!deployResponse.ok) {
      console.error('Deployment API Error:', deployData);
      return NextResponse.json(
        { success: false, message: deployData.message || 'S3 deployment failed', details: deployData }, 
        { status: deployResponse.status || 500 }
      );
    }

    // 5. Return Success Response
    return NextResponse.json({ 
      success: true, 
      message: 'S3 deployment initiated successfully', 
      data: deployData,
      url: "https://us-east-1.console.aws.amazon.com/s3/buckets?region=us-east-1&bucketType=general" // AWS S3 Console URL
    });

  } catch (error: any) {
    console.error('S3 Deploy API Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error during S3 deployment' }, 
      { status: 500 }
    );
  }
} 