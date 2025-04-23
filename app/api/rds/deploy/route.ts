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
    const { dbName,masterUsername,masterPassword } = params;

    if (!dbName || !masterUsername || !masterPassword) {
      return NextResponse.json({ success: false, message: 'Database name is required' }, { status: 400 });
    }

    // 3. Forward Request to the Actual Deployment API
    const deploymentApiUrl = process.env.DEPLOYMENT_API_URL;
    if (!deploymentApiUrl) {
       console.error('DEPLOYMENT_API_URL environment variable is not set.');
       return NextResponse.json({ success: false, message: 'Server configuration error' }, { status: 500 });
    }

    const rdsConfig = {
      resourceType: "rds",
      DBInstanceIdentifier: `db-${dbName}-${Date.now()}`,
      AllocatedStorage: 20,
      DBInstanceClass: "db.m5.large", // Free Tier eligible
      Engine: "mysql",
      EngineVersion: "8.0.33", // ✅ Known to work with db.t3.micro
      MasterUsername: masterUsername,
      MasterUserPassword: masterPassword,
      DBName: dbName,
      LicenseModel: "general-public-license",
      BackupRetentionPeriod: 7,
      MultiAZ: false,
      PubliclyAccessible: true,
      StorageType: "gp2",
      AutoMinorVersionUpgrade: true,
      Port: 3306,
      EnableIAMDatabaseAuthentication: false,
      DeletionProtection: false,
      Tags: [
        {
          Key: "Name",
          Value: dbName,
        }
      ]
    };
    
    

    const deployResponse = await fetch(deploymentApiUrl, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(rdsConfig),
    });

    // 4. Process Deployment API Response
    const deployData = await deployResponse.json();

    if (!deployResponse.ok) {
      console.error('Deployment API Error:', deployData);
      return NextResponse.json(
        { success: false, message: deployData.message || 'RDS deployment failed', details: deployData }, 
        { status: deployResponse.status || 500 }
      );
    }

    // 5. Return Success Response
    return NextResponse.json({ success: true, message: 'RDS deployment initiated successfully', data: deployData });

  } catch (error: any) {
    console.error('RDS Deploy API Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error during RDS deployment' }, 
      { status: 500 }
    );
  }
} 