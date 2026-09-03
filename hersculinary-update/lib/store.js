// lib/store.js
//
// Simple JSON-document data layer.
// - On Vercel (or anywhere KV_REST_API_URL/KV_REST_API_TOKEN are set) it uses
//   Vercel KV / Upstash Redis so data persists across serverless invocations
//   and is shared by every visitor and device.
// - Locally, when those env vars are not set, it falls back to a JSON file on
//   disk (.data/db.json) purely so `npm run dev` works out of the box.
//
// Every "collection" (categories, products, invoices) is stored as ONE JSON
// array under a single key. That's plenty for a catalog with up to a few
// thousand products and keeps the CRUD code trivial.

import fs from 'fs';
import path from 'path';

const USE_KV = !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;

let kv;
if (USE_KV) {
  // Lazy require so local dev without the env vars never even touches @vercel/kv
  // eslint-disable-next-line global-require
  kv = require('@vercel/kv').kv;
}

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'db.json');

function readLocalFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({}, null, 2));
  }
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  try {
    return JSON.parse(raw || '{}');
  } catch {
    return {};
  }
}

function writeLocalFile(data) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

/** Get a whole collection (array). Returns [] if not set yet. */
export async function getCollection(key) {
  if (USE_KV) {
    const value = await kv.get(key);
    return value || [];
  }
  const data = readLocalFile();
  return data[key] || [];
}

/** Overwrite a whole collection with a new array. */
export async function setCollection(key, value) {
  if (USE_KV) {
    await kv.set(key, value);
    return;
  }
  const data = readLocalFile();
  data[key] = value;
  writeLocalFile(data);
}

export const isUsingKv = USE_KV;
