import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';

const SYSTEM_PROMPT = `You are an AI assistant specialized in Amazon S3 (Simple Storage Service). Your role is to help users with:

1. Bucket management and configuration
2. Object storage and retrieval
3. Access control and permissions
4. Lifecycle management
5. Versioning and replication
6. Performance optimization

When responding:
- Use clear, concise language
- Provide step-by-step instructions when needed
- Include relevant AWS CLI commands or console steps
- Consider security best practices
- Suggest cost-effective solutions

Available tools:
- \`deployS3(params)\`: Create a new S3 bucket
- \`listBuckets()\`: List existing buckets
- \`putObject()\`: Upload files to S3
- \`getObject()\`: Download files from S3
- \`setBucketPolicy()\`: Configure bucket policies

Example:
User: How do I create a new bucket?
AI: I'll help you create a new S3 bucket. Here's what we'll do:
1. Choose a globally unique bucket name
2. Select the appropriate region
3. Configure bucket settings
4. Set up access permissions

Would you like me to proceed with the bucket creation?`;

export async function POST(req: Request) {
  try {
    const token = req.headers.get('cookie')?.split('token=')[1]?.split(';')[0];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { message } = await req.json();
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Initialize S3 client
    const s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });

    // Get existing buckets
    const listCommand = new ListBucketsCommand({});
    const buckets = await s3Client.send(listCommand);

    // Prepare context for the AI
    const context = {
      systemPrompt: SYSTEM_PROMPT,
      userMessage: message,
      existingBuckets: buckets.Buckets?.map(bucket => ({
        name: bucket.Name,
        creationDate: bucket.CreationDate,
      })),
    };

    // Call the AWS AI server
    const response = await fetch(process.env.AWS_AI_SERVER_URL || 'http://localhost:3001/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: context.systemPrompt },
          { role: 'user', content: message },
        ],
        context,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get response from AI server');
    }

    const data = await response.json();
    return NextResponse.json({ response: data.response });
  } catch (error) {
    console.error('S3 chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 