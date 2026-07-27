// lib/auth-server.js
// Only import this from files inside app/api/** (Node.js runtime route
// handlers). Do NOT import it from middleware.js — next/headers is not
// meant to be used there.
import { cookies } from 'next/headers';
import { isSessionValid, SESSION_COOKIE_NAME } from './auth';

/**
 * Use inside API route handlers to require a logged-in admin session
 * before allowing a write (POST/PUT/DELETE).
 */
export async function requireApiSession() {
  const cookie = cookies().get(SESSION_COOKIE_NAME)?.value;
  return isSessionValid(cookie);
}
