'use client';
import { useRouter } from 'next/navigation';

export default function PosShell({ children, title }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-30 flex items-center justify-between bg-brandRedDark px-4 py-3 text-white">
        <span className="font-display text-2xl">
          HerS <span className="text-brandGold">Kasir</span>
        </span>
        <div className="flex items-center gap-3">
          <button onClick={handleLogout} className="text-sm font-bold text-white/85 hover:underline">
            🚪 Keluar
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {title && <h1 className="mb-6 font-display text-2xl text-brandBrown sm:text-3xl">{title}</h1>}
        {children}
      </main>
    </div>
  );
}
