// middleware.js
import { NextResponse } from 'next/server';
import { isSessionValid, SESSION_COOKIE_NAME } from './lib/auth';

export const config = {
  matcher: ['/admin/:path*', '/pos/:path*', '/laporan/:path*']
};

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Login page itself must stay reachable
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  const cookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const valid = await isSessionValid(cookie);

  if (!valid) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
