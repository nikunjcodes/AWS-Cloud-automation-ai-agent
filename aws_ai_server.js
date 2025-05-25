import readline from "readline";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
const DEPLOYMENT_API_URL = "https://p8j8jwxfa0.execute-api.us-east-1.amazonaws.com/prod/AUTOMATION-MASTER-LAMBDA";


async function deployEC2(params) {
  try {
    const response = await fetch(DEPLOYMENT_API_URL, {
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
    const response = await fetch(DEPLOYMENT_API_URL, {
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
    const response = await fetch(DEPLOYMENT_API_URL, {
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

const SYSTEM_PROMPT = `You are an AI assistant that helps users deploy AWS services in a simple, beginner-friendly way.

Your behavior:
1. Understand the user's needs using simple language.
2. Based on the request, suggest only relevant AWS services: EC2, S3, or RDS.
   - "Deploy a website" → Suggest EC2 (for hosting), S3 (for static content), and optionally RDS (for database).
   - "Store files or data" → Suggest S3 (for storage) and EC2 (if processing is needed).
   - "Database hosting" → Suggest RDS.
3. Do not ask technical questions — keep it user-friendly and avoid cloud jargon.
4. Once you suggest a plan, ask: “Would you like me to proceed with this setup?”
5. If the user agrees, say: “Deploying your services...” and call the appropriate deployment functions from the tools listed below.
6. If the user says no or wants to change something, update the plan accordingly.
7. Never explain internal logic or backend functions to the user.

Available tools (functions to call when user agrees):
- \`deployEC2(params)\`: Deploy an EC2 instance. Requires: \`{ instanceType, imageId }\`
- \`deployS3(params)\`: Create an S3 bucket. Requires: \`{ bucketName }\`
- \`deployRDS(params)\`: Launch an RDS database. Requires: \`{ dbIdentifier, masterUsername, masterPassword }\`

Example:

User: I want to deploy a website  
AI: To deploy a website, you'll need:
  - EC2 for hosting your site
  - S3 for storing static files
  - RDS if your site needs a database  
Would you like me to proceed with this setup?

User: Yes  
AI: Deploying your services...
(Call \`deployEC2()\`, \`deployS3()\`, and \`deployRDS()\` internally without telling the user)
`;


async function askGemini(userMessages) {
  try {
    const messages = [
      { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
      ...userMessages.map(msg => ({ role: "user", parts: [{ text: msg }] })),
    ];
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: messages }),
    });
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    return "Error processing request.";
  }
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
console.log("🤖 AWS AI Assistant (Type 'exit' to quit)");

async function chat() {
  rl.question("You: ", async (input) => {
    if (input.toLowerCase() === "exit") {
      console.log("Goodbye! 👋");
      rl.close();
      return;
    }

    const aiResponse = await askGemini([input]);
    console.log("🤖 AI:", aiResponse);
    chat();
  });
}

let lastPlannedServices = [];

async function chat1() {
  rl.question("You: ", async (input) => {
    if (input.toLowerCase() === "exit") {
      console.log("Goodbye! 👋");
      rl.close();
      return;
    }

    // Check for agreement to proceed
    if (
      input.toLowerCase().includes("yes") ||
      input.toLowerCase().includes("go ahead") ||
      input.toLowerCase().includes("proceed")
    ) {
      if (lastPlannedServices.length === 0) {
        console.log("🤖 AI: I don’t have a setup plan yet. Tell me what you need help with.");
      } else {
        console.log("🤖 AI: Deploying your services...");

        for (const service of lastPlannedServices) {
          if (service === "ec2") {
            console.log("📦 Calling deployEC2()...");
            const ec2Res = await deployEC2({
              resourceType: "ec2",
              instanceType: "t2.micro",
              keyName: "final1",
              imageId: "ami-0f561d16f3799be82",
              securityGroup: "sg-018a9d92eaaf8f5bc",
            });
            console.log(ec2Res);
          } else if (service === "s3") {
            console.log("📦 Calling deployS3()...");
            const s3Res = await deployS3({
              resourceType: "s3",
              bucketName: `my-bucket-${Date.now()}`,
            });
            console.log(s3Res);
          } else if (service === "rds") {
            console.log("📦 Calling deployRDS()...");
            const rdsRes = await deployRDS({
              resourceType: "rds",
              dbIdentifier: `mydb-${Date.now()}`,
              masterUsername: "admin",
              masterPassword: "SecurePass123!",
            });
            console.log(rdsRes);
          }
        }

        lastPlannedServices = []; // Clear the plan after deployment
      }

      return chat1();
    }

    // If not a confirmation, ask Gemini for suggestions
    const aiResponse = await askGemini([input]);
    console.log("🤖 AI:", aiResponse);

    // Check AI response for which services were suggested
    lastPlannedServices = [];
    if (aiResponse.toLowerCase().includes("ec2")) lastPlannedServices.push("ec2");
    if (aiResponse.toLowerCase().includes("s3")) lastPlannedServices.push("s3");
    if (aiResponse.toLowerCase().includes("rds")) lastPlannedServices.push("rds");

    chat1();
  });
}


chat1();
