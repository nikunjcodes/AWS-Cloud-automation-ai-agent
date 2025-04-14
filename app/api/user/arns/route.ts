import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';

export async function GET(req: Request) {
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

    // 2. Connect to database
    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // 3. Fetch ARNs for the user
    const arns = await db.collection('arns')
      .find({ userId: decoded.id })
      .sort({ createdAt: -1 })
      .toArray();

    // 4. Return ARNs
    return NextResponse.json({
      arns: arns.map(arn => ({
        _id: arn._id.toString(),
        arn: arn.arn,
        service: arn.service,
        description: arn.description,
        createdAt: arn.createdAt
      }))
    });

  } catch (error) {
    console.error('Error fetching ARNs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 