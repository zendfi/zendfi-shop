'use client';

import { useState } from 'react';
import { useShop } from '@/components/ShopProvider';
import { useBag } from '@/lib/useBag';
import ProductCard from '@/components/ProductCard';
import type { ShopProduct } from '@/lib/types';

export default function ShopHomePage() {
  const { shop, products } = useShop();
  const [search, setSearch] = useState('');
  const openBag = useBag((s) => s.openBag);
  const totalItems = useBag((s) => s.totalItems());

  const filtered: ShopProduct[] = products
    .filter((p) => p.is_active)
    .filter((p) =>
      search.length === 0 ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => a.display_order - b.display_order);

  const themeColor = shop.theme_color;

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      {/* Floating Capsule Header */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-lg z-30 bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-2xl shadow-lg shadow-slate-100/50">
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: themeColor + '20', color: themeColor }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>storefront</span>
            </div>
            <h1 className="font-bold text-slate-900 text-sm truncate">{shop.name}</h1>
          </div>
          {/* Bag button */}
          <button
            onClick={openBag}
            className="relative flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 transition"
          >
            <span className="material-symbols-outlined text-slate-700" style={{ fontSize: 18 }}>shopping_bag</span>
            {totalItems > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
                style={{ backgroundColor: themeColor }}
              >
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-24 pb-10">
        {/* Search */}
        {products.length > 4 && (
          <div className="relative mb-5">
            <span
              className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              style={{ fontSize: 18 }}
            >
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition"
              style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
            />
          </div>
        )}

        {/* Product Grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="material-symbols-outlined text-slate-200" style={{ fontSize: 48 }}>search_off</span>
            <p className="text-sm text-slate-400 mt-2">
              {search ? `No results for "${search}"` : 'No products available'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                themeColor={themeColor}
              />
            ))}
          </div>
        )}
      </main>

      {/* Powered by Zendfi */}
      <footer className="py-8 text-center">
        <a
          href="https://zendfi.tech"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition"
        >
          <span>Powered by</span>
          <span className="font-bold text-slate-500">Zendfi</span>
        </a>
      </footer>
    </div>
  );
}
