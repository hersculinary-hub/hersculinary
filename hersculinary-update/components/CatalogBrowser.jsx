'use client';

import { useMemo, useState } from 'react';
import ProductCard from './ProductCard';

export default function CatalogBrowser({ categories, products }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSub, setActiveSub] = useState('all');
  const [query, setQuery] = useState('');

  const categoryById = useMemo(() => {
    const map = {};
    categories.forEach((c) => (map[c.id] = c));
    return map;
  }, [categories]);

  const activeCategoryObj = activeCategory === 'all' ? null : categoryById[activeCategory];

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (!p.active) return false;
      if (activeCategory !== 'all' && p.categoryId !== activeCategory) return false;
      if (activeSub !== 'all' && p.subcategoryId !== activeSub) return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [products, activeCategory, activeSub, query]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-col gap-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari produk, misal: nugget, kopi susu..."
          className="input-field max-w-md"
        />

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setActiveCategory('all');
              setActiveSub('all');
            }}
            className={`ribbon ${activeCategory === 'all' ? '' : 'opacity-50'}`}
          >
            Semua
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setActiveCategory(c.id);
                setActiveSub('all');
              }}
              className={`ribbon ${activeCategory === c.id ? '' : 'opacity-50'}`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {activeCategoryObj && activeCategoryObj.subcategories?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveSub('all')}
              className={`ribbon ribbon-gold !py-1 !text-xs ${activeSub === 'all' ? '' : 'opacity-50'}`}
            >
              Semua {activeCategoryObj.name}
            </button>
            {activeCategoryObj.subcategories.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSub(s.id)}
                className={`ribbon ribbon-gold !py-1 !text-xs ${activeSub === s.id ? '' : 'opacity-50'}`}
              >
                {s.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-brandBrown/20 p-12 text-center text-brandBrown/60">
          Belum ada produk yang cocok. Coba kata kunci atau kategori lain.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} categoryName={categoryById[p.categoryId]?.name} />
          ))}
        </div>
      )}
    </section>
  );
}
