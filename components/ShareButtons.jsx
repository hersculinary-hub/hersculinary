'use client';

import { useEffect, useRef, useState } from 'react';

export default function ShareButtons({ productId, productName, price, compact = false }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  function getUrl() {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/produk/${productId}`;
  }

  function getText() {
    const priceText = price
      ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price)
      : '';
    return `${productName}${priceText ? ` — ${priceText}` : ''} di HerS Culinary`;
  }

  const shareTargets = [
    {
      label: 'WhatsApp',
      icon: '🟢',
      href: () => `https://wa.me/?text=${encodeURIComponent(`${getText()}\n${getUrl()}`)}`
    },
    {
      label: 'Facebook',
      icon: '🔵',
      href: () => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getUrl())}`
    },
    {
      label: 'X / Twitter',
      icon: '⚫',
      href: () => `https://twitter.com/intent/tweet?text=${encodeURIComponent(getText())}&url=${encodeURIComponent(getUrl())}`
    }
  ];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(getUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard API unavailable — ignore silently
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={
          compact
            ? 'flex h-9 w-9 items-center justify-center rounded-full bg-white text-brandRed shadow-card hover:bg-brandGold/20'
            : 'flex items-center gap-2 rounded-full border-2 border-brandRed px-4 py-2 text-sm font-bold text-brandRed hover:bg-brandRed hover:text-white'
        }
        aria-label="Bagikan produk ini"
      >
        <span>↗</span>
        {!compact && <span>Bagikan</span>}
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-52 rounded-xl border border-brandBrown/10 bg-white p-2 shadow-card">
          {shareTargets.map((t) => (
            <a
              key={t.label}
              href={t.href()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-brandBrown hover:bg-cream"
              onClick={() => setOpen(false)}
            >
              <span>{t.icon}</span> {t.label}
            </a>
          ))}
          <button
            type="button"
            onClick={copyLink}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-brandBrown hover:bg-cream"
          >
            <span>🔗</span> {copied ? 'Tautan disalin!' : 'Salin tautan'}
          </button>
        </div>
      )}
    </div>
  );
}
