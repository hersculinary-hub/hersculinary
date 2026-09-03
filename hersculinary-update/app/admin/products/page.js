'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminShell from '@/components/AdminShell';
import ShareButtons from '@/components/ShareButtons';

const formatIDR = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n || 0);

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  async function loadData() {
    setLoading(true);
    const [pRes, cRes] = await Promise.all([fetch('/api/products'), fetch('/api/categories')]);
    const pData = await pRes.json();
    const cData = await cRes.json();
    setProducts(pData.products || []);
    setCategories(cData.categories || []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const categoryName = (id) => categories.find((c) => c.id === id)?.name || '—';

  async function handleDelete(id) {
    if (!confirm('Hapus produk ini? Tindakan tidak bisa dibatalkan.')) return;
    setDeletingId(id);
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setDeletingId(null);
  }

  return (
    <AdminShell title="Produk">
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-brandBrown/60">{products.length} produk terdaftar</p>
        <Link href="/admin/products/new" className="btn-primary !py-2 text-sm">
          + Tambah Produk
        </Link>
      </div>

      {loading ? (
        <p className="text-brandBrown/60">Memuat data...</p>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-brandBrown/20 p-10 text-center text-brandBrown/60">
          Belum ada produk. Klik "Tambah Produk" untuk mulai mengisi katalog.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-brandBrown/10 text-xs uppercase tracking-wide text-brandBrown/50">
                <th className="px-4 py-3">Produk</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Harga</th>
                <th className="px-4 py-3">Stok</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-brandBrown/5 last:border-0">
                  <td className="flex items-center gap-3 px-4 py-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-creamDeep">
                      {p.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">🍽️</div>
                      )}
                    </div>
                    <span className="font-bold text-brandBrown">{p.name}</span>
                  </td>
                  <td className="px-4 py-3 text-brandBrown/70">{categoryName(p.categoryId)}</td>
                  <td className="px-4 py-3 font-semibold text-brandRed">{formatIDR(p.price)}</td>
                  <td className="px-4 py-3">{p.stock}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                        p.active ? 'bg-brandGreen/15 text-brandGreen' : 'bg-brandBrown/10 text-brandBrown/50'
                      }`}
                    >
                      {p.active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <ShareButtons productId={p.id} productName={p.name} price={p.price} compact />
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="rounded-full border border-brandBrown/20 px-3 py-1.5 text-xs font-bold text-brandBrown hover:bg-cream"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id)}
                        disabled={deletingId === p.id}
                        className="rounded-full border border-brandRed px-3 py-1.5 text-xs font-bold text-brandRed hover:bg-brandRed hover:text-white disabled:opacity-50"
                      >
                        {deletingId === p.id ? '...' : 'Hapus'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}
