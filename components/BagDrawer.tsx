'use client';

import { useRouter } from 'next/navigation';
import { useBag } from '@/lib/useBag';
import { useShop } from '@/components/ShopProvider';

export default function BagDrawer() {
  const { shop } = useShop();
  const router = useRouter();
  const { items, isOpen, closeBag, removeItem, updateQuantity } = useBag();

  const themeColor = shop.theme_color;

  // Split items into onramp (NGN/fiat) vs crypto (USDC) groups
  const onrampItems = items.filter((i) => i.product.onramp);
  const cryptoItems = items.filter((i) => !i.product.onramp);
  const isMixed = onrampItems.length > 0 && cryptoItems.length > 0;

  const handleProceedToCheckout = () => {
    if (items.length === 0) return;
    closeBag();
    router.push('/checkout');
  };

  if (!isOpen) return null;

  // Compute per-group totals
  const totalNgn = onrampItems.reduce(
    (s, i) => s + (i.product.amount_ngn ?? i.product.price_usd) * i.quantity,
    0
  );
  const totalCrypto = cryptoItems.reduce(
    (s, i) => s + i.product.price_usd * i.quantity,
    0
  );
  const cryptoToken = cryptoItems[0]?.product.token || 'USDC';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={closeBag}
      />

      {/* Drawer - slides up from bottom on mobile, from right on desktop */}
      <div className="fixed z-50 bottom-0 left-0 right-0 sm:bottom-auto sm:top-0 sm:right-0 sm:left-auto sm:w-96 sm:h-full animate-slide-up sm:animate-slide-right">
        <div className="bg-white sm:h-full rounded-t sm:rounded-none sm:rounded-l shadow-xl flex flex-col max-h-[90vh] sm:max-h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-700" style={{ fontSize: 20 }}>shopping_bag</span>
              <h2 className="font-bold text-slate-900">Your bag</h2>
              {items.length > 0 && (
                <span
                  className="min-w-[18px] h-[18px] px-1 rounded text-white text-[10px] font-bold flex items-center justify-center"
                  style={{ backgroundColor: themeColor }}
                >
                  {items.reduce((s, i) => s + i.quantity, 0)}
                </span>
              )}
            </div>
            <button
              onClick={closeBag}
              className="w-8 h-8 rounded border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition"
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
              items.map((item) => {
                // Stock remaining for limited products
                const stockRemaining =
                  item.product.quantity_type === 'limited'
                    ? (item.product.quantity_available ?? 0) - item.product.quantity_sold
                    : Infinity;
                const atStockLimit = item.quantity >= stockRemaining;

                // Price display: use NGN amount for onramp products when available
                const priceDisplay = item.product.onramp && item.product.amount_ngn
                  ? `₦${(item.product.amount_ngn * item.quantity).toLocaleString('en-NG', { minimumFractionDigits: 0 })}`
                  : `$${(item.product.price_usd * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

                return (
                  <div
                    key={item.key}
                    className="flex items-center gap-3 bg-slate-50 rounded p-3"
                  >
                    {/* Image */}
                    <div className="w-14 h-14 rounded bg-slate-100 overflow-hidden shrink-0">
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
                        {priceDisplay}
                      </p>
                      {item.product.onramp && (
                        <p className="text-[10px] text-emerald-600 mt-0.5">Paid via bank transfer</p>
                      )}
                    </div>

                    {/* Quantity & Remove */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQuantity(item.key, item.quantity - 1)}
                        className="w-7 h-7 rounded border border-slate-200 bg-white flex items-center justify-center text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm font-semibold text-slate-900">{item.quantity}</span>
                      <button
                        onClick={() => {
                          if (!atStockLimit) updateQuantity(item.key, item.quantity + 1);
                        }}
                        disabled={atStockLimit}
                        className="w-7 h-7 rounded border border-slate-200 bg-white flex items-center justify-center text-sm font-bold hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ color: atStockLimit ? undefined : themeColor }}
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(item.key)}
                        className="ml-1 w-7 h-7 rounded border border-slate-200 bg-white flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition"
                      >
                        <span className="material-symbols-outlined text-slate-400 hover:text-red-400" style={{ fontSize: 14 }}>delete</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Checkout Footer */}
          {items.length > 0 && (
            <div className="p-4 border-t border-slate-100 space-y-3">
              {/* Mixed currency notice */}
              {isMixed && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded">
                  <span className="material-symbols-outlined text-amber-500 shrink-0" style={{ fontSize: 16 }}>info</span>
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    Your bag has both NGN and USDC items. Two payment tabs will open at checkout — one for each.
                  </p>
                </div>
              )}

              {/* Totals — split by currency when mixed */}
              <div className="space-y-1.5">
                {onrampItems.length > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 flex items-center gap-1">
                      <span className="material-symbols-outlined" style={{ fontSize: 13 }}>account_balance</span>
                      {isMixed ? 'Bank transfer' : 'Total'}
                    </span>
                    <span className="font-bold text-slate-900">
                      ₦{totalNgn.toLocaleString('en-NG', { minimumFractionDigits: 0 })}
                    </span>
                  </div>
                )}
                {cryptoItems.length > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 flex items-center gap-1">
                      <span className="material-symbols-outlined" style={{ fontSize: 13 }}>paid</span>
                      {isMixed ? `${cryptoToken} (crypto)` : 'Total'}
                    </span>
                    <span className="font-bold text-slate-900">
                      ${totalCrypto.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {cryptoToken}
                    </span>
                  </div>
                )}
              </div>

              <p className="text-[10px] text-slate-400 text-center">
                {isMixed
                  ? '2 separate checkouts will open — one for each payment type'
                  : onrampItems.length > 0
                    ? 'Pay via bank transfer (NGN)'
                    : `Paid in ${cryptoToken} on Solana`}
              </p>
              <button
                onClick={handleProceedToCheckout}
                className="w-full py-3 rounded text-white font-semibold text-sm transition active:scale-[0.98]"
                style={{ backgroundColor: themeColor }}
              >
                Proceed to checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
