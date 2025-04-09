import { SignJWT, jwtVerify } from 'jose';
import jwt from 'jsonwebtoken';
// DO NOT import User model or connectDB here for middleware compatibility

/**
 * Generates a JWT token.
 */
export const generateToken = async (payload: any) => {
  const secret = process.env.JWT_SECRET;
  console.log('[generateToken] Using JWT_SECRET:', secret ? `Present (length: ${secret.length})` : 'MISSING or undefined');
  
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not defined.');
  }

  const secretKey = new TextEncoder().encode(secret);
  
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secretKey);

  return token;
};

/**
 * Verifies a JWT token and returns the decoded payload.
 * This version is SAFE for use in Middleware (Edge Runtime).
 */
export const verifyTokenPayload = async (token: string): Promise<object | null> => {
  const secret = process.env.JWT_SECRET;
  console.log('[verifyTokenPayload] Using JWT_SECRET:', secret ? `Present (length: ${secret.length})` : 'MISSING or undefined');
  
  if (!secret) {
    console.error('JWT_SECRET environment variable is not defined for verifyTokenPayload.');
    return null;
  }

  try {
    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, secretKey);
    return payload;
  } catch (error: any) {
    console.error('Token verification failed in verifyTokenPayload:', error.message);
    return null;
  }
};

/**
 * Verifies a JWT token AND retrieves the user from the database.
 * This version is intended for use in API routes (Node.js runtime) ONLY.
 * DO NOT use this function in Middleware.
 */
export const verifyTokenAndGetUser = async (token: string) => {
  // Dynamically import DB-related modules ONLY when this function is called
  const connectDB = (await import('./mongodb')).default;
  const User = (await import('@/models/User')).default;

  const payload = await verifyTokenPayload(token);

  if (!payload || typeof payload !== 'object' || !('id' in payload)) {
    return null;
  }

  try {
    await connectDB();
    const user = await User.findById(payload.id).select('-password');
    return user;
  } catch (dbError) {
    console.error('Database error fetching user after token verification:', dbError);
    return null;
  }
};

export async function verifyToken(token: string): Promise<any> {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// --- Remove client-side localStorage functions --- 
// These belong in lib/client-auth.ts

// --- Remove unused/problematic functions ---
// export const verifyRequest = ...
// export async function verifyTokenMiddleware(...) ... 