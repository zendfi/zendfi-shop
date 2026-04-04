'use client';

import { useShop } from '@/components/ShopProvider';
import { useBag } from '@/lib/useBag';
import { ShoppingBag, Search, Menu, Info } from 'lucide-react';
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

  return (
    <>
      {showAbout && <AboutModal shop={shop} onClose={() => setShowAbout(false)} />}
      
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Mobile menu + Logo */}
          <div className="flex items-center gap-4">
            <button className="sm:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900">
              <Menu size={24} strokeWidth={1.5} />
            </button>
            <div className="flex flex-col">
              <h1 className="font-heading font-bold text-xl text-slate-900 tracking-tight">{shop.name}</h1>
              {shop.welcome_message && (
                <span className="text-[10px] text-slate-500 hidden sm:block">{shop.welcome_message}</span>
              )}
            </div>
          </div>

          {/* Desktop Nav (Collections) */}
          <nav className="hidden sm:flex gap-8 items-center absolute left-1/2 -translate-x-1/2">
            <a href="#" className="text-sm font-medium text-slate-900">All Products</a>
            {/* Collections map will go here in the future */}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {hasAboutInfo && (
              <button 
                onClick={() => setShowAbout(true)}
                className="p-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <Info size={20} strokeWidth={1.5} />
              </button>
            )}
            <button 
              className="p-2 text-slate-600 hover:text-slate-900 hidden sm:block transition-colors"
            >
              <Search size={20} strokeWidth={1.5} />
            </button>
            <button 
              onClick={openBag}
              className="relative p-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              {totalItems > 0 && (
                <span 
                  className="absolute top-1 right-1 w-4 h-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center translate-x-1/2 -translate-y-1/2"
                  style={{ backgroundColor: themeColor }}
                >
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
