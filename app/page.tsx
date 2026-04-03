'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';
import { useShop } from '@/components/ShopProvider';
import { useBag } from '@/lib/useBag';
import ProductCard from '@/components/ProductCard';
import AboutModal from '@/components/AboutModal';
import type { ShopProduct } from '@/lib/types';

export default function ShopHomePage() {
  const { shop, products } = useShop();
  const [search, setSearch] = useState('');
  const [showAbout, setShowAbout] = useState(false);
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
  const heroKicker = shop.merchant_name || shop.name;
  const heroTitle = shop.welcome_message || shop.name;
  const heroSubtitle = shop.description || shop.about || '';
  const hasAboutInfo = !!(
    shop.about || shop.contact_email || shop.twitter_url || shop.facebook_url || shop.instagram_url ||
    shop.shop_location || shop.can_deliver_nationwide || shop.is_24_hours
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#2B3437]">
      {showAbout && <AboutModal shop={shop} onClose={() => setShowAbout(false)} />}

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-slate-200/60 bg-white/70 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-6">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-9 h-9 rounded flex items-center justify-center border border-slate-200 bg-white"
              style={{ color: themeColor }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>storefront</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{shop.slug}</p>
              <h1 className="font-semibold text-sm text-slate-900 truncate tracking-[-0.02em]">
                {shop.name}
              </h1>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs uppercase tracking-[0.24em] text-slate-500">
            <a href="#shop" className="hover:text-slate-900 transition">Shop</a>
            {hasAboutInfo && (
              <button
                onClick={() => setShowAbout(true)}
                className="hover:text-slate-900 transition"
              >
                ABOUT
              </button>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {hasAboutInfo && (
              <button
                onClick={() => setShowAbout(true)}
                className="md:hidden text-xs uppercase tracking-[0.2em] text-slate-500 hover:text-slate-900 transition"
              >
                About
              </button>
            )}
            <button
              onClick={openBag}
              className="relative flex items-center justify-center w-10 h-10 rounded border border-slate-200 bg-white hover:bg-slate-50 transition"
            >
              <span className="material-symbols-outlined text-slate-700" style={{ fontSize: 18 }}>shopping_bag</span>
              {totalItems > 0 && (
                <span
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded text-white text-[10px] font-semibold flex items-center justify-center"
                  style={{ backgroundColor: themeColor }}
                >
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
        {products.length > 4 && (
          <div className="px-4 sm:px-6 pb-3 md:hidden">
            <div className="relative">
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
                placeholder="Search products"
                className="w-full pl-9 pr-4 py-2.5 rounded bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition"
                style={{ '--tw-ring-color': themeColor } as CSSProperties}
              />
            </div>
          </div>
        )}
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 pt-28 md:pt-24">
        {/* Hero */}
        <section className="pt-6 md:pt-10 pb-12 md:pb-14">
          <div className="relative max-w-2xl mx-auto text-center space-y-6 animate-fade-up">
            {/* <div
              className="absolute -inset-6 rounded"
              style={{ backgroundImage: `radial-gradient(circle at 50% 20%, ${themeColor}1f, transparent 60%)` }}
            /> */}
            <div className="relative space-y-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                {heroKicker}
              </p>
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-[-0.04em] leading-tight">
                {heroTitle}
              </h2>
              {heroSubtitle && (
                <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                  {heroSubtitle}
                </p>
              )}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <a
                  href="#shop"
                  className="px-5 py-2.5 rounded text-xs font-semibold text-white transition active:scale-[0.98]"
                  style={{ backgroundColor: themeColor }}
                >
                  Shop the selection
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Search */}
        {products.length > 4 && (
          <div className="relative mb-6 max-w-md hidden md:block">
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
              placeholder="Search products"
              className="w-full pl-9 pr-4 py-2.5 rounded bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition"
              style={{ '--tw-ring-color': themeColor } as CSSProperties}
            />
          </div>
        )}

        {/* Curated Selection */}
        <section id="shop" className="space-y-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Curated selection</p>
              <h3 className="text-2xl font-semibold text-slate-900 tracking-[-0.03em]">
                A focused edit of what matters now.
              </h3>
            </div>
            <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
              {filtered.length} items
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="material-symbols-outlined text-slate-200" style={{ fontSize: 48 }}>search_off</span>
              <p className="text-sm text-slate-400 mt-2">
                {search ? `No results for "${search}"` : 'No products available'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((product, index) => (
                <div
                  key={product.id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${Math.min(index * 70, 280)}ms` }}
                >
                  <ProductCard
                    product={product}
                    themeColor={themeColor}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
