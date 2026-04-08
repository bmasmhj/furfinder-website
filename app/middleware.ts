import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../lib/auth';

const protectedRoutes = ['/dashboard', '/reports', '/matches', '/messages', '/profile'];
const publicRoutes = ['/', '/features', '/about', '/blog', '/contact', '/login', '/signup'];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute) {
    // Get token from authorization header or cookies
    const token = request.cookies.get('token')?.value || request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      // Redirect to login if no token
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      // Verify token
      verifyToken(token);
      return NextResponse.next();
    } catch {
      // Token is invalid, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Redirect authenticated users away from auth pages
  const token = request.cookies.get('token')?.value;
  if (token && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
