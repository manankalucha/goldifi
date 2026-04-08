import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Route protection middleware.
 * Lightweight passthrough — Firebase client SDK uses IndexedDB (not cookies) on Vercel,
 * so server-side cookie checks don't work and caused a redirect loop after login.
 * Auth enforcement is handled by:
 *   1. Client-side layout guards (useAuth hook in each layout.tsx)
 *   2. Firestore Security Rules on the backend
 */
export function middleware(request: NextRequest) {
  // Allow all requests through — client-side layout components handle auth redirects.
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/agent/:path*', '/login'],
};
