'use client';

import { useEffect, useMemo, useState } from 'react';
import { useShop } from '@/components/ShopProvider';
import ProductCard from '@/components/ProductCard';
import Header from '@/components/Header';
import type { ShopProduct } from '@/lib/types';
import { SearchIcon, SearchX, ShieldCheck, Truck, Coins, Sparkles, SlidersHorizontal, X } from 'lucide-react';

type SortBy = 'featured' | 'price_asc' | 'price_desc' | 'newest';
type Availability = 'all' | 'in_stock' | 'onramp' | 'crypto';

export default function ShopHomePage() {
  const { shop, products } = useShop();
  const [search, setSearch] = useState('');
  const [showStickyTools, setShowStickyTools] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>('featured');
  const [availability, setAvailability] = useState<Availability>('all');
  const [tokenFilter, setTokenFilter] = useState<string>('all');

  const activeProducts = useMemo(() => products.filter((p) => p.is_active), [products]);

  const tokenOptions = useMemo(() => {
    const set = new Set<string>();
    for (const p of activeProducts) {
      if (p.token) set.add(p.token);
    }
    return Array.from(set).sort();
  }, [activeProducts]);

  const filtered: ShopProduct[] = useMemo(() => {
    let out = activeProducts.filter((p) =>
      search.length === 0 ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(search.toLowerCase()),
    );

    if (availability === 'in_stock') {
      out = out.filter((p) => p.quantity_type === 'unlimited' || ((p.quantity_available ?? 0) - p.quantity_sold > 0));
    } else if (availability === 'onramp') {
      out = out.filter((p) => p.onramp);
    } else if (availability === 'crypto') {
      out = out.filter((p) => !p.onramp);
    }

    if (tokenFilter !== 'all') {
      out = out.filter((p) => p.token === tokenFilter);
    }

    if (sortBy === 'price_asc') {
      out = [...out].sort((a, b) => a.price_usd - b.price_usd);
    } else if (sortBy === 'price_desc') {
      out = [...out].sort((a, b) => b.price_usd - a.price_usd);
    } else if (sortBy === 'newest') {
      out = [...out].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
    } else {
      out = [...out].sort((a, b) => a.display_order - b.display_order);
    }

    return out;
  }, [activeProducts, availability, search, sortBy, tokenFilter]);

  const themeColor = shop.theme_color;
  const hasHero = !!shop.hero_image_url;
  const heroFit = shop.hero_image_fit || 'cover';
  const heroPosition = shop.hero_image_position || 'center';
  const activeFilterCount = Number(sortBy !== 'featured') + Number(availability !== 'all') + Number(tokenFilter !== 'all');

  useEffect(() => {
    const onScroll = () => setShowStickyTools(window.scrollY > 520);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem('zendfi_recently_viewed');
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as string[];
      if (Array.isArray(parsed)) {
        setRecentlyViewedIds(parsed.filter((id) => typeof id === 'string').slice(0, 12));
      }
    } catch {
      // ignore malformed local storage value
    }
  }, []);

  const recentlyViewed = useMemo(
    () => recentlyViewedIds
      .map((id) => products.find((p) => p.id === id && p.is_active))
      .filter((p): p is ShopProduct => !!p)
      .slice(0, 8),
    [products, recentlyViewedIds],
  );

  const focusSearch = () => {
    const searchInput = document.getElementById('product-search') as HTMLInputElement | null;
    searchInput?.focus();
    searchInput?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="min-h-screen font-sans">
      <Header />

      {showMobileFilters && (
        <div className="fixed inset-0 z-50 sm:hidden" onClick={() => setShowMobileFilters(false)}>
          <div className="absolute inset-0 bg-slate-900/35 backdrop-blur-sm" />
          <div
            className="absolute left-0 right-0 bottom-0 rounded-t-3xl bg-white border-t border-slate-200 p-4 max-h-[78dvh] overflow-y-auto"
            style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-heading font-bold text-slate-900">Sort & Filters</h3>
              <button onClick={() => setShowMobileFilters(false)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Sort</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Featured', value: 'featured' as SortBy },
                    { label: 'Newest', value: 'newest' as SortBy },
                    { label: 'Price: Low to High', value: 'price_asc' as SortBy },
                    { label: 'Price: High to Low', value: 'price_desc' as SortBy },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSortBy(opt.value)}
                      className={`text-left px-3 py-2 rounded-xl text-xs font-semibold border ${sortBy === opt.value ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Availability</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'All', value: 'all' as Availability },
                    { label: 'In Stock', value: 'in_stock' as Availability },
                    { label: 'Fiat', value: 'onramp' as Availability },
                    { label: 'Crypto', value: 'crypto' as Availability },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setAvailability(opt.value)}
                      className={`text-left px-3 py-2 rounded-xl text-xs font-semibold border ${availability === opt.value ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Token</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setTokenFilter('all')}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${tokenFilter === 'all' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200'}`}
                  >
                    All tokens
                  </button>
                  {tokenOptions.map((token) => (
                    <button
                      key={token}
                      onClick={() => setTokenFilter(token)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${tokenFilter === token ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200'}`}
                    >
                      {token}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => {
                  setSortBy('featured');
                  setAvailability('all');
                  setTokenFilter('all');
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
              >
                Reset
              </button>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white"
                style={{ backgroundColor: themeColor }}
              >
                Apply ({filtered.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {showStickyTools && (
        <div className="sm:hidden fixed top-[74px] left-0 right-0 z-30 px-4" style={{ paddingTop: 'max(env(safe-area-inset-top), 0px)' }}>
          <div className="mx-auto max-w-7xl rounded-full bg-white/92 backdrop-blur-xl border border-slate-200 shadow-[0_10px_24px_rgba(15,23,42,0.12)] px-3 py-2 flex items-center justify-between gap-3">
            <button
              onClick={focusSearch}
              className="flex items-center gap-2 text-xs font-semibold text-slate-700"
            >
              <SearchIcon size={14} className="text-slate-500" />
              Search products
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowMobileFilters(true)}
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 border border-slate-200 rounded-full px-2.5 py-1"
              >
                <SlidersHorizontal size={12} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-slate-900 text-white text-[10px] inline-flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <span className="text-[11px] font-semibold text-slate-500">{filtered.length}</span>
            </div>
          </div>
        </div>
      )}

      <main className="pb-20 pt-2 sm:pt-5">
        <section className="w-full reveal-up">
          <div className="relative w-full h-[64svh] min-h-[460px] sm:h-[620px] overflow-hidden">
            {hasHero ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={shop.hero_image_url}
                  alt={shop.hero_headline || shop.name}
                  className="w-full h-full"
                  style={{ objectFit: heroFit, objectPosition: heroPosition }}
                />
              </>
            ) : (
              <div className="absolute inset-0" style={{ backgroundColor: themeColor }} />
            )}

            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/72 via-slate-900/42 to-slate-900/20" />
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
                      className="inline-flex mt-6 px-6 py-3 rounded-full text-sm font-bold text-slate-900 transition-transform active:scale-95 bg-white w-full sm:w-auto justify-center"
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

        {recentlyViewed.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:hidden">
            <div className="surface-card rounded-3xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={14} className="text-slate-500" />
                <h3 className="text-sm font-heading font-bold text-slate-900">Recently Viewed</h3>
              </div>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 snap-scroll">
                {recentlyViewed.map((product) => (
                  <div key={product.id} className="min-w-[70%] snap-start">
                    <ProductCard
                      product={product}
                      themeColor={themeColor}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 sm:mt-14 reveal-up reveal-up-delay">
          <div className="surface-card rounded-3xl p-5 sm:p-7">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-7 gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900">Featured Products</h2>
                <p className="text-sm text-slate-500 mt-1">Discover hand-picked items from this catalog.</p>
              </div>

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

              <button
                onClick={() => setShowMobileFilters(true)}
                className="sm:hidden inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700"
              >
                <SlidersHorizontal size={14} />
                Sort & Filter
                {activeFilterCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-slate-900 text-white text-[10px] inline-flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
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
              <div className="grid grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
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
