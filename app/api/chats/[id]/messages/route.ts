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
    const user = await verifyToken(request);
    
    if (!user) {
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
    
    const chat = await Chat.findOne({ _id: params.id, user: user._id });
    
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
    const previousMessages = chat.messages.slice(-10).map(msg => msg.content);
    
    // Call the AI service to get a response
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Previous conversation: ${previousMessages.join('\n')}\n\nUser: ${content}\n\nAssistant:`;
    
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