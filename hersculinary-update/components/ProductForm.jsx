'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const formatIDR = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n || 0);

export default function ProductForm({ initialProduct }) {
  const router = useRouter();
  const isEdit = !!initialProduct;

  const initialImages =
    initialProduct?.images && initialProduct.images.length > 0
      ? initialProduct.images
      : initialProduct?.imageUrl
      ? [initialProduct.imageUrl]
      : [];

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: initialProduct?.name || '',
    description: initialProduct?.description || '',
    price: initialProduct?.price ?? '',
    vendorPrice: initialProduct?.vendorPrice ?? '',
    vendorName: initialProduct?.vendorName || '',
    stock: initialProduct?.stock ?? 0,
    images: initialImages,
    categoryId: initialProduct?.categoryId || '',
    subcategoryId: initialProduct?.subcategoryId || '',
    active: initialProduct?.active ?? true
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [showUrlField, setShowUrlField] = useState(false);
  const [manualUrl, setManualUrl] = useState('');

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []));
  }, []);

  const activeCategory = categories.find((c) => c.id === form.categoryId);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function addImage(url) {
    setForm((f) => ({ ...f, images: [...f.images, url] }));
  }

  function removeImage(index) {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== index) }));
  }

  function makeMainImage(index) {
    setForm((f) => {
      const next = [...f.images];
      const [chosen] = next.splice(index, 1);
      next.unshift(chosen);
      return { ...f, images: next };
    });
  }

  async function handleFilesChange(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploadError('');
    setUploading(true);

    for (const file of files) {
      const body = new FormData();
      body.append('file', file);
      try {
        const res = await fetch('/api/upload', { method: 'POST', body });
        const data = await res.json();
        if (!res.ok) {
          setUploadError(data.error || `Gagal mengunggah "${file.name}".`);
          continue;
        }
        addImage(data.url);
      } catch {
        setUploadError('Terjadi kesalahan jaringan saat mengunggah foto.');
      }
    }

    setUploading(false);
    e.target.value = '';
  }

  function handleAddManualUrl() {
    const url = manualUrl.trim();
    if (!url) return;
    addImage(url);
    setManualUrl('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) return setError('Nama produk wajib diisi.');
    if (!form.categoryId) return setError('Pilih kategori terlebih dahulu.');
    if (form.price === '' || Number(form.price) < 0) return setError('Harga jual tidak valid.');

    setSaving(true);
    const payload = {
      ...form,
      price: Number(form.price),
      vendorPrice: Number(form.vendorPrice) || 0,
      stock: Number(form.stock)
    };
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

  const margin = Number(form.price) - Number(form.vendorPrice || 0);
  const marginPct = Number(form.vendorPrice) > 0 ? (margin / Number(form.vendorPrice)) * 100 : null;

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

      {/* Harga jual vs harga vendor -------------------------------------- */}
      <div className="rounded-xl border border-brandGold/40 bg-brandGold/5 p-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-brandBrown/50">
          Harga &amp; Modal (data vendor hanya terlihat oleh admin)
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-bold text-brandBrown">Harga Jual (Rp)</label>
            <input
              type="number"
              min="0"
              className="input-field"
              value={form.price}
              onChange={(e) => update('price', e.target.value)}
              required
            />
            <p className="mt-1 text-[11px] text-brandBrown/50">Ini yang tampil ke pelanggan.</p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold text-brandBrown">Harga Asal dari Vendor (Rp)</label>
            <input
              type="number"
              min="0"
              className="input-field"
              value={form.vendorPrice}
              onChange={(e) => update('vendorPrice', e.target.value)}
              placeholder="0"
            />
            <p className="mt-1 text-[11px] text-brandBrown/50">Tidak pernah ditampilkan ke publik.</p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold text-brandBrown">Nama Vendor</label>
            <input
              className="input-field"
              value={form.vendorName}
              onChange={(e) => update('vendorName', e.target.value)}
              placeholder="Misal: CV Sumber Rejeki"
            />
          </div>
        </div>

        {Number(form.price) > 0 && (
          <p className="mt-3 text-sm font-bold text-brandGreen">
            Estimasi margin: {formatIDR(margin)}
            {marginPct !== null && ` (${marginPct.toFixed(0)}%)`}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
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

      {/* Multi-foto -------------------------------------------------------- */}
      <div>
        <label className="mb-1 block text-sm font-bold text-brandBrown">Foto Produk (bisa lebih dari satu)</label>

        {form.images.length > 0 && (
          <div className="mb-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
            {form.images.map((url, index) => (
              <div key={url + index} className="group relative aspect-square overflow-hidden rounded-lg shadow-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Foto ${index + 1}`} className="h-full w-full object-cover" />
                {index === 0 && (
                  <span className="absolute left-1 top-1 rounded-full bg-brandRed px-2 py-0.5 text-[10px] font-bold text-white">
                    Utama
                  </span>
                )}
                <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/50 opacity-0 transition group-hover:opacity-100">
                  {index !== 0 && (
                    <button
                      type="button"
                      onClick={() => makeMainImage(index)}
                      className="rounded-full bg-white px-2 py-1 text-[10px] font-bold text-brandBrown"
                    >
                      Jadikan Utama
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="rounded-full bg-brandRed px-2 py-1 text-[10px] font-bold text-white"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <label className="btn-secondary inline-flex cursor-pointer !py-2.5 text-sm">
          {uploading ? 'Mengunggah...' : '📷 Tambah Foto dari HP/Komputer'}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFilesChange}
            disabled={uploading}
            multiple
            className="hidden"
          />
        </label>

        {uploadError && <p className="mt-2 text-sm font-semibold text-brandRed">{uploadError}</p>}

        <button
          type="button"
          onClick={() => setShowUrlField((v) => !v)}
          className="mt-2 block text-xs font-semibold text-brandBrown/50 hover:text-brandBrown"
        >
          {showUrlField ? '▲ Sembunyikan tempel URL manual' : '▾ Atau, tempel URL gambar secara manual'}
        </button>

        {showUrlField && (
          <div className="mt-2 flex gap-2">
            <input
              className="input-field"
              placeholder="https://..."
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
            />
            <button type="button" onClick={handleAddManualUrl} className="btn-secondary !px-4 !py-2.5 text-sm">
              Tambah
            </button>
          </div>
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
