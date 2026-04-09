'use client';

import { useEffect, useState } from 'react';
import { useBag } from '@/lib/useBag';
import { cartCheckout } from '@/lib/api';
import { useShop } from '@/components/ShopProvider';
import { useBodyScrollLock } from '@/lib/useBodyScrollLock';
import { ArrowLeft, ShieldCheck, X, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';
import Image from 'next/image';

interface BagDrawerProps {
  slug: string;
}

export default function BagDrawer({ slug }: BagDrawerProps) {
  const { shop } = useShop();
  const { items, isOpen, closeBag, removeLineItem, updateLineQuantity, clearBag, totalUsd } = useBag();
  const [checkingOut, setCheckingOut] = useState(false);
  const [screen, setScreen] = useState<'bag' | 'review'>('bag');
  const [error, setError] = useState<string | null>(null);

  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (isOpen) {
      setScreen('bag');
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (items.length === 0 && screen === 'review') {
      setScreen('bag');
    }
  }, [items.length, screen]);

  const themeColor = shop.theme_color;

  const onrampItems = items.filter((i) => i.product.onramp);
  const cryptoItems = items.filter((i) => !i.product.onramp);
  const isMixed = onrampItems.length > 0 && cryptoItems.length > 0;

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setCheckingOut(true);
    setError(null);
    try {
      if (isMixed) {
        const ngnWindow = window.open('about:blank', '_blank');
        const cryptoWindow = window.open('about:blank', '_blank');

        const [ngnRes, cryptoRes] = await Promise.all([
          cartCheckout(slug, {
            items: onrampItems.map((i) => ({
              product_id: i.product.id,
              quantity: i.quantity,
              selected_preferences: i.selected_preferences,
            })),
            onramp_only: true,
          }),
          cartCheckout(slug, {
            items: cryptoItems.map((i) => ({
              product_id: i.product.id,
              quantity: i.quantity,
              selected_preferences: i.selected_preferences,
            })),
            onramp_only: false,
          }),
        ]);
        clearBag();
        closeBag();
        if (ngnWindow) ngnWindow.location.href = ngnRes.payment_url;
        else window.open(ngnRes.payment_url, '_blank');
        if (cryptoWindow) cryptoWindow.location.href = cryptoRes.payment_url;
        else window.open(cryptoRes.payment_url, '_blank');
      } else {
        const onrampOnly = onrampItems.length > 0;
        const res = await cartCheckout(slug, {
          items: items.map((i) => ({
            product_id: i.product.id,
            quantity: i.quantity,
            selected_preferences: i.selected_preferences,
          })),
          onramp_only: onrampOnly,
        });
        clearBag();
        closeBag();
        window.location.href = res.payment_url;
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Checkout failed. Please try again.');
    } finally {
      setCheckingOut(false);
    }
  };

  const openCheckoutSummary = () => {
    if (items.length === 0) return;
    setError(null);
    setScreen('review');
  };

  if (!isOpen) return null;

  const totalNgn = onrampItems.reduce(
    (s, i) => s + (i.product.amount_ngn ?? i.product.price_usd) * i.quantity,
    0
  );
  const totalCrypto = cryptoItems.reduce(
    (s, i) => s + (i.product.price_usd + (i.preference_upcharge_usd ?? 0)) * i.quantity,
    0
  );
  const cryptoToken = cryptoItems[0]?.product.token || 'USDC';
  const checkoutSummaryItems = items.map((item) => ({
    id: `${item.product.id}-${JSON.stringify(item.selected_preferences ?? {})}`,
    name: item.product.name,
    quantity: item.quantity,
    amount: item.product.onramp && item.product.amount_ngn
      ? `₦${(item.product.amount_ngn * item.quantity).toLocaleString('en-NG', { minimumFractionDigits: 0 })}`
      : `$${((item.product.price_usd + (item.preference_upcharge_usd ?? 0)) * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    subtitle: item.product.onramp ? 'NGN transfer checkout' : `${item.product.token} checkout`,
  }));
  const checkoutSummaryRows = [
    ...(totalNgn > 0
      ? [{ label: 'Fiat subtotal', value: `₦${totalNgn.toLocaleString('en-NG', { minimumFractionDigits: 0 })}` }]
      : []),
    ...(totalCrypto > 0
      ? [{ label: 'Crypto subtotal', value: `$${totalCrypto.toLocaleString('en-US', { minimumFractionDigits: 2 })} (${cryptoToken})` }]
      : []),
    {
      label: 'Checkout flow',
      value: isMixed ? 'Split into fiat + crypto payments' : onrampItems.length > 0 ? 'Single fiat checkout' : 'Single crypto checkout',
    },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 z-50 transition-opacity" onClick={closeBag} />

      <div className="fixed z-50 bottom-0 left-0 right-0 sm:bottom-0 sm:top-0 sm:right-0 sm:left-auto sm:w-[480px] sm:h-full bg-white flex flex-col rounded-t-3xl sm:rounded-none h-[92dvh] sm:max-h-full transform transition-transform duration-500 ease-in-out translate-y-0 sm:translate-x-0 border-l border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            {screen === 'review' ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setScreen('bag');
                  }}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center justify-center"
                  aria-label="Back to bag"
                >
                  <ArrowLeft size={16} />
                </button>
                <h2 className="font-heading font-bold text-xl text-slate-900">Review your order</h2>
              </>
            ) : (
              <>
                <ShoppingBag size={24} className="text-slate-800" strokeWidth={1.5} />
                <h2 className="font-heading font-bold text-xl text-slate-900">Your Bag</h2>
                {items.length > 0 && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: themeColor }}>
                    {items.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                )}
              </>
            )}
          </div>
          <button
            onClick={closeBag}
            className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-900"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        <div className="relative flex-1 overflow-hidden">
          <div
            className={`absolute inset-0 flex w-[200%] h-full transition-transform duration-300 ease-out ${screen === 'bag' ? 'translate-x-0' : '-translate-x-1/2'}`}
          >
            <section className="w-1/2 h-full flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-hide">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-6">
                      <ShoppingBag size={48} className="text-slate-300" strokeWidth={1} />
                    </div>
                    <p className="text-lg font-medium text-slate-900 mb-2">Your bag is empty.</p>
                    <p className="text-sm text-slate-500 mb-8 max-w-[240px]">Browse our collection and add items to your cart.</p>
                    <button
                      onClick={closeBag}
                      className="px-8 py-3 rounded-xl font-bold text-white shadow-md active:scale-[0.98] transition-transform hover:opacity-90"
                      style={{ backgroundColor: themeColor }}
                    >
                      Continue Shopping
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    {items.map((item) => {
                      const { product, quantity } = item;
                      const hasImage = product.media_urls && product.media_urls.length > 0;
                      const stockLeft = product.quantity_type === 'limited'
                        ? (product.quantity_available ?? 0) - product.quantity_sold
                        : null;
                      const maxQty = stockLeft !== null ? Math.min(stockLeft, 10) : 10;

                      return (
                        <div key={`${product.id}-${JSON.stringify(item.selected_preferences ?? {})}`} className="flex gap-4 group rounded-2xl border border-slate-200/70 bg-white p-3">
                          <div className="w-24 h-24 rounded-2xl bg-slate-50 overflow-hidden relative shrink-0 border border-slate-100">
                            {hasImage ? (
                              <Image src={product.media_urls[0]} alt={product.name} fill className="object-cover" sizes="96px" />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                                <ShoppingBag size={24} className="text-slate-300" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 flex flex-col justify-between py-1">
                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <h3 className="font-semibold text-slate-900 leading-tight mb-1">{product.name}</h3>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 py-0.5 rounded-md bg-slate-100">
                                  {product.onramp ? 'NGN Transfer' : product.token}
                                </span>
                              </div>
                              <button
                                onClick={() => removeLineItem(product.id, item.selected_preferences)}
                                className="text-slate-400 hover:text-red-500 transition-colors p-1 -mr-1"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                            {item.selected_preferences && Object.keys(item.selected_preferences).length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {Object.entries(item.selected_preferences).map(([key, val]) => (
                                  <span key={key} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                                    {key}: {String(val)}
                                  </span>
                                ))}
                              </div>
                            )}
                            <div className="flex items-center justify-between mt-4">
                              <div className="flex items-center gap-1 bg-slate-50 rounded-lg p-0.5 border border-slate-200">
                                <button
                                  onClick={() => updateLineQuantity(product.id, item.selected_preferences, Math.max(1, quantity - 1))}
                                  className="w-7 h-7 rounded flex items-center justify-center text-slate-600 hover:bg-white hover:shadow-sm transition-all"
                                  disabled={quantity <= 1}
                                >
                                  <Minus size={14} />
                                </button>
                                <span className="w-6 text-center text-xs font-bold text-slate-900">{quantity}</span>
                                <button
                                  onClick={() => updateLineQuantity(product.id, item.selected_preferences, Math.min(maxQty, quantity + 1))}
                                  className="w-7 h-7 rounded flex items-center justify-center text-slate-600 hover:bg-white hover:shadow-sm transition-all"
                                  disabled={quantity >= maxQty}
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                              <p className="text-sm font-bold text-slate-900" style={{ color: themeColor }}>
                                {product.onramp && product.amount_ngn
                                  ? `₦${(product.amount_ngn * quantity).toLocaleString('en-NG', { minimumFractionDigits: 0 })}`
                                  : `$${((product.price_usd + (item.preference_upcharge_usd ?? 0)) * quantity).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {items.length > 0 && (
                <div className="p-4 sm:p-6 bg-white border-t border-slate-100 sticky bottom-0" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
                  <div className="space-y-3 mb-4 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    {totalNgn > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-medium">Fiat Subtotal</span>
                        <span className="font-bold text-slate-900 leading-none">
                          ₦{totalNgn.toLocaleString('en-NG', { minimumFractionDigits: 0 })}
                        </span>
                      </div>
                    )}
                    {totalCrypto > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-medium">Crypto Subtotal</span>
                        <span className="font-bold text-slate-900 leading-none flex items-center gap-1">
                          ${totalCrypto.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          <span className="text-xs text-slate-400 font-normal">({cryptoToken})</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {!isMixed && (
                    <p className="text-xs text-slate-500 mb-4">
                      Total: ${totalUsd().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  )}

                  <button
                    onClick={openCheckoutSummary}
                    disabled={checkingOut}
                    className="w-full py-4 rounded-xl text-sm font-bold text-white transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-95 shadow-lg shadow-black/10 flex justify-center items-center"
                    style={{ backgroundColor: themeColor }}
                  >
                    Review your order
                  </button>
                  {error && (
                    <p className="mt-3 text-xs text-red-500 font-medium text-center bg-red-50 py-2 rounded-lg border border-red-100">
                      {error}
                    </p>
                  )}

                  <p className="text-center text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-6 flex items-center justify-center gap-1.5 opacity-80">
                    Powered by <span className="text-slate-600">Zendfi</span>
                  </p>
                </div>
              )}
            </section>

            <section className="w-1/2 h-full flex flex-col">
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4 scrollbar-hide">
                <div className="space-y-2">
                  {checkoutSummaryItems.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                          <p className="text-xs text-slate-500">Qty {item.quantity}</p>
                          {item.subtitle && (
                            <p className="text-xs text-slate-500 mt-0.5">{item.subtitle}</p>
                          )}
                        </div>
                        <p className="text-sm font-bold text-slate-900">{item.amount}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3 space-y-2.5">
                  {checkoutSummaryRows.map((row, index) => (
                    <div key={`${row.label}-${index}`} className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-slate-500">{row.label}</span>
                      <span className="font-semibold text-slate-900 text-right">{row.value}</span>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-3 flex items-start gap-2.5">
                  <ShieldCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-700 leading-relaxed">
                    You will be redirected to a secure checkout page to complete this payment.
                  </p>
                </div>
              </div>

              <div className="px-4 sm:px-6 pb-5 sm:pb-6 border-t border-slate-100" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={checkingOut}
                  className="w-full mt-4 py-3.5 rounded-xl bg-slate-900 text-white text-sm font-semibold disabled:opacity-60"
                >
                  {checkingOut ? 'Preparing checkout...' : (isMixed ? 'Confirm and continue to checkouts' : 'Confirm and continue')}
                </button>
                {error && (
                  <p className="mt-3 text-xs text-red-500 font-medium text-center bg-red-50 py-2 rounded-lg border border-red-100">
                    {error}
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
