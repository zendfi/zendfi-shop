'use client';

import { useState } from 'react';
import { useShop } from '@/components/ShopProvider';
import ProductCard from '@/components/ProductCard';
import Header from '@/components/Header';
import type { ShopProduct } from '@/lib/types';
import { SearchIcon, SearchX, ShieldCheck, Truck, Coins } from 'lucide-react';

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
    <div className="min-h-screen font-sans">
      <Header />

      <main className="pb-20 pt-3 sm:pt-5">
        <section className="w-full reveal-up">
          <div className="relative w-full h-[58vh] sm:h-[620px] overflow-hidden">
            {hasHero ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={shop.hero_image_url}
                  alt={shop.hero_headline || shop.name}
                  className="w-full h-full object-cover"
                />
              </>
            ) : (
              <div className="absolute inset-0" style={{ backgroundColor: themeColor }} />
            )}

            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-slate-900/35 to-slate-900/15" />
            <div className="absolute inset-0 flex items-end sm:items-center">
              <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl pb-8 sm:pb-0">
                  {shop.welcome_message && (
                    <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.28em] text-white/75 mb-3">
                      {shop.welcome_message}
                    </p>
                  )}
                  <h2 className="text-3xl sm:text-5xl font-heading font-bold text-white leading-tight">
                    {shop.hero_headline || `Welcome to ${shop.name}`}
                  </h2>
                  {shop.description && (
                    <p className="text-sm sm:text-base text-white/80 mt-4 max-w-2xl leading-relaxed">
                      {shop.description}
                    </p>
                  )}
                  {shop.hero_cta && (
                    <a
                      href="#products"
                      className="inline-flex mt-6 px-6 py-3 rounded-full text-sm font-bold text-slate-900 transition-transform active:scale-95 bg-white"
                    >
                      {shop.hero_cta}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
            <div className="surface-card rounded-3xl grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 p-4 sm:p-5 border border-slate-200/70">
              <div className="rounded-2xl bg-white border border-slate-200 px-4 py-3 flex items-center gap-3">
                <ShieldCheck size={18} className="text-slate-500" />
                <div>
                  <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Secure checkout</p>
                  <p className="text-xs text-slate-500">Protected payment links</p>
                </div>
              </div>
              <div className="rounded-2xl bg-white border border-slate-200 px-4 py-3 flex items-center gap-3">
                <Truck size={18} className="text-slate-500" />
                <div>
                  <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Fast fulfillment</p>
                  <p className="text-xs text-slate-500">Reliable delivery options</p>
                </div>
              </div>
              <div className="rounded-2xl bg-white border border-slate-200 px-4 py-3 flex items-center gap-3">
                <Coins size={18} className="text-slate-500" />
                <div>
                  <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Flexible pay</p>
                  <p className="text-xs text-slate-500">Fiat and crypto accepted</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 sm:mt-14 reveal-up reveal-up-delay">
          <div className="surface-card rounded-3xl p-5 sm:p-7">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-7 gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900">Featured Products</h2>
                <p className="text-sm text-slate-500 mt-1">Discover hand-picked items from this catalog.</p>
              </div>

              {products.length > 4 && (
                <div className="relative w-full sm:w-80">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon size={18} className="text-slate-400" />
                  </div>
                  <input
                    id="product-search"
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search products..."
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-shadow"
                    style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
                  />
                </div>
              )}
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-3xl border border-slate-100">
                <SearchX size={48} className="text-slate-300 mb-4" strokeWidth={1} />
                <p className="text-base font-medium text-slate-600">
                  {search ? `No results found for "${search}"` : 'No products available yet'}
                </p>
                <p className="text-sm text-slate-400 mt-1">Check back later for new arrivals.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
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
        </section>
      </main>
    </div>
  );
}
