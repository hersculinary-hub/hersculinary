'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const links = [
    { href: '/', label: 'Katalog' },
    { href: '/#kontak', label: 'Kontak' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur border-b border-brandBrown/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-display text-2xl text-brandRed">HerS</span>
          <span className="text-xs font-bold tracking-widest text-brandBrown/70">CULINARY</span>
        </Link>

        <nav className="hidden items-center gap-6 sm:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-bold text-brandBrown hover:text-brandRed">
              {l.label}
            </a>
          ))}
          <Link href="/admin" className="btn-secondary !px-4 !py-2 text-sm">
            Admin
          </Link>
        </nav>

        <button
          aria-label="Buka menu"
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-brandBrown/20 sm:hidden"
        >
          <span className="text-xl">{open ? '✕' : '☰'}</span>
        </button>
      </div>

      {open && (
        <div className="flex flex-col gap-1 border-t border-brandBrown/10 bg-cream px-4 py-3 sm:hidden">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="rounded-lg px-3 py-2 text-sm font-bold text-brandBrown hover:bg-brandGold/20">
              {l.label}
            </a>
          ))}
          <Link href="/admin" className="rounded-lg px-3 py-2 text-sm font-bold text-brandRed hover:bg-brandGold/20">
            Admin
          </Link>
        </div>
      )}
    </header>
  );
}
