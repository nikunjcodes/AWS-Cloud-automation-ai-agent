import { NextResponse, NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Chat from '@/models/Chat';
import { verifyToken } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
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

    const chat = await Chat.findOne({ _id: context.params.id, user: user._id });
    
    if (!chat) {
      return NextResponse.json(
        { success: false, message: 'Chat not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, chat });
  } catch (error) {
    console.error('Get chat error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
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

    const chat = await Chat.findOneAndDelete({ _id: context.params.id, user: user._id });
    
    if (!chat) {
      return NextResponse.json(
        { success: false, message: 'Chat not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, message: 'Chat deleted' });
  } catch (error) {
    console.error('Delete chat error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
} 