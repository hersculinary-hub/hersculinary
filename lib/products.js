// lib/products.js
import { nanoid } from 'nanoid';
import { getCollection, setCollection } from './store';

const KEY = 'products';

/**
 * Product shape:
 * {
 *   id, name, description, price, imageUrl, images,
 *   vendorPrice, vendorName,
 *   categoryId, subcategoryId, stock, active, createdAt, updatedAt
 * }
 *
 * - `images` is the array of ALL photo URLs (multi-foto). `imageUrl` is kept
 *   in sync as images[0] for backward compatibility with older code/pages
 *   that only ever read a single imageUrl (e.g. katalog card, POS grid).
 * - `vendorPrice` (harga asal dari vendor) and `vendorName` (nama vendor) are
 *   admin-only cost data. They are NEVER sent to the public catalog — see
 *   sanitizePublicProduct() below, used by the public products API.
 */

function normalizeImages(input, existingImages) {
  if (Array.isArray(input.images)) {
    return input.images.map((u) => String(u).trim()).filter(Boolean);
  }
  if (input.imageUrl !== undefined) {
    const single = input.imageUrl?.trim();
    return single ? [single] : [];
  }
  return existingImages || [];
}

export async function listProducts() {
  const products = await getCollection(KEY);
  return products.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export async function getProduct(id) {
  const products = await getCollection(KEY);
  return products.find((p) => p.id === id) || null;
}

export async function createProduct(input) {
  const products = await getCollection(KEY);
  const now = Date.now();
  const images = normalizeImages(input, []);
  const product = {
    id: nanoid(10),
    name: input.name?.trim() || 'Produk Tanpa Nama',
    description: input.description?.trim() || '',
    price: Number(input.price) || 0,
    vendorPrice: Number(input.vendorPrice) || 0,
    vendorName: input.vendorName?.trim() || '',
    images,
    imageUrl: images[0] || '',
    categoryId: input.categoryId || null,
    subcategoryId: input.subcategoryId || null,
    stock: Number.isFinite(Number(input.stock)) ? Number(input.stock) : 0,
    active: input.active !== false,
    createdAt: now,
    updatedAt: now
  };
  products.push(product);
  await setCollection(KEY, products);
  return product;
}

export async function updateProduct(id, input) {
  const products = await getCollection(KEY);
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error('Produk tidak ditemukan');
  const existing = products[idx];
  const images = normalizeImages(input, existing.images);
  const updated = {
    ...existing,
    name: input.name?.trim() ?? existing.name,
    description: input.description?.trim() ?? existing.description,
    price: input.price !== undefined ? Number(input.price) : existing.price,
    vendorPrice: input.vendorPrice !== undefined ? Number(input.vendorPrice) || 0 : existing.vendorPrice || 0,
    vendorName: input.vendorName !== undefined ? input.vendorName?.trim() || '' : existing.vendorName || '',
    images,
    imageUrl: images[0] || '',
    categoryId: input.categoryId ?? existing.categoryId,
    subcategoryId: input.subcategoryId ?? existing.subcategoryId,
    stock: input.stock !== undefined ? Number(input.stock) : existing.stock,
    active: input.active !== undefined ? !!input.active : existing.active,
    updatedAt: Date.now()
  };
  products[idx] = updated;
  await setCollection(KEY, products);
  return updated;
}

/**
 * Strips admin-only cost fields before a product is sent to a non-logged-in
 * visitor. Used by the public products API — the katalog/produk pages never
 * go through that API (they call listProducts()/getProduct() directly and
 * only ever render `price`), but /api/products is reachable by anyone, so it
 * must never leak vendorPrice/vendorName.
 */
export function sanitizePublicProduct(product) {
  const { vendorPrice, vendorName, ...publicFields } = product;
  return publicFields;
}

export async function deleteProduct(id) {
  const products = await getCollection(KEY);
  const next = products.filter((p) => p.id !== id);
  await setCollection(KEY, next);
}
