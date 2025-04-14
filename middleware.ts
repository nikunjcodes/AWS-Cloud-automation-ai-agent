import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyTokenPayload } from '@/lib/auth';

// Define paths that are public
const publicPaths = ['/login', '/register', '/api/auth/login', '/api/auth/register'];

// Define paths involved in the onboarding flow
const onboardingPaths = ['/onboarding/aws-account', '/onboarding/create-role', '/api/user/save-arn'];

// Define paths that require full authentication AND AWS setup
const protectedPaths = [
  '/chat', 
  '/ec2', 
  '/s3', 
  '/rds', 
  '/api/chats', // Includes /api/chats/* via startsWith
  '/api/ec2',   // Includes /api/ec2/* 
  '/api/s3',    // Includes /api/s3/*
  '/api/rds',   // Includes /api/rds/*
  '/api/user/profile'
];

async function checkUserProfile(request: NextRequest) {
  try {
    const profileRes = await fetch(new URL('/api/user/profile', request.url).toString(), {
      headers: { 
        'Cookie': request.headers.get('Cookie') || '',
        'Accept': 'application/json'
      },
      credentials: 'include'
    });

    if (!profileRes.ok) {
      console.error(`Profile API returned status: ${profileRes.status}`);
      return null;
    }

    const contentType = profileRes.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Profile API returned non-JSON response');
      return null;
    }

    try {
      const text = await profileRes.text();
      const profileData = JSON.parse(text);
      return profileData;
    } catch (parseError) {
      console.error('Failed to parse profile API response:', parseError);
      return null;
    }
  } catch (error) {
    console.error('Error checking user profile:', error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // Allow public paths always
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // --- Handle Authentication --- 
  let isValidToken = false;
  let userId = null;

  if (token) {
    console.log('Middleware: Found token cookie:', token ? 'Yes' : 'No');
    const payload = await verifyTokenPayload(token);
    console.log('Middleware: verifyTokenPayload result:', payload);
    
    if (payload && typeof payload === 'object' && 'id' in payload) {
      isValidToken = true;
      userId = payload.id;
      console.log('Middleware: Token VALID, User ID:', userId);
    } else {
      console.log('Middleware: Invalid token payload detected.');
      // For API routes, return 401 instead of redirecting
      if (pathname.startsWith('/api/')) {
        return new NextResponse(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  // If no valid token and accessing a non-public/non-onboarding path, redirect to login
  if (!isValidToken && !onboardingPaths.some(path => pathname.startsWith(path))) {
    console.log(`Middleware: No valid token, redirecting from ${pathname} to /login`);
    // For API routes, return 401 instead of redirecting
    if (pathname.startsWith('/api/')) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // --- Handle Onboarding Redirection --- 
  if (isValidToken && onboardingPaths.some(path => pathname.startsWith(path))) {
    const profileData = await checkUserProfile(request);
    if (profileData?.success && profileData?.user?.awsRoleArn) {
      console.log(`Middleware: User with ARN in onboarding path ${pathname}, redirecting to /chat`);
      return NextResponse.redirect(new URL('/chat', request.url));
    }
    return NextResponse.next();
  }

  // --- Handle Protected Path Access Control --- 
  if (protectedPaths.some(path => pathname.startsWith(path))) {
    if (!isValidToken) {
      console.log(`Middleware: No valid token for protected path ${pathname}, redirecting to /login`);
      if (pathname.startsWith('/api/')) {
        return new NextResponse(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    const profileData = await checkUserProfile(request);
    if (profileData?.success && profileData?.user?.awsRoleArn) {
      return NextResponse.next();
    } else {
      console.log(`Middleware: User without ARN accessing protected path ${pathname}, redirecting to /onboarding/aws-account`);
      // For API routes, return 403 instead of redirecting
      if (pathname.startsWith('/api/')) {
        return new NextResponse(
          JSON.stringify({ error: 'AWS setup required' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
      return NextResponse.redirect(new URL('/onboarding/aws-account', request.url));
    }
  }

  return NextResponse.next();
}

// Configuration for the middleware matcher
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/auth/logout (allow logout always)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/auth/logout).*)',
  ],
}; 