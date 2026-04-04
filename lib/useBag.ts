import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, SelectedPreferences, ShopProduct } from './types';

interface BagState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (
    product: ShopProduct,
    quantity?: number,
    selected_preferences?: SelectedPreferences,
    preference_upcharge_usd?: number,
  ) => void;
  removeItem: (productId: string) => void;
  removeLineItem: (productId: string, selected_preferences?: SelectedPreferences) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateLineQuantity: (productId: string, selected_preferences: SelectedPreferences | undefined, quantity: number) => void;
  clearBag: () => void;
  openBag: () => void;
  closeBag: () => void;
  totalItems: () => number;
  totalUsd: () => number;
}

function prefKey(selected_preferences?: SelectedPreferences): string {
  return JSON.stringify(selected_preferences ?? {});
}

export const useBag = create<BagState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, quantity = 1, selected_preferences, preference_upcharge_usd = 0) => {
        set((state) => {
          const key = prefKey(selected_preferences);
          const existing = state.items.find(
            (i) => i.product.id === product.id && prefKey(i.selected_preferences) === key,
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product.id === product.id && prefKey(i.selected_preferences) === key
                  ? { ...i, quantity: i.quantity + quantity }
                  : i,
              ),
              isOpen: true,
            };
          }
          return {
            items: [
              ...state.items,
              { product, quantity, selected_preferences, preference_upcharge_usd },
            ],
            isOpen: true,
          };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.product.id !== productId),
        }));
      },

      removeLineItem: (productId, selected_preferences) => {
        const key = prefKey(selected_preferences);
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.product.id === productId && prefKey(i.selected_preferences) === key),
          ),
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

      updateLineQuantity: (productId, selected_preferences, quantity) => {
        if (quantity <= 0) {
          get().removeLineItem(productId, selected_preferences);
          return;
        }
        const key = prefKey(selected_preferences);
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId && prefKey(i.selected_preferences) === key
              ? { ...i, quantity }
              : i,
          ),
        }));
      },

      clearBag: () => set({ items: [] }),
      openBag: () => set({ isOpen: true }),
      closeBag: () => set({ isOpen: false }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalUsd: () =>
        get().items.reduce(
          (sum, i) => sum + ((i.product.price_usd + (i.preference_upcharge_usd ?? 0)) * i.quantity),
          0,
        ),
    }),
    {
      name: 'zendfi-shop-bag',
      partialize: (state) => ({ items: state.items }),
      skipHydration: true,
    },
  ),
);
