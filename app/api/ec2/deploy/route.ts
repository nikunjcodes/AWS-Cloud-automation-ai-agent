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
    const { instanceType, keyName } = params;
    const imageId = "ami-0f561d16f3799be82";
    const securityGroup = "sg-018a9d92eaaf8f5bc";

    // Basic validation (can be more extensive)
    if (!instanceType || !keyName) {
      return NextResponse.json({ success: false, message: 'Missing required deployment parameters' }, { status: 400 });
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
      body: JSON.stringify({ 
        resourceType: "ec2", 
        instanceType,
        keyName,
        imageId,
        securityGroup
      }),
    });

    // 4. Process Deployment API Response
    const deployData = await deployResponse.json();

    if (!deployResponse.ok) {
      // Forward error from deployment API if possible
      console.error('Deployment API Error:', deployData);
      return NextResponse.json(
        { success: false, message: deployData.message || 'Deployment failed', details: deployData }, 
        { status: deployResponse.status || 500 }
      );
    }

    // 5. Return Success Response
    return NextResponse.json({ success: true, message: 'EC2 deployment initiated successfully', data: deployData });

  } catch (error: any) {
    console.error('EC2 Deploy API Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error during EC2 deployment' }, 
      { status: 500 }
    );
  }
} 