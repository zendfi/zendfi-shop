import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, ShopProduct } from './types';

interface BagState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: ShopProduct, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearBag: () => void;
  openBag: () => void;
  closeBag: () => void;
  totalItems: () => number;
  totalUsd: () => number;
}

export const useBag = create<BagState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.product.id === product.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product.id === product.id
                  ? { ...i, quantity: i.quantity + quantity }
                  : i,
              ),
              isOpen: true,
            };
          }
          return { items: [...state.items, { product, quantity }], isOpen: true };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.product.id !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId ? { ...i, quantity } : i,
          ),
        }));
      },

      clearBag: () => set({ items: [] }),
      openBag: () => set({ isOpen: true }),
      closeBag: () => set({ isOpen: false }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalUsd: () =>
        get().items.reduce((sum, i) => sum + i.product.price_usd * i.quantity, 0),
    }),
    {
      name: 'zendfi-shop-bag',
      partialize: (state) => ({ items: state.items }),
      skipHydration: true,
    },
  ),
);
