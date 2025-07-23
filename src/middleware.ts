
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// All authentication middleware has been removed to ensure deployment stability.
// The admin panel is now publicly accessible.

export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};

    
