import { NextResponse } from 'next/server';
import { checkCredentials, createSessionValue, isValidArea, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from '@/lib/auth';

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { username, password, area } = body;

  if (!isValidArea(area)) {
    return NextResponse.json({ error: 'Area login tidak dikenali.' }, { status: 400 });
  }

  if (!checkCredentials(username, password)) {
    return NextResponse.json({ error: 'Username atau password salah.' }, { status: 401 });
  }

  const sessionValue = await createSessionValue(area);
  const res = NextResponse.json({ ok: true });
  // Overwrites the single shared cookie so it now authorizes ONLY `area` —
  // this is what "closes" whichever other area (Admin/Kasir/Laporan) was
  // open before.
  res.cookies.set(SESSION_COOKIE_NAME, sessionValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: '/'
  });
  return res;
}
