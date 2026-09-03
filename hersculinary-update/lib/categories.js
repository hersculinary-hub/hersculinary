// lib/categories.js
import { nanoid } from 'nanoid';
import { getCollection, setCollection } from './store';

const KEY = 'categories';

/**
 * Category shape:
 * { id, name, subcategories: [ { id, name } ] }
 */

export async function listCategories() {
  const cats = await getCollection(KEY);
  return cats.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getCategory(id) {
  const cats = await getCollection(KEY);
  return cats.find((c) => c.id === id) || null;
}

export async function createCategory(name) {
  const cats = await getCollection(KEY);
  const cat = { id: nanoid(8), name: name.trim(), subcategories: [] };
  cats.push(cat);
  await setCollection(KEY, cats);
  return cat;
}

export async function updateCategory(id, name) {
  const cats = await getCollection(KEY);
  const idx = cats.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error('Kategori tidak ditemukan');
  cats[idx].name = name.trim();
  await setCollection(KEY, cats);
  return cats[idx];
}

export async function deleteCategory(id) {
  const cats = await getCollection(KEY);
  const next = cats.filter((c) => c.id !== id);
  await setCollection(KEY, next);
}

export async function addSubcategory(categoryId, name) {
  const cats = await getCollection(KEY);
  const cat = cats.find((c) => c.id === categoryId);
  if (!cat) throw new Error('Kategori tidak ditemukan');
  const sub = { id: nanoid(8), name: name.trim() };
  cat.subcategories = cat.subcategories || [];
  cat.subcategories.push(sub);
  await setCollection(KEY, cats);
  return sub;
}

export async function updateSubcategory(categoryId, subId, name) {
  const cats = await getCollection(KEY);
  const cat = cats.find((c) => c.id === categoryId);
  if (!cat) throw new Error('Kategori tidak ditemukan');
  const sub = (cat.subcategories || []).find((s) => s.id === subId);
  if (!sub) throw new Error('Sub kategori tidak ditemukan');
  sub.name = name.trim();
  await setCollection(KEY, cats);
  return sub;
}

export async function deleteSubcategory(categoryId, subId) {
  const cats = await getCollection(KEY);
  const cat = cats.find((c) => c.id === categoryId);
  if (!cat) throw new Error('Kategori tidak ditemukan');
  cat.subcategories = (cat.subcategories || []).filter((s) => s.id !== subId);
  await setCollection(KEY, cats);
}
