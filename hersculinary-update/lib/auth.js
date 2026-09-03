// lib/auth.js
//
// Single-slot session: only ONE of the 3 areas (admin, pos, laporan) can be
// logged in at a time, in one shared cookie. The cookie's value encodes
// WHICH area it authorizes: `<area>.<expiresAt>.<hmacSignature>`.
//
// Logging in to a new area overwrites the cookie, which means it now
// authorizes the new area and no longer authorizes whichever area was open
// before — i.e. opening Kasir automatically closes Admin/Laporan, opening
// Admin automatically closes Kasir/Laporan, and so on, exactly as requested:
// only one of the three can be open by anyone at any given time.
//
// This file only uses Web Crypto (available in both the Edge runtime used by
// middleware.js and the Node runtime used by API routes) — it must NOT import
// next/headers or anything Node-only. See lib/auth-server.js for the
// Node-only helper used inside API routes.

export const AREAS = ['admin', 'pos', 'laporan'];

export const AREA_LABELS = {
  admin: 'Admin',
  pos: 'Kasir (POS)',
  laporan: 'Laporan Keuangan'
};

const SESSION_HOURS = 12;
export const SESSION_COOKIE_NAME = 'hers_session';
export const SESSION_MAX_AGE_SECONDS = SESSION_HOURS * 60 * 60;

export function isValidArea(area) {
  return AREAS.includes(area);
}

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

/** Creates the cookie value that authorizes exactly ONE area. */
export async function createSessionValue(area) {
  const expires = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
  const secret = getSecret();
  const payload = `${area}.${expires}`;
  const signature = await hmac(payload, secret);
  return `${payload}.${signature}`;
}

/**
 * Validates the cookie AND checks it authorizes `requiredArea` specifically.
 * A valid-but-different-area cookie (e.g. a Kasir session being used to try
 * to open Admin) is treated as NOT authorized for that area.
 */
export async function isSessionValid(cookieValue, requiredArea) {
  if (!cookieValue) return false;
  const parts = cookieValue.split('.');
  if (parts.length !== 3) return false;
  const [area, expiresStr, signature] = parts;
  if (!isValidArea(area) || area !== requiredArea) return false;
  const expires = Number(expiresStr);
  if (!Number.isFinite(expires) || expires < Date.now()) return false;
  try {
    const secret = getSecret();
    const expected = await hmac(`${area}.${expiresStr}`, secret);
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
