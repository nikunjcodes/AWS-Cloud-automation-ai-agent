import { NextResponse, NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Chat from '@/models/Chat';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await verifyToken(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Not authorized' },
        { status: 401 }
      );
    }

    const chats = await Chat.find({ user: user._id })
      .sort({ updatedAt: -1 })
      .select('title updatedAt');
    
    return NextResponse.json({ success: true, chats });
  } catch (error) {
    console.error('Get chats error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await verifyToken(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Not authorized' },
        { status: 401 }
      );
    }

    const { title } = await request.json();
    
    const chat = await Chat.create({
      user: user._id,
      title: title || 'New Conversation',
      messages: []
    });
    
    return NextResponse.json({
      success: true,
      chat: {
        _id: chat._id,
        title: chat.title,
        updatedAt: chat.updatedAt
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Create chat error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
} 