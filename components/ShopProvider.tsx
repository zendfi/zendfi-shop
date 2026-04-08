'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useBag } from '@/lib/useBag';
import { trackStorefrontVisit } from '@/lib/api';
import type { Shop, ShopProduct } from '@/lib/types';

interface ShopContextValue {
  shop: Shop;
  products: ShopProduct[];
  slug: string;
}

const ShopContext = createContext<ShopContextValue | null>(null);

export function useShop(): ShopContextValue {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error('useShop must be used within ShopProvider');
  return ctx;
}

interface ShopProviderProps {
  shop: Shop;
  products: ShopProduct[];
  slug: string;
  children: ReactNode;
}

function BagHydrator() {
  useEffect(() => {
    useBag.persist.rehydrate();
  }, []);
  return null;
}

export default function ShopProvider({ shop, products, slug, children }: ShopProviderProps) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const sessionKey = `zendfi_shop_visit_session_${slug}`;
    const sentKey = `zendfi_shop_visit_sent_${slug}`;

    let sessionId = window.localStorage.getItem(sessionKey);
    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      window.localStorage.setItem(sessionKey, sessionId);
    }

    const today = new Date().toISOString().slice(0, 10);
    const lastSent = window.localStorage.getItem(sentKey);
    if (lastSent === today) return;

    window.localStorage.setItem(sentKey, today);
    void trackStorefrontVisit(slug, {
      session_id: sessionId,
      page_path: window.location.pathname,
    });
  }, [slug]);

  return (
    <ShopContext.Provider value={{ shop, products, slug }}>
      <BagHydrator />
      {children}
    </ShopContext.Provider>
  );
}
