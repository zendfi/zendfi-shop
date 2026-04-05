import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, CartItemPreference, ShopProduct } from './types';

interface BagState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (
    product: ShopProduct,
    quantity?: number,
    preferences?: CartItemPreference[],
    openBag?: boolean,
  ) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearBag: () => void;
  openBag: () => void;
  closeBag: () => void;
  totalItems: () => number;
  totalUsd: () => number;
}

function normalizePreferences(preferences?: CartItemPreference[]): CartItemPreference[] {
  if (!preferences?.length) return [];
  return preferences
    .map((pref) => ({
      id: pref.id,
      name: pref.name,
      values: [...(pref.values || [])],
    }))
    .filter((pref) => pref.values.length > 0);
}

function buildPreferenceKey(preferences?: CartItemPreference[]): string {
  const normalized = normalizePreferences(preferences)
    .map((pref) => ({
      id: pref.id || pref.name,
      values: [...pref.values].sort(),
    }))
    .sort((a, b) => a.id.localeCompare(b.id));

  if (normalized.length === 0) return '';
  return normalized
    .map((pref) => `${pref.id}:${pref.values.join(',')}`)
    .join('|');
}

function buildCartItemKey(productId: string, preferences?: CartItemPreference[]): string {
  const prefKey = buildPreferenceKey(preferences);
  return prefKey ? `${productId}::${prefKey}` : productId;
}

export const useBag = create<BagState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, quantity = 1, preferences, openBag = true) => {
        set((state) => {
          const normalizedPreferences = normalizePreferences(preferences);
          const key = buildCartItemKey(product.id, normalizedPreferences);
          const existing = state.items.find((i) => i.key === key);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.key === key
                  ? { ...i, quantity: i.quantity + quantity }
                  : i,
              ),
              isOpen: openBag ? true : state.isOpen,
            };
          }
          return {
            items: [
              ...state.items,
              {
                key,
                product,
                quantity,
                preferences: normalizedPreferences.length ? normalizedPreferences : undefined,
              },
            ],
            isOpen: openBag ? true : state.isOpen,
          };
        });
      },

      removeItem: (key) => {
        set((state) => ({
          items: state.items.filter((i) => i.key !== key),
        }));
      },

      updateQuantity: (key, quantity) => {
        if (quantity <= 0) {
          get().removeItem(key);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.key === key ? { ...i, quantity } : i,
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
      migrate: (persistedState) => {
        const state = persistedState as BagState;
        if (!state?.items) return persistedState;
        const items = state.items.map((item) => {
          if (item.key) return item;
          const key = buildCartItemKey(item.product.id, item.preferences);
          return { ...item, key };
        });
        return { ...state, items };
      },
    },
  ),
);
