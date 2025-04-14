import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getAwsPricing, formatPricingInfo } from '@/lib/getAwsPricing';
import { RDSClient, DescribeDBEngineVersionsCommand } from '@aws-sdk/client-rds';

const rdsClient = new RDSClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const SYSTEM_PROMPT = `You are an AI assistant specialized in Amazon RDS (Relational Database Service). Your role is to help users with:

1. Database instance selection and configuration
2. Pricing and cost optimization
3. Security and networking
4. Performance optimization
5. Backup and recovery
6. High availability and scaling

When responding:
- Use clear, concise language
- Provide step-by-step instructions when needed
- Include relevant AWS CLI commands or console steps
- Consider security best practices
- Suggest cost-effective solutions

Available tools:
- \`getPricing(instanceType, engine)\`: Get detailed pricing information for a specific RDS instance type and engine
- \`getEngineVersions(engine)\`: Get available versions for a specific database engine
- \`deployRDS(params)\`: Deploy a new RDS instance
- \`listInstances()\`: List existing RDS instances
- \`createSnapshot()\`: Create a database snapshot
- \`restoreFromSnapshot()\`: Restore from a snapshot

Example:
User: What's the pricing for db.t2.micro with MySQL?
AI: Let me check the pricing and available versions for db.t2.micro instances running MySQL...
[Detailed pricing and version information will be displayed here]

Would you like to know more about RDS pricing or help with deployment?`;

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

    // Check if the message is asking for pricing or engine versions
    const pricingMatch = message.match(/price|cost|pricing|how much|db\.t[0-9]+\.[a-z]+/i);
    if (pricingMatch) {
      // Extract instance type if mentioned
      const instanceTypeMatch = message.match(/db\.t[0-9]+\.[a-z]+/i);
      const instanceType = instanceTypeMatch ? instanceTypeMatch[0] : 'db.t2.micro';
      
      // Extract database engine if mentioned
      const engineMatch = message.match(/mysql|postgresql|mariadb|oracle|sqlserver/i);
      const engine = engineMatch ? engineMatch[0].toLowerCase() : 'mysql';

      try {
        // Get available engine versions
        const describeCommand = new DescribeDBEngineVersionsCommand({
          Engine: engine,
          MaxRecords: 5
        });
        const engineVersions = await rdsClient.send(describeCommand);
        
        // Get pricing information
        const priceData = await getAwsPricing({
          serviceCode: 'AmazonRDS',
          instanceType,
          location: 'US East (N. Virginia)',
          databaseEngine: engine,
          deploymentOption: 'Single-AZ',
          termType: 'OnDemand'
        });

        const formattedPrice = formatPricingInfo(priceData);
        if (formattedPrice && engineVersions.DBEngineVersions?.[0]) {
          const latestVersion = engineVersions.DBEngineVersions[0];
          return NextResponse.json({
            response: `For ${instanceType} instances running ${engine}:\n` +
                     `- Description: ${formattedPrice.description}\n` +
                     `- Price: $${formattedPrice.pricePerUnit} per ${formattedPrice.unit}\n` +
                     `- Latest Version: ${latestVersion.EngineVersion}\n` +
                     `- Default Parameters Group: ${latestVersion.DefaultParameterGroupFamily}\n` +
                     `- Supported Features: ${latestVersion.SupportedFeatureNames?.join(', ') || 'N/A'}\n\n` +
                     `Would you like to know more about RDS pricing or help with deployment?`
          });
        }
      } catch (error) {
        console.error('Error getting RDS information:', error);
        return NextResponse.json({
          response: "I couldn't retrieve the RDS information at the moment. Would you like to proceed with deployment or ask about something else?"
        });
      }
    }

    // Forward the request to the backend server
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: message },
        ],
        context: {
          service: 'rds',
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get response from backend server');
    }

    const data = await response.json();
    return NextResponse.json({ response: data.response });
  } catch (error) {
    console.error('RDS chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 