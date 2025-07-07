import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

// List of paths that require authentication
const protectedPaths = ['/history', '/settings', '/transactions'];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Check if the path is in the list of protected paths
  const isProtectedPath = protectedPaths.some(protectedPath => 
    path === protectedPath || path.startsWith(`${protectedPath}/`)
  );
  
  if (isProtectedPath) {
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });
    
    // If no token, redirect to the login page
    if (!token) {
      const url = new URL('/', request.url);
      url.searchParams.set('callbackUrl', path);
      return NextResponse.redirect(url);
    }
  }
  
  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  matcher: ['/history/:path*', '/settings/:path*', '/transactions/:path*'],
};
