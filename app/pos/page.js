'use client';

import { useEffect, useMemo, useState } from 'react';
import PosShell from '@/components/PosShell';   // ganti dari AdminShell
import { generateInvoicePdf } from '@/lib/pdfInvoice';

const formatIDR = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n || 0);

export default function PosPage() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [cashierName, setCashierName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Tunai');
  const [discount, setDiscount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [lastInvoice, setLastInvoice] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((d) => setProducts((d.products || []).filter((p) => p.active)));
  }, []);

  const filteredProducts = useMemo(() => {
    if (!query.trim()) return products;
    const q = query.trim().toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, query]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const total = Math.max(subtotal - (Number(discount) || 0), 0);

  function addToCart(product) {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) => (i.productId === product.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, qty: 1 }];
    });
  }

  function updateQty(productId, qty) {
    const q = Math.max(1, Number(qty) || 1);
    setCart((prev) => prev.map((i) => (i.productId === productId ? { ...i, qty: q } : i)));
  }

  function removeFromCart(productId) {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  }

  function resetTransaction() {
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setDiscount(0);
    setLastInvoice(null);
  }

  async function handleCheckout() {
    setError('');
    if (cart.length === 0) {
      setError('Keranjang masih kosong.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map((i) => ({ productName: i.name, price: i.price, qty: i.qty })),
          discount: Number(discount) || 0,
          customerName,
          customerPhone,
          cashierName,
          paymentMethod
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Gagal membuat invoice.');
        setSaving(false);
        return;
      }
      setLastInvoice(data.invoice);
      await generateInvoicePdf(data.invoice);
      setSaving(false);
    } catch {
      setError('Terjadi kesalahan jaringan.');
      setSaving(false);
    }
  }

  return (
    <AdminShell title="Kasir (POS)">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <input
            className="input-field mb-4"
            placeholder="Cari produk..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {filteredProducts.map((p) => (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                className="card flex flex-col items-start gap-1 p-3 text-left hover:ring-2 hover:ring-brandRed"
              >
                <div className="h-20 w-full overflow-hidden rounded-lg bg-creamDeep">
                  {p.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl">🍽️</div>
                  )}
                </div>
                <span className="line-clamp-1 text-sm font-bold text-brandBrown">{p.name}</span>
                <span className="text-sm font-bold text-brandRed">{formatIDR(p.price)}</span>
              </button>
            ))}
            {filteredProducts.length === 0 && (
              <p className="col-span-full text-sm text-brandBrown/50">Produk tidak ditemukan.</p>
            )}
          </div>
        </div>

        <div className="card flex h-fit flex-col gap-4 p-5">
          <h3 className="font-display text-lg text-brandBrown">Keranjang</h3>

          {cart.length === 0 ? (
            <p className="text-sm text-brandBrown/50">Belum ada item. Klik produk di sebelah kiri untuk menambah.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {cart.map((item) => (
                <div key={item.productId} className="flex items-center justify-between gap-2 text-sm">
                  <div className="flex-1">
                    <p className="font-semibold text-brandBrown">{item.name}</p>
                    <p className="text-xs text-brandBrown/50">{formatIDR(item.price)}</p>
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={item.qty}
                    onChange={(e) => updateQty(item.productId, e.target.value)}
                    className="w-14 rounded-lg border border-brandBrown/20 px-2 py-1 text-center"
                  />
                  <button onClick={() => removeFromCart(item.productId)} className="text-brandRed">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <hr className="border-brandBrown/10" />

          <div className="flex flex-col gap-2">
            <input
              className="input-field !py-2 text-sm"
              placeholder="Nama pelanggan (opsional)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
            <input
              className="input-field !py-2 text-sm"
              placeholder="No. WhatsApp pelanggan (opsional)"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
            <input
              className="input-field !py-2 text-sm"
              placeholder="Nama kasir (opsional)"
              value={cashierName}
              onChange={(e) => setCashierName(e.target.value)}
            />
            <select
              className="input-field !py-2 text-sm"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option>Tunai</option>
              <option>QRIS</option>
              <option>Transfer Bank</option>
              <option>Kartu Debit/Kredit</option>
            </select>
            <div>
              <label className="mb-1 block text-xs font-bold text-brandBrown">Diskon (Rp)</label>
              <input
                type="number"
                min="0"
                className="input-field !py-2 text-sm"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1 border-t border-brandBrown/10 pt-3 text-sm">
            <div className="flex justify-between text-brandBrown/70">
              <span>Subtotal</span>
              <span>{formatIDR(subtotal)}</span>
            </div>
            <div className="flex justify-between font-display text-xl text-brandRed">
              <span>Total</span>
              <span>{formatIDR(total)}</span>
            </div>
          </div>

          {error && <p className="text-sm font-semibold text-brandRed">{error}</p>}

          <button onClick={handleCheckout} disabled={saving} className="btn-primary w-full disabled:opacity-60">
            {saving ? 'Memproses...' : '🧾 Buat & Unduh Invoice (PDF)'}
          </button>

          {lastInvoice && (
            <div className="rounded-xl bg-brandGreen/10 p-3 text-sm text-brandGreen">
              <p className="font-bold">Invoice {lastInvoice.invoiceNumber} tersimpan.</p>
              <div className="mt-2 flex gap-2">
                <button onClick={() => generateInvoicePdf(lastInvoice)} className="btn-secondary !px-3 !py-1.5 text-xs">
                  Unduh Ulang PDF
                </button>
                <button onClick={resetTransaction} className="rounded-full border border-brandGreen px-3 py-1.5 text-xs font-bold">
                  Transaksi Baru
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
