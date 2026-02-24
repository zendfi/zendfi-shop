'use client';

import { useState } from 'react';
import { useBag } from '@/lib/useBag';
import { cartCheckout } from '@/lib/api';
import { useShop } from '@/components/ShopProvider';

interface BagDrawerProps {
  slug: string;
}

export default function BagDrawer({ slug }: BagDrawerProps) {
  const { shop } = useShop();
  const { items, isOpen, closeBag, removeItem, updateQuantity, clearBag, totalUsd } = useBag();
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const themeColor = shop.theme_color;

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setCheckingOut(true);
    setError(null);
    try {
      const res = await cartCheckout(slug, {
        items: items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
      });
      clearBag();
      closeBag();
      window.location.href = res.payment_url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Checkout failed. Please try again.');
    } finally {
      setCheckingOut(false);
    }
  };

  if (!isOpen) return null;

  const total = totalUsd();
  const primaryToken = items[0]?.product.token || 'USDC';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={closeBag}
      />

      {/* Drawer - slides up from bottom on mobile, from right on desktop */}
      <div className="fixed z-50 bottom-0 left-0 right-0 sm:bottom-auto sm:top-0 sm:right-0 sm:left-auto sm:w-96 sm:h-full animate-slide-up sm:animate-slide-right">
        <div className="bg-white sm:h-full rounded-t-3xl sm:rounded-none sm:rounded-l-3xl shadow-2xl flex flex-col max-h-[90vh] sm:max-h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-700" style={{ fontSize: 20 }}>shopping_bag</span>
              <h2 className="font-bold text-slate-900">Your bag</h2>
              {items.length > 0 && (
                <span
                  className="w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                  style={{ backgroundColor: themeColor }}
                >
                  {items.reduce((s, i) => s + i.quantity, 0)}
                </span>
              )}
            </div>
            <button
              onClick={closeBag}
              className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition"
            >
              <span className="material-symbols-outlined text-slate-600" style={{ fontSize: 18 }}>close</span>
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="material-symbols-outlined text-slate-200" style={{ fontSize: 48 }}>shopping_bag</span>
                <p className="text-sm text-slate-400 mt-2">Your bag is empty</p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center gap-3 bg-slate-50 rounded-2xl p-3"
                >
                  {/* Image */}
                  <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                    {item.product.media_urls?.[0] ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={item.product.media_urls[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-slate-300" style={{ fontSize: 20 }}>image</span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{item.product.name}</p>
                    <p className="text-xs font-bold mt-0.5" style={{ color: themeColor }}>
                      ${(item.product.price_usd * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>

                  {/* Quantity & Remove */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm font-semibold text-slate-900">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center text-sm font-bold hover:bg-slate-50 transition"
                      style={{ color: themeColor }}
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="ml-1 w-7 h-7 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition"
                    >
                      <span className="material-symbols-outlined text-slate-400 hover:text-red-400" style={{ fontSize: 14 }}>delete</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Checkout Footer */}
          {items.length > 0 && (
            <div className="p-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Total</span>
                <span className="font-bold text-slate-900">
                  ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                </span>
              </div>
              <p className="text-[10px] text-slate-400 text-center">
                Paid in {primaryToken} at checkout
              </p>
              {error && (
                <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-xl">{error}</p>
              )}
              <button
                onClick={handleCheckout}
                disabled={checkingOut}
                className="w-full py-4 rounded-2xl text-white font-bold text-sm transition active:scale-[0.98] disabled:opacity-70"
                style={{ backgroundColor: themeColor }}
              >
                {checkingOut ? 'Preparing checkout…' : `Pay $${total.toLocaleString('en-US', { minimumFractionDigits: 2 })} →`}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
