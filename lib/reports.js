// lib/reports.js
//
// Turns the raw invoice list into the numbers shown on the Laporan Keuangan
// page: revenue, cost (harga vendor), profit, top-selling products, and a
// day-by-day trend. All of this is admin-only data — this file is only ever
// called from app/api/reports/route.js, which requires a valid session.

import { listInvoices } from './invoices';

function startOfDay(ts) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function rangeToDates(range) {
  const now = Date.now();
  const todayStart = startOfDay(now);
  const DAY = 24 * 60 * 60 * 1000;

  switch (range) {
    case 'today':
      return { from: todayStart, to: now };
    case '7d':
      return { from: todayStart - 6 * DAY, to: now };
    case '30d':
      return { from: todayStart - 29 * DAY, to: now };
    case 'all':
    default:
      return { from: 0, to: now };
  }
}

export async function getReport(range = '7d') {
  const { from, to } = rangeToDates(range);
  const invoices = await listInvoices();
  const filtered = invoices.filter((inv) => inv.createdAt >= from && inv.createdAt <= to);

  const revenue = filtered.reduce((sum, inv) => sum + (inv.total || 0), 0);
  const cost = filtered.reduce((sum, inv) => sum + (inv.totalCost || 0), 0);
  const profit = revenue - cost;
  const transactionCount = filtered.length;
  const avgTransaction = transactionCount ? revenue / transactionCount : 0;

  // Produk terlaris (berdasarkan jumlah terjual)
  const productMap = new Map();
  for (const inv of filtered) {
    for (const item of inv.items || []) {
      const key = item.productName || 'Tanpa nama';
      const cur = productMap.get(key) || { productName: key, qty: 0, revenue: 0 };
      cur.qty += item.qty || 0;
      cur.revenue += (item.price || 0) * (item.qty || 0);
      productMap.set(key, cur);
    }
  }
  const topProducts = Array.from(productMap.values())
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 8);

  // Tren penjualan harian
  const dayMap = new Map();
  for (const inv of filtered) {
    const dayKey = new Date(startOfDay(inv.createdAt)).toISOString().slice(0, 10);
    const cur = dayMap.get(dayKey) || { date: dayKey, revenue: 0, count: 0 };
    cur.revenue += inv.total || 0;
    cur.count += 1;
    dayMap.set(dayKey, cur);
  }
  const dailySales = Array.from(dayMap.values()).sort((a, b) => a.date.localeCompare(b.date));

  // Rincian metode pembayaran
  const paymentMap = new Map();
  for (const inv of filtered) {
    const key = inv.paymentMethod || 'Lainnya';
    paymentMap.set(key, (paymentMap.get(key) || 0) + (inv.total || 0));
  }
  const byPaymentMethod = Array.from(paymentMap.entries()).map(([method, total]) => ({ method, total }));

  return {
    range,
    from,
    to,
    revenue,
    cost,
    profit,
    transactionCount,
    avgTransaction,
    topProducts,
    dailySales,
    byPaymentMethod,
    // Transaksi terbaru dulu, dibatasi 50 baris untuk tabel
    transactions: filtered.slice(0, 50)
  };
}
