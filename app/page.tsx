'use client';

import { useState } from 'react';
import { useShop } from '@/components/ShopProvider';
import ProductCard from '@/components/ProductCard';
import Header from '@/components/Header';
import type { ShopProduct } from '@/lib/types';
import { SearchIcon, SearchX } from 'lucide-react';

export default function ShopHomePage() {
  const { shop, products } = useShop();
  const [search, setSearch] = useState('');

  const filtered: ShopProduct[] = products
    .filter((p) => p.is_active)
    .filter((p) =>
      search.length === 0 ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => a.display_order - b.display_order);

  const themeColor = shop.theme_color;
  const hasHero = !!shop.hero_image_url;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Header />

      <main className="pb-20">
        {/* Full Width Hero */}
        {hasHero ? (
          <div className="relative w-full h-[60vh] sm:h-[500px] mb-12">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={shop.hero_image_url} 
              alt={shop.hero_headline || shop.name} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="text-center px-4 max-w-3xl">
                <h2 className="text-3xl sm:text-5xl font-heading font-bold text-white mb-4 leading-tight">
                  {shop.hero_headline || `Welcome to ${shop.name}`}
                </h2>
                {shop.hero_cta && (
                  <button 
                    className="px-8 py-3 rounded-full text-sm font-bold mt-4 transition-transform active:scale-95"
                    style={{ backgroundColor: themeColor, color: '#fff' }}
                  >
                    {shop.hero_cta}
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-12" /> /* Spacer if no hero */
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main content area */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-heading font-bold text-slate-900">Featured Products</h2>
              <p className="text-sm text-slate-500 mt-1">Discover our latest collection</p>
            </div>

            {/* Search */}
            {products.length > 4 && (
              <div className="relative w-full sm:w-80">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon size={18} className="text-slate-400" />
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products…"
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-shadow"
                  style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
                />
              </div>
            )}
          </div>

          {/* Product Grid */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-3xl border border-slate-100">
              <SearchX size={48} className="text-slate-300 mb-4" strokeWidth={1} />
              <p className="text-base font-medium text-slate-600">
                {search ? `No results found for "${search}"` : 'No products available yet'}
              </p>
              <p className="text-sm text-slate-400 mt-1">Check back later for new arrivals.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {filtered.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  themeColor={themeColor}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
