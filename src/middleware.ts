import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Only protect /advisor routes
  if (request.nextUrl.pathname.startsWith('/advisor')) {
    const authHeader = request.headers.get('authorization');
    
    // Check if auth header exists and matches
    if (authHeader) {
      const auth = authHeader.split(' ')[1];
      const [user, pwd] = Buffer.from(auth, 'base64').toString().split(':');
      
      const expectedUser = process.env.ADVISOR_USERNAME;
      const expectedPwd = process.env.ADVISOR_PASSWORD;
      
      // If env vars are set, enforce them. If not, bypass auth (for local dev ease, but prompt says "secure it now with basic auth via environment variables")
      if (expectedUser && expectedPwd) {
        if (user === expectedUser && pwd === expectedPwd) {
          return NextResponse.next();
        }
      } else {
        // If no credentials configured, we still enforce a default or block
        console.warn('ADVISOR_USERNAME and ADVISOR_PASSWORD not set in .env');
      }
    }

    // Return 401 if unauthorized
    return new NextResponse('Authentication Required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Advisor Dashboard"',
      },
    });
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/advisor/:path*',
};
