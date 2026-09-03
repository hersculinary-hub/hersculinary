// middleware.js
import { NextResponse } from 'next/server';
import { isSessionValid, SESSION_COOKIE_NAME } from './lib/auth';

export const config = {
  matcher: ['/admin/:path*', '/pos/:path*', '/laporan/:path*']
};

function areaForPath(pathname) {
  if (pathname.startsWith('/admin')) return 'admin';
  if (pathname.startsWith('/pos')) return 'pos';
  if (pathname.startsWith('/laporan')) return 'laporan';
  return null;
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const area = areaForPath(pathname);
  if (!area) return NextResponse.next();

  const cookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const valid = await isSessionValid(cookie, area);

  if (!valid) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('area', area);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
