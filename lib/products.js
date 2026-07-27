// lib/products.js
import { nanoid } from 'nanoid';
import { getCollection, setCollection } from './store';

const KEY = 'products';

/**
 * Product shape:
 * {
 *   id, name, description, price, imageUrl,
 *   categoryId, subcategoryId, stock, active, createdAt, updatedAt
 * }
 */

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
  const product = {
    id: nanoid(10),
    name: input.name?.trim() || 'Produk Tanpa Nama',
    description: input.description?.trim() || '',
    price: Number(input.price) || 0,
    imageUrl: input.imageUrl?.trim() || '',
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
  const updated = {
    ...existing,
    name: input.name?.trim() ?? existing.name,
    description: input.description?.trim() ?? existing.description,
    price: input.price !== undefined ? Number(input.price) : existing.price,
    imageUrl: input.imageUrl?.trim() ?? existing.imageUrl,
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

export async function deleteProduct(id) {
  const products = await getCollection(KEY);
  const next = products.filter((p) => p.id !== id);
  await setCollection(KEY, next);
}
