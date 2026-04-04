'use client';

import { useShop } from '@/components/ShopProvider';
import { useBag } from '@/lib/useBag';
import { ShoppingBag, Search, Menu, Info, X, Sparkles } from 'lucide-react';
import { useState } from 'react';
import AboutModal from '@/components/AboutModal';

export default function Header() {
  const { shop } = useShop();
  const openBag = useBag((s) => s.openBag);
  const totalItems = useBag((s) => s.totalItems());
  const [showAbout, setShowAbout] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);

  const themeColor = shop.theme_color;
  const hasAboutInfo = !!(
    shop.about || shop.contact_email || shop.twitter_url || shop.facebook_url || shop.instagram_url ||
    shop.shop_location || shop.can_deliver_nationwide || shop.is_24_hours
  );

  const focusSearch = () => {
    const searchInput = document.getElementById('product-search') as HTMLInputElement | null;
    searchInput?.focus();
    searchInput?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <>
      {showAbout && <AboutModal shop={shop} onClose={() => setShowAbout(false)} />}
      {showMobileNav && (
        <div className="fixed inset-0 z-50 sm:hidden" onClick={() => setShowMobileNav(false)}>
          <div className="absolute inset-0 bg-slate-900/35 backdrop-blur-sm" />
          <aside
            className="absolute inset-y-0 left-0 w-[82%] max-w-xs bg-white border-r border-slate-200 shadow-xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-heading text-lg font-bold text-slate-900">{shop.name}</h2>
              <button
                onClick={() => setShowMobileNav(false)}
                className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-2">
              <a
                href="#products"
                onClick={() => setShowMobileNav(false)}
                className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 bg-slate-50"
              >
                Browse products
              </a>
              <button
                onClick={() => {
                  setShowMobileNav(false);
                  focusSearch();
                }}
                className="w-full text-left rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700"
              >
                Search catalog
              </button>
              {hasAboutInfo && (
                <button
                  onClick={() => {
                    setShowMobileNav(false);
                    setShowAbout(true);
                  }}
                  className="w-full text-left rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700"
                >
                  About store
                </button>
              )}
            </div>
          </aside>
        </div>
      )}
      
      <header className="sticky top-0 z-40 bg-white/75 backdrop-blur-xl border-b border-white/70 shadow-[0_6px_26px_rgba(15,23,42,0.06)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[74px] flex items-center justify-between">
          {/* Mobile menu + Logo */}
          <div className="flex items-center gap-4 min-w-0">
            <button onClick={() => setShowMobileNav(true)} className="sm:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900">
              <Menu size={24} strokeWidth={1.5} />
            </button>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl text-white flex items-center justify-center shadow-float" style={{ backgroundColor: themeColor }}>
                <Sparkles size={16} />
              </div>
              <div className="flex flex-col min-w-0">
                <h1 className="font-heading font-bold text-lg sm:text-xl text-slate-900 tracking-tight truncate">{shop.name}</h1>
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-100 rounded-full px-3 py-1">
              Curated picks
            </div>
          </div>

          {shop.welcome_message && (
            <p className="hidden xl:block absolute left-1/2 -translate-x-1/2 text-xs text-slate-500 max-w-sm truncate">
              {shop.welcome_message}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={focusSearch}
              className="p-2 text-slate-600 hover:text-slate-900 hidden sm:block transition-colors"
              aria-label="Search products"
            >
              <Search size={20} strokeWidth={1.5} />
            </button>
            {hasAboutInfo && (
              <button 
                onClick={() => setShowAbout(true)}
                className="p-2 text-slate-600 hover:text-slate-900 transition-colors"
                aria-label="About store"
              >
                <Info size={20} strokeWidth={1.5} />
              </button>
            )}
            <button 
              onClick={openBag}
              className="relative p-2 text-slate-600 hover:text-slate-900 transition-colors"
              aria-label="Open bag"
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              {totalItems > 0 && (
                <span 
                  className="absolute top-1 right-1 min-w-4 h-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center translate-x-1/2 -translate-y-1/2 px-1"
                  style={{ backgroundColor: themeColor }}
                >
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-3 hidden sm:block">
          <nav className="flex items-center gap-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <a href="#products" className="hover:text-slate-900 transition-colors">All products</a>
            {hasAboutInfo && (
              <button onClick={() => setShowAbout(true)} className="hover:text-slate-900 transition-colors">
                Story & support
              </button>
            )}
          </nav>
        </div>
      </header>
    </>
  );
}
