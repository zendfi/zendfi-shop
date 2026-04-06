'use client';

import { useState } from 'react';
import { useBag } from '@/lib/useBag';
import { cartCheckout } from '@/lib/api';
import { useShop } from '@/components/ShopProvider';
import CheckoutSummaryModal from '@/components/CheckoutSummaryModal';
import { X, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';
import Image from 'next/image';

interface BagDrawerProps {
  slug: string;
}

export default function BagDrawer({ slug }: BagDrawerProps) {
  const { shop } = useShop();
  const { items, isOpen, closeBag, removeLineItem, updateLineQuantity, clearBag, totalUsd } = useBag();
  const [checkingOut, setCheckingOut] = useState(false);
  const [showCheckoutSummary, setShowCheckoutSummary] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setShowCheckoutSummary(false);
      setError(err instanceof Error ? err.message : 'Checkout failed. Please try again.');
    } finally {
      setCheckingOut(false);
    }
  };

  const openCheckoutSummary = () => {
    if (items.length === 0) return;
    setError(null);
    setShowCheckoutSummary(true);
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
      <CheckoutSummaryModal
        open={showCheckoutSummary}
        onClose={() => setShowCheckoutSummary(false)}
        onConfirm={handleCheckout}
        title="Review your order"
        items={checkoutSummaryItems}
        summaryRows={checkoutSummaryRows}
        confirmLabel={isMixed ? 'Confirm and continue to checkouts' : 'Confirm and continue'}
        confirmLoading={checkingOut}
      />

      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-opacity" onClick={closeBag} />

      <div className="fixed z-50 bottom-0 left-0 right-0 sm:bottom-0 sm:top-0 sm:right-0 sm:left-auto sm:w-[480px] sm:h-full bg-white/95 backdrop-blur-xl sm:shadow-2xl flex flex-col rounded-t-3xl sm:rounded-none h-[92dvh] sm:max-h-full transform transition-transform duration-500 ease-in-out translate-y-0 sm:translate-x-0 border-l border-white">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100 bg-white/90 sticky top-0 z-10 backdrop-blur">
          <div className="flex items-center gap-3">
            <ShoppingBag size={24} className="text-slate-800" strokeWidth={1.5} />
            <h2 className="font-heading font-bold text-xl text-slate-900">Your Bag</h2>
            {items.length > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: themeColor }}>
                {items.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </div>
          <button
            onClick={closeBag}
            className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-900"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        {/* Content */}
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

        {/* Footer */}
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
              {checkingOut ? 'Preparing Checkout…' : 'Proceed to checkout'}
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
      </div>
    </>
  );
}
