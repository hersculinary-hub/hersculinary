// lib/auth-server.js
// Only import this from files inside app/api/** (Node.js runtime route
// handlers). Do NOT import it from middleware.js — next/headers is not
// meant to be used there.
import { cookies } from 'next/headers';
import { isSessionValid, SESSION_COOKIE_NAME } from './auth';

/**
 * Use inside API route handlers to require a logged-in session for a
 * specific area ('admin' | 'pos' | 'laporan'). Since only one area can be
 * open at a time (single shared cookie), a session that currently
 * authorizes a different area returns false here too.
 */
export async function requireApiSession(area) {
  const cookie = cookies().get(SESSION_COOKIE_NAME)?.value;
  return isSessionValid(cookie, area);
}
