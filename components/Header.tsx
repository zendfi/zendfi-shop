'use client';

import { useShop } from '@/components/ShopProvider';
import { useBag } from '@/lib/useBag';
import { ShoppingBag, Search, Info } from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import AboutModal from '@/components/AboutModal';

export default function Header() {
  const { shop } = useShop();
  const pathname = usePathname();
  const openBag = useBag((s) => s.openBag);
  const totalItems = useBag((s) => s.totalItems());
  const [showAbout, setShowAbout] = useState(false);
  const [isPastHero, setIsPastHero] = useState(false);
  const isHeroOverlay = pathname === '/';
  const useSolidHeader = !isHeroOverlay || isPastHero;

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

  useEffect(() => {
    if (!isHeroOverlay) {
      setIsPastHero(false);
      return;
    }

    const evaluateScroll = () => {
      const hero = document.getElementById('shop-hero');
      if (!hero) {
        setIsPastHero(window.scrollY > 80);
        return;
      }
      const threshold = Math.max(hero.offsetHeight - 96, 80);
      setIsPastHero(window.scrollY >= threshold);
    };

    evaluateScroll();
    window.addEventListener('scroll', evaluateScroll, { passive: true });
    window.addEventListener('resize', evaluateScroll);

    return () => {
      window.removeEventListener('scroll', evaluateScroll);
      window.removeEventListener('resize', evaluateScroll);
    };
  }, [isHeroOverlay]);

  return (
    <>
      {showAbout && <AboutModal shop={shop} onClose={() => setShowAbout(false)} />}

      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-300 ${useSolidHeader ? 'border-b border-slate-200 bg-white' : 'border-b border-transparent bg-transparent'}`}
        style={{ paddingTop: 'max(env(safe-area-inset-top), 0px)' }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="h-[60px] sm:h-[64px] flex items-center justify-between">
            <div className="flex items-center min-w-0">
              <h1 className={`font-heading font-bold text-base sm:text-lg tracking-tight truncate transition-colors duration-300 ${useSolidHeader ? 'text-slate-900' : 'text-white'}`}>{shop.name}</h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={focusSearch}
              className={`p-2 transition-colors duration-300 ${useSolidHeader ? 'text-slate-600 hover:text-slate-900' : 'text-white/90 hover:text-white'}`}
              aria-label="Search products"
            >
              <Search size={20} strokeWidth={1.5} />
            </button>
            {hasAboutInfo && (
              <button 
                onClick={() => setShowAbout(true)}
                className={`p-2 transition-colors duration-300 ${useSolidHeader ? 'text-slate-600 hover:text-slate-900' : 'text-white/90 hover:text-white'}`}
                aria-label="About store"
              >
                <Info size={20} strokeWidth={1.5} />
              </button>
            )}
            <button 
              onClick={openBag}
              className={`relative p-2 transition-colors duration-300 ${useSolidHeader ? 'text-slate-600 hover:text-slate-900' : 'text-white/90 hover:text-white'}`}
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
