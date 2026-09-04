'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const AREA_LABELS = {
  admin: 'Admin',
  pos: 'Kasir (POS)',
  laporan: 'Laporan Keuangan'
};

const AREA_DEFAULT_PATH = {
  admin: '/admin',
  pos: '/pos',
  laporan: '/laporan'
};

function LoginForm() {
  const searchParams = useSearchParams();

  const areaParam = searchParams.get('area');
  const area = AREA_LABELS[areaParam] ? areaParam : 'admin';
  const areaLabel = AREA_LABELS[area];

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, area })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Gagal masuk.');
        setLoading(false);
        return;
      }
      const next = searchParams.get('next') || AREA_DEFAULT_PATH[area];
      window.location.href = next;
    } catch {
      setError('Terjadi kesalahan jaringan.');
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="card w-full max-w-sm p-8">
        <div className="mb-6 text-center">
          <span className="font-display text-3xl text-brandRed">HerS</span>
          <p className="text-xs font-bold tracking-widest text-brandBrown/60">
            MASUK KE {areaLabel.toUpperCase()}
          </p>
          <p className="mt-2 text-xs text-brandBrown/50">
            Masuk ke sini akan menutup akses ke halaman lain (Admin/Kasir/Laporan) yang mungkin sedang terbuka.
            Hanya satu bagian yang bisa terbuka dalam satu waktu.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-bold text-brandBrown">Username</label>
            <input
              className="input-field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold text-brandBrown">Password</label>
            <input
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-sm font-semibold text-brandRed">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary mt-2 w-full disabled:opacity-60">
            {loading ? 'Memproses...' : `Masuk ke ${areaLabel}`}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
