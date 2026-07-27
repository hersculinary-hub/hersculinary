'use client';

import { useEffect, useState } from 'react';
import AdminShell from '@/components/AdminShell';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [newSubName, setNewSubName] = useState({});
  const [editingSub, setEditingSub] = useState(null);

  async function loadCategories() {
    setLoading(true);
    const res = await fetch('/api/categories');
    const data = await res.json();
    setCategories(data.categories || []);
    setLoading(false);
  }

  useEffect(() => {
    loadCategories();
  }, []);

  async function handleAddCategory(e) {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCategoryName })
    });
    if (res.ok) {
      setNewCategoryName('');
      loadCategories();
    }
  }

  async function handleSaveCategory(id) {
    if (!editingCategoryName.trim()) return;
    await fetch(`/api/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editingCategoryName })
    });
    setEditingCategoryId(null);
    loadCategories();
  }

  async function handleDeleteCategory(id) {
    if (!confirm('Hapus kategori ini beserta semua sub kategorinya?')) return;
    await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    loadCategories();
  }

  async function handleAddSub(categoryId) {
    const name = newSubName[categoryId];
    if (!name || !name.trim()) return;
    await fetch(`/api/categories/${categoryId}/subcategories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    setNewSubName((prev) => ({ ...prev, [categoryId]: '' }));
    loadCategories();
  }

  async function handleSaveSub() {
    if (!editingSub?.name.trim()) return;
    await fetch(`/api/categories/${editingSub.categoryId}/subcategories/${editingSub.subId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editingSub.name })
    });
    setEditingSub(null);
    loadCategories();
  }

  async function handleDeleteSub(categoryId, subId) {
    if (!confirm('Hapus sub kategori ini?')) return;
    await fetch(`/api/categories/${categoryId}/subcategories/${subId}`, { method: 'DELETE' });
    loadCategories();
  }

  return (
    <AdminShell title="Kategori & Sub Kategori">
      <form onSubmit={handleAddCategory} className="card mb-6 flex flex-col gap-3 p-5 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="mb-1 block text-sm font-bold text-brandBrown">Nama Kategori Baru</label>
          <input
            className="input-field"
            placeholder="Misal: Frozen Food, Kopi"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-primary !py-2.5">
          + Tambah Kategori
        </button>
      </form>

      {loading ? (
        <p className="text-brandBrown/60">Memuat data...</p>
      ) : categories.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-brandBrown/20 p-10 text-center text-brandBrown/60">
          Belum ada kategori. Tambahkan kategori pertama di atas.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                {editingCategoryId === cat.id ? (
                  <input
                    className="input-field max-w-xs"
                    value={editingCategoryName}
                    onChange={(e) => setEditingCategoryName(e.target.value)}
                    autoFocus
                  />
                ) : (
                  <h3 className="font-display text-xl text-brandBrown">{cat.name}</h3>
                )}

                <div className="flex gap-2">
                  {editingCategoryId === cat.id ? (
                    <>
                      <button onClick={() => handleSaveCategory(cat.id)} className="btn-secondary !px-4 !py-1.5 text-xs">
                        Simpan
                      </button>
                      <button
                        onClick={() => setEditingCategoryId(null)}
                        className="rounded-full border border-brandBrown/20 px-4 py-1.5 text-xs font-bold text-brandBrown"
                      >
                        Batal
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingCategoryId(cat.id);
                          setEditingCategoryName(cat.name);
                        }}
                        className="rounded-full border border-brandBrown/20 px-4 py-1.5 text-xs font-bold text-brandBrown hover:bg-cream"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="rounded-full border border-brandRed px-4 py-1.5 text-xs font-bold text-brandRed hover:bg-brandRed hover:text-white"
                      >
                        Hapus
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-4 border-t border-brandBrown/10 pt-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-brandBrown/50">Sub Kategori</p>
                <div className="flex flex-wrap gap-2">
                  {(cat.subcategories || []).map((sub) => (
                    <div key={sub.id} className="flex items-center gap-1 rounded-full bg-cream px-3 py-1.5">
                      {editingSub?.subId === sub.id ? (
                        <input
                          className="w-24 border-b border-brandRed bg-transparent text-sm focus:outline-none"
                          value={editingSub.name}
                          onChange={(e) => setEditingSub({ ...editingSub, name: e.target.value })}
                          autoFocus
                        />
                      ) : (
                        <span className="text-sm font-semibold text-brandBrown">{sub.name}</span>
                      )}

                      {editingSub?.subId === sub.id ? (
                        <>
                          <button onClick={handleSaveSub} className="text-xs font-bold text-brandGreen">
                            ✓
                          </button>
                          <button onClick={() => setEditingSub(null)} className="text-xs font-bold text-brandBrown/50">
                            ✕
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setEditingSub({ categoryId: cat.id, subId: sub.id, name: sub.name })}
                            className="text-xs text-brandBrown/50 hover:text-brandBrown"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteSub(cat.id, sub.id)}
                            className="text-xs text-brandBrown/50 hover:text-brandRed"
                          >
                            🗑️
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex max-w-xs gap-2">
                  <input
                    className="input-field !py-1.5 text-sm"
                    placeholder="Tambah sub kategori..."
                    value={newSubName[cat.id] || ''}
                    onChange={(e) => setNewSubName((prev) => ({ ...prev, [cat.id]: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSub(cat.id))}
                  />
                  <button
                    onClick={() => handleAddSub(cat.id)}
                    className="shrink-0 rounded-xl bg-brandGold px-3 py-1.5 text-sm font-bold text-brandBrown"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
