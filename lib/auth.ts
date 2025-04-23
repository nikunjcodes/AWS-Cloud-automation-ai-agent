import { SignJWT, jwtVerify } from 'jose';
// DO NOT import User model or connectDB here for middleware compatibility

/**
 * Generates a JWT token.
 */
export const generateToken = async (payload: any) => {
  const secret = process.env.JWT_SECRET;
  const expiry = process.env.JWT_EXPIRY || '3d'; // Default to 3 days if not set
  
  console.log('[generateToken] Using JWT_SECRET:', secret ? `Present (length: ${secret.length})` : 'MISSING or undefined');
  console.log('[generateToken] Token expiry set to:', expiry);
  
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not defined.');
  }

  const secretKey = new TextEncoder().encode(secret);
  
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(expiry)
    .sign(secretKey);

  return token;
};

/**
 * Verifies a JWT token and returns the decoded payload.
 * This version is SAFE for use in Middleware (Edge Runtime).
 */
export const verifyToken = async (token: string): Promise<object | null> => {
  const secret = process.env.JWT_SECRET;
  console.log('[verifyToken] Using JWT_SECRET:', secret ? `Present (length: ${secret.length})` : 'MISSING or undefined');
  
  if (!secret) {
    console.error('JWT_SECRET environment variable is not defined.');
    return null;
  }

  try {
    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, secretKey);
    return payload;
  } catch (error: any) {
    console.error('Token verification failed:', error.message);
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

  const payload = await verifyToken(token);

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

// --- Remove client-side localStorage functions --- 
// These belong in lib/client-auth.ts

// --- Remove unused/problematic functions ---
// export const verifyRequest = ...
// export async function verifyTokenMiddleware(...) ... 