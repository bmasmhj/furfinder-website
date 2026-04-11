
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

const protectedRoutes = ['/dashboard', '/reports', '/matches', '/messages', '/profile'];

const allowedOrigins = [
  'http://localhost:8081',
  'http://localhost:3000',
  'https://app.thefurfinder.com',
  'https://thefurfinder.com'
];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const origin = request.headers.get('origin') ?? '';
  const isAllowedOrigin = allowedOrigins.includes(origin);

  // 1. Handle CORS for all API routes
  if (pathname.startsWith('/api')) {
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      const response = new NextResponse(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
          'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
          'Access-Control-Max-Age': '86400',
          'Access-Control-Allow-Credentials': 'true',
        },
      });
      if (isAllowedOrigin) {
        response.headers.set('Access-Control-Allow-Origin', origin);
      }
      return response;
    }

    // Add CORS headers to the response
    const response = NextResponse.next();
    if (isAllowedOrigin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=59');
    return response;
  }

  // 2. Handle protection for frontend routes
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute) {
    const token = request.cookies.get('token')?.value || request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      verifyToken(token);
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 3. Redirect authenticated users away from auth pages
  const token = request.cookies.get('token')?.value;
  if (token && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'], // Removed (?!api) to allow CORS middleware
};
