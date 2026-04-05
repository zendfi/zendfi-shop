'use client';

import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { useShop } from '@/components/ShopProvider';
import { useBag } from '@/lib/useBag';
import ProductCard from '@/components/ProductCard';
import AboutModal from '@/components/AboutModal';
import type { ShopProduct } from '@/lib/types';

type PaymentFilter = 'all' | 'onramp' | 'crypto';
type AvailabilityFilter = 'all' | 'in-stock' | 'limited';
type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'newest';

const HERO_FOCUS_MAP: Record<string, string> = {
  center: 'center',
  top: 'top',
  bottom: 'bottom',
  left: 'left',
  right: 'right',
  'top left': 'left top',
  'top right': 'right top',
  'bottom left': 'left bottom',
  'bottom right': 'right bottom',
};

const normalizeHeroFocus = (value?: string | null) => {
  const normalized = (value || 'center').toLowerCase().replace(/[_-]+/g, ' ');
  return HERO_FOCUS_MAP[normalized] || 'center';
};

const normalizeHeroScale = (value?: string | null) => {
  const normalized = (value || 'cover').toLowerCase();
  return normalized === 'contain' ? 'contain' : 'cover';
};

export default function ShopHomePage() {
  const { shop, products } = useShop();
  const [search, setSearch] = useState('');
  const [showAbout, setShowAbout] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const openBag = useBag((s) => s.openBag);
  const totalItems = useBag((s) => s.totalItems());

  useEffect(() => {
    const updateScroll = () => setIsScrolled(window.scrollY > 24);
    updateScroll();
    window.addEventListener('scroll', updateScroll, { passive: true });
    return () => window.removeEventListener('scroll', updateScroll);
  }, []);

  const isInStock = (product: ShopProduct) =>
    product.quantity_type !== 'limited'
    || ((product.quantity_available ?? 0) - product.quantity_sold) > 0;

  const filtered: ShopProduct[] = products
    .filter((p) => p.is_active)
    .filter((p) =>
      search.length === 0 ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(search.toLowerCase()),
    )
    .filter((p) => (
      paymentFilter === 'all'
        ? true
        : paymentFilter === 'onramp'
          ? p.onramp
          : !p.onramp
    ))
    .filter((p) => (
      availabilityFilter === 'all'
        ? true
        : availabilityFilter === 'limited'
          ? p.quantity_type === 'limited'
          : isInStock(p)
    ));

  const sorted: ShopProduct[] = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.price_usd - b.price_usd;
      case 'price-desc':
        return b.price_usd - a.price_usd;
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      default:
        return a.display_order - b.display_order;
    }
  });

  const themeColor = shop.theme_color;
  const heroKicker = shop.merchant_name || shop.name;
  const heroTitle = shop.welcome_message || shop.name;
  const heroSubtitle = shop.description || shop.about || '';
  const heroImageUrl = shop.hero_image_url || null;
  const heroBackgroundColor = shop.hero_background_color || themeColor;
  const heroBackgroundPosition = normalizeHeroFocus(shop.hero_image_focus);
  const heroBackgroundSize = normalizeHeroScale(shop.hero_image_scaling);
  const hasAboutInfo = !!(
    shop.about || shop.contact_email || shop.twitter_url || shop.facebook_url || shop.instagram_url ||
    shop.shop_location || shop.can_deliver_nationwide || shop.is_24_hours
  );

  const paymentOptions = [
    { value: 'all', label: 'All payments' },
    { value: 'crypto', label: 'On-chain' },
    { value: 'onramp', label: 'Bank transfer' },
  ] as const;

  const availabilityOptions = [
    { value: 'all', label: 'All availability' },
    { value: 'in-stock', label: 'In stock' },
    { value: 'limited', label: 'Limited run' },
  ] as const;

  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'price-asc', label: 'Price: Low to high' },
    { value: 'price-desc', label: 'Price: High to low' },
    { value: 'newest', label: 'Newest' },
  ] as const;

  const featureItems = [
    {
      title: 'Secure checkout',
      description: 'Protected payment links',
      icon: 'verified_user',
    },
    {
      title: 'Fast fulfillment',
      description: 'Reliable delivery options',
      icon: 'local_shipping',
    },
    {
      title: 'Flexible pay',
      description: 'Fiat and crypto accepted',
      icon: 'payments',
    },
  ] as const;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#2B3437]">
      {showAbout && <AboutModal shop={shop} onClose={() => setShowAbout(false)} />}

      {/* Header */}
      <header className={`fixed left-0 right-0 z-40 transition-all duration-300 ${isScrolled ? 'top-4' : 'top-0'}`}>
        <div className={`transition-all duration-300 ${isScrolled ? 'mx-auto max-w-6xl px-4 sm:px-6' : 'w-full  px-0'}`}>
          <div
            className={`flex items-center justify-between transition-all duration-300 ${isScrolled
                ? 'bg-white/85 backdrop-blur border border-slate-200/70 rounded-full shadow-sm px-4 sm:px-6 py-2.5'
                : 'bg-white/70 backdrop-blur border-b border-slate-200/60 py-3'
              }`}
          >
            <div className={`mx-auto w-full max-w-6xl flex items-center ${isScrolled ? 'px-0' : 'px-4 sm:px-6'} justify-between transition-all duration-300`}>

              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center border border-slate-200 bg-white"
                  style={{ color: themeColor }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>storefront</span>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">{shop.slug}</p>
                  <h1 className="font-semibold text-sm text-slate-900 truncate tracking-[-0.02em]">
                    {shop.name}
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="#filters"
                  className="w-9 h-9 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-300 transition"
                  aria-label="Sort and filter"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>tune</span>
                </a>
                {hasAboutInfo && (
                  <button
                    onClick={() => setShowAbout(true)}
                    className="w-9 h-9 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-300 transition"
                    aria-label="About"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>info</span>
                  </button>
                )}
                <button
                  onClick={openBag}
                  className="relative flex items-center justify-center w-9 h-9 rounded-full border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 transition"
                  aria-label="Open bag"
                >
                  <span className="material-symbols-outlined text-slate-700" style={{ fontSize: 18 }}>shopping_bag</span>
                  {totalItems > 0 && (
                    <span
                      className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-white text-[10px] font-semibold flex items-center justify-center"
                      style={{ backgroundColor: themeColor }}
                    >
                      {totalItems}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="pb-16">
        {/* Hero */}
        <section className="relative overflow-hidden min-h-[360px] md:min-h-[480px]">
          <div
            className="absolute inset-0"
            style={heroImageUrl
              ? {
                backgroundImage: `url(${heroImageUrl})`,
                backgroundSize: heroBackgroundSize,
                backgroundPosition: heroBackgroundPosition,
                backgroundRepeat: 'no-repeat',
              }
              : { backgroundColor: heroBackgroundColor }}
          />
          <div
            className="absolute inset-0"
            style={heroImageUrl
              ? { background: 'linear-gradient(110deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0.05) 100%)' }
              : { background: `linear-gradient(120deg, ${heroBackgroundColor} 0%, ${heroBackgroundColor}cc 55%, ${heroBackgroundColor}99 100%)` }}
          />
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-28 md:pt-32 pb-20 md:pb-24 text-white">
            <div className="max-w-2xl space-y-5 animate-fade-up">
              <p className="text-[11px] uppercase tracking-[0.32em] text-white/80">
                {heroKicker}
              </p>
              <h2 className="text-3xl md:text-5xl font-bold tracking-[-0.04em] leading-tight">
                {heroTitle}
              </h2>
              {heroSubtitle && (
                <p className="text-sm md:text-base text-white/80 leading-relaxed">
                  {heroSubtitle}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="#shop"
                  className="px-5 py-2.5 rounded text-xs font-semibold text-white border border-white/30 bg-white/10 hover:bg-white/20 transition"
                >
                  Shop the selection
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Feature highlights */}
        <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 -mt-10 md:-mt-12">
          <div className="grid gap-3 md:grid-cols-3">
            {featureItems.map((item) => (
              <div key={item.title} className="bg-white rounded-2xl border border-slate-200/70 px-4 py-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <span
                    className="material-symbols-outlined text-slate-500"
                    style={{ fontSize: 20 }}
                  >
                    {item.icon}
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-slate-900 uppercase tracking-[0.16em]">
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-500">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10">
          {/* Sort & Filter */}
          <section id="filters" className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Featured products</p>
                <h3 className="text-2xl font-semibold text-slate-900 tracking-[-0.03em]">
                  A focused edit of what matters now.
                </h3>
              </div>
              {products.length > 4 && (
                <button
                  onClick={() => setFiltersOpen((open) => !open)}
                  className="md:hidden px-3 py-2 rounded-full border border-slate-200 text-xs font-semibold text-slate-600 hover:border-slate-300 transition"
                >
                  Sort & Filter
                </button>
              )}
            </div>

            {products.length > 4 && (
              <div className={`${filtersOpen ? 'block' : 'hidden'} md:block space-y-4 rounded-2xl border border-slate-200/70 bg-white/70 backdrop-blur px-4 py-4`}>
                <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                  <div className="relative flex-1">
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
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition"
                      style={{ '--tw-ring-color': themeColor } as CSSProperties}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Sort</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="text-xs font-semibold text-slate-600 border border-slate-200 rounded-full px-3 py-2 bg-white"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Payment</span>
                    {paymentOptions.map((option) => {
                      const isActive = paymentFilter === option.value;
                      return (
                        <button
                          key={option.value}
                          onClick={() => setPaymentFilter(option.value)}
                          className={`px-3 py-1.5 rounded-full border text-[11px] font-semibold transition ${isActive ? 'text-white' : 'text-slate-600 bg-white hover:border-slate-300'}`}
                          style={isActive ? { backgroundColor: themeColor, borderColor: themeColor } : {}}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Availability</span>
                    {availabilityOptions.map((option) => {
                      const isActive = availabilityFilter === option.value;
                      return (
                        <button
                          key={option.value}
                          onClick={() => setAvailabilityFilter(option.value)}
                          className={`px-3 py-1.5 rounded-full border text-[11px] font-semibold transition ${isActive ? 'text-white' : 'text-slate-600 bg-white hover:border-slate-300'}`}
                          style={isActive ? { backgroundColor: themeColor, borderColor: themeColor } : {}}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Catalog */}
          <section id="shop" className="space-y-6 pt-8">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
                {sorted.length} items
              </span>
              {products.length > 4 && (
                <button
                  onClick={() => setFiltersOpen((open) => !open)}
                  className="hidden md:inline-flex px-3 py-2 rounded-full border border-slate-200 text-xs font-semibold text-slate-600 hover:border-slate-300 transition"
                >
                  Sort & Filter
                </button>
              )}
            </div>

            {sorted.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className="material-symbols-outlined text-slate-200" style={{ fontSize: 48 }}>search_off</span>
                <p className="text-sm text-slate-400 mt-2">
                  {search ? `No results for "${search}"` : 'No products available'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {sorted.map((product, index) => (
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
        </div>

      </main>
    </div>
  );
}
