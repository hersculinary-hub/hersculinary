'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProductForm({ initialProduct }) {
  const router = useRouter();
  const isEdit = !!initialProduct;

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: initialProduct?.name || '',
    description: initialProduct?.description || '',
    price: initialProduct?.price ?? '',
    stock: initialProduct?.stock ?? 0,
    imageUrl: initialProduct?.imageUrl || '',
    categoryId: initialProduct?.categoryId || '',
    subcategoryId: initialProduct?.subcategoryId || '',
    active: initialProduct?.active ?? true
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [showUrlField, setShowUrlField] = useState(false);

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []));
  }, []);

  const activeCategory = categories.find((c) => c.id === form.categoryId);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    setUploading(true);

    const body = new FormData();
    body.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error || 'Gagal mengunggah foto.');
        setUploading(false);
        return;
      }
      update('imageUrl', data.url);
      setUploading(false);
    } catch {
      setUploadError('Terjadi kesalahan jaringan saat mengunggah foto.');
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) return setError('Nama produk wajib diisi.');
    if (!form.categoryId) return setError('Pilih kategori terlebih dahulu.');
    if (form.price === '' || Number(form.price) < 0) return setError('Harga tidak valid.');

    setSaving(true);
    const payload = { ...form, price: Number(form.price), stock: Number(form.stock) };
    const url = isEdit ? `/api/products/${initialProduct.id}` : '/api/products';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Gagal menyimpan produk.');
        setSaving(false);
        return;
      }
      router.push('/admin/products');
      router.refresh();
    } catch {
      setError('Terjadi kesalahan jaringan.');
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card flex flex-col gap-5 p-6">
      {error && <p className="rounded-lg bg-brandRed/10 px-3 py-2 text-sm font-semibold text-brandRed">{error}</p>}

      <div>
        <label className="mb-1 block text-sm font-bold text-brandBrown">Nama Produk</label>
        <input className="input-field" value={form.name} onChange={(e) => update('name', e.target.value)} required />
      </div>

      <div>
        <label className="mb-1 block text-sm font-bold text-brandBrown">Deskripsi</label>
        <textarea
          className="input-field min-h-[90px]"
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-bold text-brandBrown">Harga (Rp)</label>
          <input
            type="number"
            min="0"
            className="input-field"
            value={form.price}
            onChange={(e) => update('price', e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-bold text-brandBrown">Stok</label>
          <input
            type="number"
            min="0"
            className="input-field"
            value={form.stock}
            onChange={(e) => update('stock', e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-bold text-brandBrown">Kategori</label>
          <select
            className="input-field"
            value={form.categoryId}
            onChange={(e) => {
              update('categoryId', e.target.value);
              update('subcategoryId', '');
            }}
            required
          >
            <option value="">Pilih kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-bold text-brandBrown">Sub Kategori (opsional)</label>
          <select
            className="input-field"
            value={form.subcategoryId}
            onChange={(e) => update('subcategoryId', e.target.value)}
            disabled={!activeCategory || activeCategory.subcategories.length === 0}
          >
            <option value="">— Tidak ada —</option>
            {activeCategory?.subcategories.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-bold text-brandBrown">Foto Produk</label>

        <div className="flex flex-wrap items-center gap-4">
          {form.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.imageUrl} alt="Preview" className="h-24 w-24 rounded-lg object-cover shadow-card" />
          )}

          <label className="btn-secondary cursor-pointer !py-2.5 text-sm">
            {uploading ? 'Mengunggah...' : form.imageUrl ? 'Ganti Foto' : '📷 Pilih Foto dari HP/Komputer'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
            />
          </label>

          {form.imageUrl && (
            <button
              type="button"
              onClick={() => update('imageUrl', '')}
              className="text-xs font-bold text-brandRed hover:underline"
            >
              Hapus Foto
            </button>
          )}
        </div>

        {uploadError && <p className="mt-2 text-sm font-semibold text-brandRed">{uploadError}</p>}

        <button
          type="button"
          onClick={() => setShowUrlField((v) => !v)}
          className="mt-2 text-xs font-semibold text-brandBrown/50 hover:text-brandBrown"
        >
          {showUrlField ? '▲ Sembunyikan tempel URL manual' : '▾ Atau, tempel URL gambar secara manual'}
        </button>

        {showUrlField && (
          <input
            className="input-field mt-2"
            placeholder="https://..."
            value={form.imageUrl}
            onChange={(e) => update('imageUrl', e.target.value)}
          />
        )}
      </div>

      <label className="flex items-center gap-2 text-sm font-bold text-brandBrown">
        <input type="checkbox" checked={form.active} onChange={(e) => update('active', e.target.checked)} />
        Tampilkan di katalog (aktif)
      </label>

      <div className="flex gap-3">
        <button type="submit" disabled={saving || uploading} className="btn-primary disabled:opacity-60">
          {saving ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Produk'}
        </button>
        <button type="button" onClick={() => router.push('/admin/products')} className="btn-secondary">
          Batal
        </button>
      </div>
    </form>
  );
}
