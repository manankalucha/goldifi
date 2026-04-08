import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Route protection middleware.
 * Checks for a Firebase auth session cookie on protected routes.
 * Note: Full server-side Firebase session verification requires the Firebase Admin SDK
 * and a session cookie flow. This middleware provides client-side redirect protection;
 * actual authorization is enforced by Firestore Security Rules on the backend.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected route prefixes
  const isProtected =
    pathname.startsWith('/dashboard') || pathname.startsWith('/admin');

  if (isProtected) {
    // Check for the auth session cookie set by Firebase client SDK
    const hasSession =
      request.cookies.has('goldify-session') ||
      request.cookies.has('firebase-session');

    if (!hasSession) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect authenticated users away from login page
  if (pathname === '/login') {
    const hasSession =
      request.cookies.has('goldify-session') ||
      request.cookies.has('firebase-session');
    if (hasSession) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/login'],
};
