'use client';

import { useState } from 'react';

export default function ProductGallery({ images, alt }) {
  const list = images && images.length > 0 ? images : [];
  const [active, setActive] = useState(0);

  if (list.length === 0) {
    return (
      <div className="aspect-square overflow-hidden rounded-2xl bg-creamDeep shadow-card">
        <div className="flex h-full w-full items-center justify-center text-6xl">🍽️</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="aspect-square overflow-hidden rounded-2xl bg-creamDeep shadow-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={list[active]} alt={alt} className="h-full w-full object-cover" />
      </div>

      {list.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {list.map((url, index) => (
            <button
              key={url + index}
              type="button"
              onClick={() => setActive(index)}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                active === index ? 'border-brandRed' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`${alt} ${index + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
