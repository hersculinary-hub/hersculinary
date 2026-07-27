// lib/auth.js
//
// Minimal cookie-session auth for the admin & POS area. No external auth
// dependency is used so the project stays lightweight on Vercel.
// The cookie value is `<expiresAt>.<hmacSignature>` signed with AUTH_SECRET.
//
// This file only uses Web Crypto (available in both the Edge runtime used by
// middleware.js and the Node runtime used by API routes) — it must NOT import
// next/headers or anything Node-only. See lib/auth-server.js for the
// Node-only helper used inside API routes.

const COOKIE_NAME = 'hers_admin_session';
const SESSION_HOURS = 12;

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error(
      'AUTH_SECRET belum diatur. Tambahkan variabel lingkungan AUTH_SECRET (string acak apa saja).'
    );
  }
  return secret;
}

async function hmac(message, secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sigBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Buffer.from(sigBuffer).toString('hex');
}

export async function createSessionValue() {
  const expires = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
  const secret = getSecret();
  const signature = await hmac(String(expires), secret);
  return `${expires}.${signature}`;
}

export async function isSessionValid(cookieValue) {
  if (!cookieValue) return false;
  const [expiresStr, signature] = cookieValue.split('.');
  if (!expiresStr || !signature) return false;
  const expires = Number(expiresStr);
  if (!Number.isFinite(expires) || expires < Date.now()) return false;
  try {
    const secret = getSecret();
    const expected = await hmac(expiresStr, secret);
    return expected === signature;
  } catch {
    return false;
  }
}

export function checkCredentials(username, password) {
  const validUser = process.env.ADMIN_USERNAME || 'admin';
  const validPass = process.env.ADMIN_PASSWORD || 'hers123';
  return username === validUser && password === validPass;
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
export const SESSION_MAX_AGE_SECONDS = SESSION_HOURS * 60 * 60;
