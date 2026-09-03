'use client';

import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/admin/products', label: 'Produk', icon: '🍱' },
  { href: '/admin/categories', label: 'Kategori', icon: '🗂️' },
  { href: '/pos', label: 'Kasir (POS)', icon: '🧾' },
  { href: '/laporan', label: 'Laporan Keuangan', icon: '📊' },
  { href: '/', label: 'Lihat Katalog', icon: '🌐' }
];

function areaForPath(pathname) {
  if (pathname.startsWith('/admin')) return 'admin';
  if (pathname.startsWith('/pos')) return 'pos';
  if (pathname.startsWith('/laporan')) return 'laporan';
  return 'admin';
}

const AREA_LABELS = {
  admin: 'Admin',
  pos: 'Kasir',
  laporan: 'Laporan'
};

// Menu antar-area sengaja pakai <a> biasa (bukan next/link) supaya SETIAP
// klik memicu permintaan penuh ke server dan wajib lewat middleware.js lagi.
// Kalau pakai next/link, Next.js kadang menampilkan halaman dari cache
// navigasi di browser tanpa mengecek ulang ke server -- itu sebabnya Kasir /
// Laporan Keuangan bisa "kebuka" tanpa diminta password lagi.
function NavLink({ href, icon, label, active, className }) {
  return (
    <a href={href} className={className}>
      <span className="mr-2">{icon}</span>
      {label}
    </a>
  );
}

export default function AdminShell({ children, title }) {
  const pathname = usePathname();
  const area = areaForPath(pathname);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    // Full navigation juga di sini, untuk alasan yang sama seperti di atas.
    window.location.href = `/login?area=${area}`;
  }

  return (
    <div className="min-h-screen bg-cream md:flex">
      <aside className="sticky top-0 z-30 flex items-center justify-between bg-brandRedDark px-4 py-3 text-white md:h-screen md:w-60 md:flex-col md:items-stretch md:justify-start md:py-6">
        <a href="/admin/products" className="font-display text-2xl">
          HerS <span className="text-brandGold">Admin</span>
        </a>

        <p className="hidden text-[11px] font-bold uppercase tracking-widest text-white/50 md:mt-4 md:block">
          Buka menu lain = keluar dari {AREA_LABELS[area]}
        </p>

        <nav className="hidden gap-1 md:mt-3 md:flex md:flex-1 md:flex-col">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              className={`rounded-lg px-3 py-2.5 text-sm font-bold transition ${
                pathname === item.href ? 'bg-white text-brandRedDark' : 'text-white/85 hover:bg-white/10'
              }`}
            />
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="hidden rounded-lg px-3 py-2.5 text-left text-sm font-bold text-white/85 hover:bg-white/10 md:block"
        >
          🚪 Keluar
        </button>

        <button onClick={handleLogout} className="text-sm font-bold md:hidden">
          Keluar
        </button>
      </aside>

      <div className="flex-1">
        <div className="flex gap-1 overflow-x-auto border-b border-brandBrown/10 bg-white px-2 py-2 md:hidden">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-bold ${
                pathname === item.href ? 'bg-brandRed text-white' : 'text-brandBrown/70'
              }`}
            />
          ))}
        </div>

        <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
          {title && <h1 className="mb-6 font-display text-2xl text-brandBrown sm:text-3xl">{title}</h1>}
          {children}
        </main>
      </div>
    </div>
  );
}
