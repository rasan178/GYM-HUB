// Simple middleware to handle specific requests
import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Handle Chrome DevTools requests
  if (pathname === '/.well-known/appspecific/com.chrome.devtools.json') {
    return NextResponse.rewrite(new URL('/api/devtools', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/.well-known/appspecific/com.chrome.devtools.json'
  ]
};
