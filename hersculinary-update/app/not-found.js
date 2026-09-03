import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-cream px-4 text-center">
      <span className="font-display text-6xl text-brandRed">404</span>
      <p className="text-brandBrown/70">Halaman atau produk yang kamu cari tidak ditemukan.</p>
      <Link href="/" className="btn-primary">
        Kembali ke Katalog
      </Link>
    </main>
  );
}
