'use client';

import { useShop } from '@/components/ShopProvider';
import { useBag } from '@/lib/useBag';
import { ShoppingBag, Search, Info } from 'lucide-react';
import { useState } from 'react';
import AboutModal from '@/components/AboutModal';

export default function Header() {
  const { shop } = useShop();
  const openBag = useBag((s) => s.openBag);
  const totalItems = useBag((s) => s.totalItems());
  const [showAbout, setShowAbout] = useState(false);

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

      <header className="sticky top-3 z-40 px-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="h-[64px] rounded-full bg-white/88 backdrop-blur-xl border border-white shadow-[0_12px_34px_rgba(15,23,42,0.14)] px-4 sm:px-6 flex items-center justify-between">
            <div className="flex items-center min-w-0">
              <h1 className="font-heading font-bold text-base sm:text-lg text-slate-900 tracking-tight truncate">{shop.name}</h1>
            </div>

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
        </div>
      </header>
    </>
  );
}
