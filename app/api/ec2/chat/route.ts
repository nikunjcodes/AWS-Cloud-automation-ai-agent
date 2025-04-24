import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getAwsPricing, formatPricingInfo } from '@/lib/getAwsPricing';
import { EC2Client, DescribeInstanceTypesCommand } from '@aws-sdk/client-ec2';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// Initialize EC2 client without credentials - will be configured per request
const ec2Client = new EC2Client({
  region: process.env.AWS_REGION || 'us-east-1'
});
interface decode{
  id: string
}

const SYSTEM_PROMPT = `You are an AI assistant specialized in Amazon EC2 (Elastic Compute Cloud). Your role is to help users with:

1. Instance selection and configuration
2. Pricing and cost optimization
3. Security and networking
4. Performance optimization
5. Instance management
6. Auto-scaling

When responding:
- Use clear, concise language
- Provide step-by-step instructions when needed
- Include relevant AWS CLI commands or console steps
- Consider security best practices
- Suggest cost-effective solutions

Available tools:
- \`getPricing(instanceType)\`: Get detailed pricing information for a specific instance type
- \`getInstanceSpecs(instanceType)\`: Get technical specifications for an instance type
- \`deployEC2(params)\`: Deploy a new EC2 instance
- \`listInstances()\`: List existing instances
- \`startInstance()\`: Start an instance
- \`stopInstance()\`: Stop an instance

Example:
User: What's the pricing for t2.micro?
AI: Let me check the pricing and specifications for t2.micro instances...
[Detailed pricing and specifications will be displayed here]

Would you like me to help you deploy an instance?`;

// Instance specifications lookup
const INSTANCE_SPECS = {
  't2.micro': {
    vCPUs: 1,
    memory: 1,
    storage: 'EBS Only',
    network: 'Low to Moderate'
  },
  't2.small': {
    vCPUs: 1,
    memory: 2,
    storage: 'EBS Only',
    network: 'Low to Moderate'
  },
  't2.medium': {
    vCPUs: 2,
    memory: 4,
    storage: 'EBS Only',
    network: 'Low to Moderate'
  },
  't3.micro': {
    vCPUs: 2,
    memory: 1,
    storage: 'EBS Only',
    network: 'Low to Moderate'
  },
  't3.small': {
    vCPUs: 2,
    memory: 2,
    storage: 'EBS Only',
    network: 'Low to Moderate'
  },
  'm5.large': {
    vCPUs: 2,
    memory: 8,
    storage: 'EBS Only',
    network: 'Up to 10 Gigabit'
  },
  'm5.xlarge': {
    vCPUs: 4,
    memory: 16,
    storage: 'EBS Only',
    network: 'Up to 10 Gigabit'
  },
  'c5.large': {
    vCPUs: 2,
    memory: 4,
    storage: 'EBS Only',
    network: 'Up to 10 Gigabit'
  },
  'c5.xlarge': {
    vCPUs: 4,
    memory: 8,
    storage: 'EBS Only',
    network: 'Up to 10 Gigabit'
  }
};

// Helper function to extract pricing parameters from message
function extractPricingParams(message: string) {
  const params: any = {
    instanceType: 't2.micro',
    duration: 1, // Default to 1 month
    termType: 'OnDemand',
    operatingSystem: 'Linux',
    tenancy: 'Shared',
    location: 'US East (N. Virginia)'
  };

  // Extract instance type
  const instanceTypeMatch = message.match(/t[0-9]+\.[a-z]+/i);
  if (instanceTypeMatch) {
    params.instanceType = instanceTypeMatch[0];
  }

  // Extract duration
  const durationMatch = message.match(/(\d+)\s*(month|year|hour|day)s?/i);
  if (durationMatch) {
    const value = parseInt(durationMatch[1]);
    const unit = durationMatch[2].toLowerCase();
    if (unit === 'year') {
      params.duration = value * 12; // Convert years to months
    } else if (unit === 'hour') {
      params.duration = value / 720; // Convert hours to months (approx)
    } else if (unit === 'day') {
      params.duration = value / 30; // Convert days to months (approx)
    } else {
      params.duration = value;
    }
  }

  // Extract term type
  if (message.toLowerCase().includes('reserved')) {
    params.termType = 'Reserved';
  } else if (message.toLowerCase().includes('spot')) {
    params.termType = 'Spot';
  }

  // Extract operating system
  if (message.toLowerCase().includes('windows')) {
    params.operatingSystem = 'Windows';
  }

  // Extract tenancy
  if (message.toLowerCase().includes('dedicated')) {
    params.tenancy = 'Dedicated';
  }

  // Extract region
  const regionMatch = message.match(/(us|eu|ap|sa|ca|af|me)-(east|west|north|south|central)(-\d+)?/i);
  if (regionMatch) {
    params.location = regionMatch[0];
  }

  return params;
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return NextResponse.json(
        { error: 'Invalid message', message: 'Message is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // Check if the message is asking for pricing or instance specs
    const pricingMatch = message.toLowerCase().match(/price|cost|pricing|how much|t[0-9]+\.[a-z]+/i);
    if (pricingMatch) {
      // For pricing queries, allow public access
      const instanceTypeMatch = message.match(/t[0-9]+\.[a-z]+/i);
      const instanceType = instanceTypeMatch ? instanceTypeMatch[0] : 't2.micro';

      try {
        // Get instance specifications
        const specs = INSTANCE_SPECS[instanceType as keyof typeof INSTANCE_SPECS] || INSTANCE_SPECS['t2.micro'];
        
        // Get pricing information
        const params = extractPricingParams(message);
        const priceData = await getAwsPricing({
          serviceCode: 'AmazonEC2',
          instanceType,
          location: params.location,
          operatingSystem: params.operatingSystem,
          tenancy: params.tenancy,
          termType: params.termType
        });

        const formattedPrice = formatPricingInfo(priceData);
        if (formattedPrice) {
          // Calculate monthly cost based on term type
          let monthlyCost;
          const hoursInMonth = 730; // Average hours in a month (365.25 * 24 / 12)
          
          if (params.termType === 'Reserved') {
            monthlyCost = formattedPrice.pricePerUnit * hoursInMonth * 0.6; // 40% discount for reserved
          } else if (params.termType === 'Spot') {
            monthlyCost = formattedPrice.pricePerUnit * hoursInMonth * 0.3; // 70% discount for spot
          } else {
            monthlyCost = formattedPrice.pricePerUnit * hoursInMonth;
          }

          const totalCost = monthlyCost * params.duration;
          
          const pricingDetails = {
            basePrice: formattedPrice.pricePerUnit,
            monthlyCost: monthlyCost,
            totalCost: totalCost,
            specs: {
              vCPUs: specs.vCPUs,
              memory: specs.memory,
              storage: specs.storage,
              network: specs.network
            },
            details: `For ${params.instanceType} instances:\n` +
                    `- Description: ${formattedPrice.description}\n` +
                    `- Base Price: $${formattedPrice.pricePerUnit.toFixed(4)} per hour\n` +
                    `- Monthly Cost: $${monthlyCost.toFixed(2)}\n` +
                    `- Duration: ${params.duration} month${params.duration > 1 ? 's' : ''}\n` +
                    `- Total Cost: $${totalCost.toFixed(2)} for ${params.duration} month${params.duration > 1 ? 's' : ''}\n` +
                    `- Term Type: ${params.termType}\n` +
                    `- Operating System: ${params.operatingSystem}\n` +
                    `- Tenancy: ${params.tenancy}\n` +
                    `- Region: ${params.location}\n\n` +
                    `Technical Specifications:\n` +
                    `- vCPUs: ${specs.vCPUs}\n` +
                    `- Memory: ${specs.memory} GB\n` +
                    `- Storage: ${specs.storage}\n` +
                    `- Network Performance: ${specs.network}\n\n` +
                    (params.termType === 'Reserved' ? 
                      `Note: Reserved instances require a 1 or 3-year commitment and offer significant discounts (up to 75%) compared to On-Demand pricing.\n` :
                      params.termType === 'Spot' ?
                      `Note: Spot instances can be interrupted with 2 minutes notice and offer up to 90% discount compared to On-Demand pricing.\n` :
                      '')
          };

          return NextResponse.json({
            response: pricingDetails.details,
            pricing: pricingDetails
          });
        }
      } catch (error: any) {
        console.error('Error getting instance information:', error);
        return NextResponse.json({
          response: `I couldn't retrieve the instance information. ${error.message || 'Please try again.'}`
        });
      }
    }

    // For non-pricing queries, require authentication
    const token = req.headers.get('cookie')?.split('token=')[1]?.split(';')[0];
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required for this operation' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get user's AWS credentials
    await connectDB();
   
    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found', message: 'Please log in again' },
        { status: 404 }
      );
      );
    }

    // Process the user's message and generate a response
    let response = '';
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
      response = `I can help you with various EC2-related tasks:

1. Instance Selection & Configuration
   - Help choose the right instance type for your workload
   - Compare different instance types
   - Configure instance settings

2. Pricing & Cost Optimization
   - Calculate costs for different instance types
   - Compare On-Demand vs Reserved vs Spot pricing
   - Suggest cost-saving strategies

3. Deployment & Management
   - Guide you through instance deployment
   - Help with security group configuration
   - Assist with instance monitoring

4. Troubleshooting
   - Help diagnose common issues
   - Suggest solutions for performance problems
   - Guide you through error resolution

What specific aspect of EC2 would you like help with?`;
    } else if (lowerMessage.includes('deploy') || lowerMessage.includes('launch')) {
      response = `I can help you deploy an EC2 instance. Here's what you'll need:

1. Instance Configuration:
   - Instance Type (e.g., t2.micro, t3.small)
   - AMI (Amazon Machine Image)
   - Security Group
   - Key Pair

2. Optional Settings:
   - Storage configuration
   - Network settings
   - Tags
   - User data scripts

Would you like me to guide you through the deployment process?`;
    } else if (lowerMessage.includes('security') || lowerMessage.includes('firewall')) {
      response = `Security Groups in EC2 act as virtual firewalls. Here's what you need to know:

1. Key Concepts:
   - Inbound rules (ingress)
   - Outbound rules (egress)
   - Port ranges
   - IP address ranges

2. Common Ports:
   - 22: SSH
   - 80: HTTP
   - 443: HTTPS
   - 3389: RDP (Windows)

3. Best Practices:
   - Principle of least privilege
   - Regular security group reviews
   - Use specific IP ranges
   - Document security group purposes

Would you like help configuring a security group?`;
    } else if (lowerMessage.includes('storage') || lowerMessage.includes('ebs')) {
      response = `EC2 offers several storage options:

1. EBS (Elastic Block Store):
   - Persistent block storage
   - Multiple volume types (gp2, gp3, io1, etc.)
   - Snapshots for backup
   - Encryption options

2. Instance Store:
   - Temporary block storage
   - Higher performance
   - Data lost on instance stop/termination

3. EFS (Elastic File System):
   - Shared file storage
   - Multiple instances access
   - Scalable capacity

What storage solution are you interested in?`;
    } else {
      // Default response for unrecognized queries
      response = `I understand you're asking about EC2. Could you please be more specific about what you'd like to know? For example:

1. Instance types and their use cases
2. Pricing and cost optimization
3. Deployment and configuration
4. Security and networking
5. Storage options
6. Monitoring and management

What specific aspect would you like to learn more about?`;
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error('EC2 chat error:', error);
    return NextResponse.json(
      { 
        error: 'Server error',
        message: 'Failed to process request. Please try again later.'
      },
      { status: 500 }
    );
  }
} 