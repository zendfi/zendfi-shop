'use client';

import { createContext, useContext, ReactNode } from 'react';
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

export default function ShopProvider({ shop, products, slug, children }: ShopProviderProps) {
  return (
    <ShopContext.Provider value={{ shop, products, slug }}>
      {children}
    </ShopContext.Provider>
  );
}
