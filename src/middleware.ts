import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const session = req.cookies.get("accessToken")?.value;
  const { pathname } = req.nextUrl;

  // Allow unauthenticated access to login, static files, and API routes
  if (
    pathname.startsWith('/login') || 
    pathname.startsWith('/api') || 
    pathname.startsWith('/_next')
  ) {
    return NextResponse.next();
  }

  // Redirect to login if the authenticated session cookie is missing.
  if (!session) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('next', `${pathname}${req.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  // Allow access if sessionid exists
  return NextResponse.next();
}

// Apply middleware to specific routes
export const config = {
  matcher: [
    '/admin/:path*',
    '/demanda/:path*',
    '/evaluacion/:path*',
    '/indicadores/:path*',
    '/legajo/:path*',
    '/legajo-mesa/:path*',
    '/mesadeentrada/:path*',
    '/nuevoingreso/:path*',
    '/oficios/:path*',
  ],
};
