import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

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

interface TokenPayload {
  id: string;
  email: string;
}

export async function POST(req: Request) {
  try {
    // 1. Verify Authentication
    const token = req.headers.get('cookie')?.split('token=')[1]?.split(';')[0];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token) as TokenPayload;
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // 2. Parse and Validate Request Body
    const body = await req.json();
    console.log('Received request body:', body);

    if (!body || !body.message || typeof body.message !== 'string' || body.message.trim() === '') {
      console.log('Invalid message format:', body);
      return NextResponse.json(
        { error: 'Message is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    const message = body.message.trim();

    // 3. Get User's AWS Credentials
    await connectDB();
    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if this is a help request about AWS credentials
    if (message.toLowerCase().includes('aws credentials') || 
        message.toLowerCase().includes('aws setup') ||
        message.toLowerCase().includes('configure aws')) {
      return NextResponse.json({
        response: `To use S3 features, you need to configure your AWS credentials. Please go to your profile settings and add your AWS Access Key ID and Secret Access Key. You can get these from your AWS IAM console.`
      });
    }

    if (!user.awsCredentials?.accessKey || !user.awsCredentials?.secretKey) {
      return NextResponse.json({
        response: `I notice you haven't configured your AWS credentials yet. To use S3 features, you'll need to:
1. Go to your profile settings
2. Add your AWS Access Key ID and Secret Access Key
3. Save the changes

You can get your AWS credentials from the AWS IAM console. Would you like me to explain how to get these credentials?`
      });
    }

    // 4. Initialize S3 Client with User's Credentials
    const s3Client = new S3Client({
      region: user.awsCredentials.region || 'us-east-1',
      credentials: {
        accessKeyId: user.awsCredentials.accessKey,
        secretAccessKey: user.awsCredentials.secretKey,
      },
    });

    // 5. Get Existing Buckets
    try {
      const listCommand = new ListBucketsCommand({});
      const buckets = await s3Client.send(listCommand);

      // 6. Prepare Context for AI
      const context = {
        systemPrompt: SYSTEM_PROMPT,
        userMessage: message,
        existingBuckets: buckets.Buckets?.map(bucket => ({
          name: bucket.Name,
          creationDate: bucket.CreationDate,
        })),
      };

      // 7. Call AWS AI Server
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
    } catch (awsError: any) {
      console.error('AWS S3 Error:', awsError);
      return NextResponse.json({
        response: `I encountered an error while trying to access AWS S3. This could be due to:
1. Invalid AWS credentials
2. Insufficient permissions
3. Network connectivity issues

Please check your AWS credentials in your profile settings and ensure they have the necessary permissions. Would you like me to help you troubleshoot this?`
      });
    }
  } catch (error) {
    console.error('S3 chat error:', error);
    return NextResponse.json({
      response: `I'm sorry, but I encountered an error while processing your request. Please try again later or contact support if the issue persists.`
    });
  }
} 