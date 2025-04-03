import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import User from '../models/User';
import connectDB from './mongodb';

export interface JWTPayload {
  id: string;
  email: string;
}

// Verify token middleware
export async function verifyToken(req: NextRequest) {
  // Connect to database
  await connectDB();

  // Get token from header
  let token;
  
  const authHeader = req.headers.get('authorization');
  const cookies = req.cookies;
  
  if (authHeader?.startsWith('Bearer')) {
    // Set token from Bearer token in header
    token = authHeader.split(' ')[1];
  } else if (cookies.get('token')) {
    // Set token from cookie
    token = cookies.get('token')?.value;
  }

  // Check if token exists
  if (!token) {
    return null;
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JWTPayload;

    // Get user from the token
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '30d'
  });
} 