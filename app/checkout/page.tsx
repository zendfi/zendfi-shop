'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBag } from '@/lib/useBag';
import { useShop } from '@/components/ShopProvider';
import { cartCheckout } from '@/lib/api';

export default function CheckoutPage() {
  const router = useRouter();
  const { shop } = useShop();
  const { items, clearBag } = useBag();
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const themeColor = shop.theme_color;
  const onrampItems = items.filter((i) => i.product.onramp);
  const cryptoItems = items.filter((i) => !i.product.onramp);
  const isMixed = onrampItems.length > 0 && cryptoItems.length > 0;

  const totalNgn = onrampItems.reduce(
    (sum, i) => sum + (i.product.amount_ngn ?? i.product.price_usd) * i.quantity,
    0,
  );
  const totalCrypto = cryptoItems.reduce(
    (sum, i) => sum + i.product.price_usd * i.quantity,
    0,
  );
  const cryptoToken = cryptoItems[0]?.product.token || 'USDC';

  const handlePayNow = async () => {
    if (items.length === 0) return;
    setCheckingOut(true);
    setError(null);
    try {
      if (isMixed) {
        const ngnWindow = window.open('about:blank', '_blank');
        const cryptoWindow = window.open('about:blank', '_blank');

        const [ngnRes, cryptoRes] = await Promise.all([
          cartCheckout(shop.slug, {
            items: onrampItems.map((i) => ({
              product_id: i.product.id,
              quantity: i.quantity,
              preferences: i.preferences,
            })),
            onramp_only: true,
          }),
          cartCheckout(shop.slug, {
            items: cryptoItems.map((i) => ({
              product_id: i.product.id,
              quantity: i.quantity,
              preferences: i.preferences,
            })),
            onramp_only: false,
          }),
        ]);

        clearBag();
        if (ngnWindow) ngnWindow.location.href = ngnRes.payment_url;
        else window.open(ngnRes.payment_url, '_blank');
        if (cryptoWindow) cryptoWindow.location.href = cryptoRes.payment_url;
        else window.open(cryptoRes.payment_url, '_blank');
        router.push('/');
      } else {
        const onrampOnly = onrampItems.length > 0;
        const res = await cartCheckout(shop.slug, {
          items: items.map((i) => ({
            product_id: i.product.id,
            quantity: i.quantity,
            preferences: i.preferences,
          })),
          onramp_only: onrampOnly,
        });
        clearBag();
        window.location.href = res.payment_url;
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Checkout failed. Please try again.');
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#2B3437]">
      <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/70 backdrop-blur">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-9 h-9 rounded border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition"
            >
              <span className="material-symbols-outlined text-slate-700" style={{ fontSize: 18 }}>arrow_back</span>
            </button>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Checkout</p>
              <h1 className="text-sm font-semibold text-slate-900 tracking-[-0.02em]">Review & pay</h1>
            </div>
          </div>
          <button
            onClick={() => router.push('/')}
            className="text-xs uppercase tracking-[0.2em] text-slate-500 hover:text-slate-900 transition"
          >
            Back to shop
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <section className="bg-white border border-slate-200 rounded p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Order summary</p>
              <h2 className="text-xl font-semibold text-slate-900 tracking-[-0.03em]">Your bag</h2>
            </div>
            <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
              {items.length} items
            </span>
          </div>

          {items.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-slate-500">Your bag is empty.</p>
              <button
                onClick={() => router.push('/')}
                className="mt-4 px-4 py-2 rounded border border-slate-200 text-xs font-semibold text-slate-700 hover:border-slate-300 transition"
              >
                Continue shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.key} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded bg-slate-100 overflow-hidden">
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
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{item.product.name}</p>
                      <p className="text-[11px] text-slate-400">Qty {item.quantity}</p>
                      {item.preferences?.length ? (
                        <p className="text-[11px] text-slate-400">
                          {item.preferences
                            .map((pref) => `${pref.name}: ${pref.values.join(', ')}`)
                            .join(' · ')}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <p className="text-sm font-semibold" style={{ color: themeColor }}>
                    {item.product.onramp && item.product.amount_ngn
                      ? `₦${(item.product.amount_ngn * item.quantity).toLocaleString('en-NG', { minimumFractionDigits: 0 })}`
                      : `$${(item.product.price_usd * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="grid gap-6">
          <div className="bg-white border border-slate-200 rounded p-6 space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Total</p>
            {onrampItems.length > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Bank transfer</span>
                <span className="font-semibold text-slate-900">
                  ₦{totalNgn.toLocaleString('en-NG', { minimumFractionDigits: 0 })}
                </span>
              </div>
            )}
            {cryptoItems.length > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">{cryptoToken} (crypto)</span>
                <span className="font-semibold text-slate-900">
                  ${totalCrypto.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {cryptoToken}
                </span>
              </div>
            )}
            {error && (
              <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded">{error}</p>
            )}
            <button
              onClick={handlePayNow}
              disabled={items.length === 0 || checkingOut}
              className="w-full mt-2 py-3 rounded text-white text-sm font-semibold transition active:scale-[0.98] disabled:opacity-40"
              style={{ backgroundColor: themeColor }}
            >
              {checkingOut ? 'Processing…' : 'Pay now'}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
