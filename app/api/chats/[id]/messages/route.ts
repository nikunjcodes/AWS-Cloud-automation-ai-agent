import { NextResponse, NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Chat from '@/models/Chat';
import { verifyToken } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authorized' },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Not authorized' },
        { status: 401 }
      );
    }

    const { content } = await request.json();
    
    if (!content) {
      return NextResponse.json(
        { success: false, message: 'Content is required' },
        { status: 400 }
      );
    }
    
    // Ensure params.id is properly handled
    const chatId = params.id;
    if (!chatId) {
      return NextResponse.json(
        { success: false, message: 'Chat ID is required' },
        { status: 400 }
      );
    }
    
    const chat = await Chat.findOne({ _id: chatId, user: decoded.id });
    
    if (!chat) {
      return NextResponse.json(
        { success: false, message: 'Chat not found' },
        { status: 404 }
      );
    }
    
    // Add user message
    chat.messages.push({
      sender: 'user',
      content,
      timestamp: new Date()
    });
    
    // Extract previous conversation for context
    const previousMessages = chat.messages.slice(-10).map((msg: { content: string }) => msg.content);
    
    // Call the AI service to get a response
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const systemPrompt = `You are an AWS Cloud Infrastructure expert assistant. Your role is to help users with:

1. AWS Service Selection and Configuration
   - EC2 (Compute)
   - RDS (Database)
   - S3 (Storage)
   - VPC (Networking)
   - IAM (Security)
   - CloudWatch (Monitoring)

2. Infrastructure Design
   - High availability
   - Scalability
   - Security best practices
   - Cost optimization

3. Implementation Guidance
   - Step-by-step deployment instructions
   - AWS CLI commands
   - CloudFormation templates
   - Best practices

When responding:
- Keep responses clear and concise
- Focus on practical, actionable advice
- Use simple language that's easy to understand
- When mentioning EC2, RDS, or S3, encourage users to click the highlighted service block above for detailed management options
- Provide specific AWS service recommendations
- Include relevant AWS CLI commands or console steps
- Consider security and cost implications

Example:
User: I need to host a web application
AI: For hosting a web application on AWS, I recommend:
1. EC2 for compute resources
2. RDS for database
3. S3 for static assets
4. CloudFront for CDN
5. Route 53 for DNS

Click the highlighted EC2, RDS, and S3 blocks above to manage these services directly. Would you like me to provide specific configuration details for any of these services?`;

    const prompt = `${systemPrompt}\n\nPrevious conversation: ${previousMessages.join('\n')}\n\nUser: ${content}\n\nAssistant:`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiResponse = response.text();
    
    // Add AI message
    const aiMessage = {
      sender: 'assistant',
      content: aiResponse,
      timestamp: new Date()
    };
    
    chat.messages.push(aiMessage);
    
    // Update chat title if this is the first message
    if (chat.messages.length <= 2) {
      chat.title = content.substring(0, 30) + (content.length > 30 ? '...' : '');
    }
    
    chat.updatedAt = new Date();
    await chat.save();
    
    return NextResponse.json({
      success: true,
      message: aiMessage,
      title: chat.title
    });
  } catch (error) {
    console.error('Add message error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
} 