'use client';

import { useEffect, useState } from 'react';
import AdminShell from '@/components/AdminShell';
import { generateInvoicePdf } from '@/lib/pdfInvoice';

const formatIDR = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n || 0);

const RANGES = [
  { value: 'today', label: 'Hari Ini' },
  { value: '7d', label: '7 Hari' },
  { value: '30d', label: '30 Hari' },
  { value: 'all', label: 'Semua' }
];

function SummaryCard({ label, value, accent }) {
  return (
    <div className="card p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-brandBrown/50">{label}</p>
      <p className={`mt-1 font-display text-2xl ${accent || 'text-brandBrown'}`}>{value}</p>
    </div>
  );
}

function DailyBarChart({ data }) {
  if (!data || data.length === 0) {
    return <p className="text-sm text-brandBrown/50">Belum ada transaksi pada rentang ini.</p>;
  }
  const max = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <div className="flex h-48 items-end gap-2 overflow-x-auto pb-2">
      {data.map((d) => (
        <div key={d.date} className="flex min-w-[36px] flex-1 flex-col items-center gap-1">
          <div
            className="w-full rounded-t-md bg-brandRed transition-all"
            style={{ height: `${Math.max((d.revenue / max) * 100, 3)}%` }}
            title={`${d.date}: ${formatIDR(d.revenue)}`}
          />
          <span className="text-[10px] text-brandBrown/50">{d.date.slice(5)}</span>
        </div>
      ))}
    </div>
  );
}

function TopProductsList({ data }) {
  if (!data || data.length === 0) {
    return <p className="text-sm text-brandBrown/50">Belum ada produk terjual pada rentang ini.</p>;
  }
  const max = Math.max(...data.map((d) => d.qty), 1);

  return (
    <div className="flex flex-col gap-3">
      {data.map((p) => (
        <div key={p.productName}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-semibold text-brandBrown">{p.productName}</span>
            <span className="text-brandBrown/60">{p.qty} terjual</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-creamDeep">
            <div
              className="h-full rounded-full bg-brandGold"
              style={{ width: `${Math.max((p.qty / max) * 100, 4)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function LaporanPage() {
  const [range, setRange] = useState('7d');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/reports?range=${range}`)
      .then((r) => r.json())
      .then((d) => setReport(d.report || null))
      .finally(() => setLoading(false));
  }, [range]);

  return (
    <AdminShell title="Laporan Keuangan">
      <div className="mb-5 flex flex-wrap gap-2">
        {RANGES.map((r) => (
          <button
            key={r.value}
            onClick={() => setRange(r.value)}
            className={`rounded-full px-4 py-2 text-sm font-bold transition ${
              range === r.value ? 'bg-brandRed text-white' : 'bg-white text-brandBrown/70 hover:bg-creamDeep'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {loading || !report ? (
        <p className="text-brandBrown/60">Memuat laporan...</p>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard label="Total Penjualan" value={formatIDR(report.revenue)} accent="text-brandRed" />
            <SummaryCard label="Total Modal (Vendor)" value={formatIDR(report.cost)} />
            <SummaryCard label="Estimasi Keuntungan" value={formatIDR(report.profit)} accent="text-brandGreen" />
            <SummaryCard label="Jumlah Transaksi" value={report.transactionCount} />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="card p-5 lg:col-span-2">
              <h3 className="mb-4 font-display text-lg text-brandBrown">Tren Penjualan</h3>
              <DailyBarChart data={report.dailySales} />
            </div>
            <div className="card p-5">
              <h3 className="mb-4 font-display text-lg text-brandBrown">Produk Terlaris</h3>
              <TopProductsList data={report.topProducts} />
            </div>
          </div>

          {report.byPaymentMethod.length > 0 && (
            <div className="card p-5">
              <h3 className="mb-4 font-display text-lg text-brandBrown">Rincian Metode Pembayaran</h3>
              <div className="flex flex-wrap gap-4">
                {report.byPaymentMethod.map((m) => (
                  <div key={m.method} className="rounded-xl bg-creamDeep px-4 py-2">
                    <p className="text-xs font-bold text-brandBrown/60">{m.method}</p>
                    <p className="font-display text-lg text-brandBrown">{formatIDR(m.total)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card overflow-x-auto p-0">
            <div className="flex items-center justify-between px-5 pt-5">
              <h3 className="font-display text-lg text-brandBrown">Transaksi Terbaru</h3>
              <span className="text-xs text-brandBrown/50">Menampilkan maks. 50 transaksi terakhir</span>
            </div>
            {report.transactions.length === 0 ? (
              <p className="p-5 text-sm text-brandBrown/50">Belum ada transaksi.</p>
            ) : (
              <table className="mt-3 w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-brandBrown/10 text-xs uppercase tracking-wide text-brandBrown/50">
                    <th className="px-5 py-3">No. Invoice</th>
                    <th className="px-5 py-3">Tanggal</th>
                    <th className="px-5 py-3">Pelanggan</th>
                    <th className="px-5 py-3">Metode</th>
                    <th className="px-5 py-3 text-right">Total</th>
                    <th className="px-5 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {report.transactions.map((inv) => (
                    <tr key={inv.id} className="border-b border-brandBrown/5 last:border-0">
                      <td className="px-5 py-3 font-semibold text-brandBrown">{inv.invoiceNumber}</td>
                      <td className="px-5 py-3 text-brandBrown/70">
                        {new Date(inv.createdAt).toLocaleString('id-ID')}
                      </td>
                      <td className="px-5 py-3 text-brandBrown/70">{inv.customerName}</td>
                      <td className="px-5 py-3 text-brandBrown/70">{inv.paymentMethod}</td>
                      <td className="px-5 py-3 text-right font-bold text-brandRed">{formatIDR(inv.total)}</td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => generateInvoicePdf(inv)}
                          className="rounded-full border border-brandBrown/20 px-3 py-1.5 text-xs font-bold text-brandBrown hover:bg-cream"
                        >
                          Unduh PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </AdminShell>
  );
}
