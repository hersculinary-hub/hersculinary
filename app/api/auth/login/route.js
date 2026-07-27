import { NextResponse } from 'next/server';
import { checkCredentials, createSessionValue, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from '@/lib/auth';

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { username, password } = body;

  if (!checkCredentials(username, password)) {
    return NextResponse.json({ error: 'Username atau password salah.' }, { status: 401 });
  }

  const sessionValue = await createSessionValue();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE_NAME, sessionValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: '/'
  });
  return res;
}
