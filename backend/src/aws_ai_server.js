require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// AWS Service Functions
async function deployEC2(params) {
  try {
    const response = await fetch(process.env.DEPLOYMENT_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resourceType: "ec2", ...params }),
    });
    const data = await response.json();
    return `✅ EC2 deployment result: ${JSON.stringify(data)}`;
  } catch (error) {
    return `❌ EC2 deployment failed: ${error.message}`;
  }
}

async function deployS3(params) {
  try {
    const response = await fetch(process.env.DEPLOYMENT_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resourceType: "s3", ...params }),
    });
    const data = await response.json();
    return `✅ S3 creation result: ${JSON.stringify(data)}`;
  } catch (error) {
    return `❌ S3 creation failed: ${error.message}`;
  }
}

async function deployRDS(params) {
  try {
    const response = await fetch(process.env.DEPLOYMENT_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resourceType: "rds", ...params }),
    });
    const data = await response.json();
    return `✅ RDS creation result: ${JSON.stringify(data)}`;
  } catch (error) {
    return `❌ RDS creation failed: ${error.message}`;
  }
}

const SYSTEM_PROMPTS = {
  ec2: `You are an AI assistant specialized in Amazon EC2 (Elastic Compute Cloud). Your role is to help users with:

1. Instance management and configuration
2. Security group setup
3. Load balancing and auto-scaling
4. Monitoring and performance optimization
5. Cost optimization
6. Backup and recovery

When responding:
- Use clear, concise language
- Provide step-by-step instructions when needed
- Include relevant AWS CLI commands or console steps
- Consider security best practices
- Suggest cost-effective solutions

Available tools:
- \`deployEC2(params)\`: Launch a new EC2 instance
- \`describeInstances()\`: Get information about existing instances
- \`createSecurityGroup()\`: Create security groups
- \`modifyInstance()\`: Modify instance configuration
- \`createImage()\`: Create AMI from instance`,

  s3: `You are an AI assistant specialized in Amazon S3 (Simple Storage Service). Your role is to help users with:

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
- \`setBucketPolicy()\`: Configure bucket policies`,

  rds: `You are an AI assistant specialized in Amazon RDS (Relational Database Service). Your role is to help users with:

1. Database instance management
2. Backup and recovery
3. Performance optimization
4. Security configurations
5. Cost optimization
6. Migration strategies

When responding:
- Use clear, concise language
- Provide step-by-step instructions when needed
- Include relevant AWS CLI commands or console steps
- Consider security best practices
- Suggest cost-effective solutions

Available tools:
- \`deployRDS(params)\`: Deploy a new RDS instance
- \`describeDBInstances()\`: Get information about existing instances
- \`createDBSnapshot()\`: Create a backup snapshot
- \`modifyDBInstance()\`: Modify instance configuration`
};

let lastPlannedServices = [];

// Routes
app.post('/chat', async (req, res) => {
  try {
    const { messages, context } = req.body;
    const userMessage = messages[messages.length - 1].content;
    const service = context?.service || 'general';

    // Check for agreement to proceed
    if (
      userMessage.toLowerCase().includes("yes") ||
      userMessage.toLowerCase().includes("go ahead") ||
      userMessage.toLowerCase().includes("proceed")
    ) {
      if (lastPlannedServices.length === 0) {
        return res.json({ response: "I don't have a setup plan yet. Tell me what you need help with." });
      }

      let deploymentResults = [];
      for (const service of lastPlannedServices) {
        if (service === "ec2") {
          const result = await deployEC2({
            instanceType: "t2.micro",
            keyName: "final1",
            imageId: "ami-0f561d16f3799be82",
            securityGroup: "sg-018a9d92eaaf8f5bc",
          });
          deploymentResults.push(result);
        } else if (service === "s3") {
          const result = await deployS3({
            bucketName: `my-bucket-${Date.now()}`,
          });
          deploymentResults.push(result);
        } else if (service === "rds") {
          const result = await deployRDS({
            dbIdentifier: `mydb-${Date.now()}`,
            masterUsername: "admin",
            masterPassword: "SecurePass123!",
          });
          deploymentResults.push(result);
        }
      }

      lastPlannedServices = [];
      return res.json({ response: deploymentResults.join("\n") });
    }

    // Process the message with Gemini API
    const response = await fetch(process.env.GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: SYSTEM_PROMPTS[service] || SYSTEM_PROMPTS.ec2 }] },
          ...messages.map(msg => ({ role: "user", parts: [{ text: msg.content }] })),
        ],
      }),
    });

    const data = await response.json();
    const aiResponse = data.candidates[0].content.parts[0].text;

    // Update planned services
    lastPlannedServices = [];
    if (aiResponse.toLowerCase().includes("ec2")) lastPlannedServices.push("ec2");
    if (aiResponse.toLowerCase().includes("s3")) lastPlannedServices.push("s3");
    if (aiResponse.toLowerCase().includes("rds")) lastPlannedServices.push("rds");

    res.json({ response: aiResponse });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(port, () => {
  console.log(`AWS AI Server running on port ${port}`);
}); 