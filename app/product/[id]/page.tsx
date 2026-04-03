'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useShop } from '@/components/ShopProvider';
import { useBag } from '@/lib/useBag';
import type { CartItemPreference } from '@/lib/types';
import ProductCard from '@/components/ProductCard';

interface Props {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const { shop, products } = useShop();
  const { addItem, openBag } = useBag();
  const totalItems = useBag((s) => s.totalItems());
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [preferenceSelections, setPreferenceSelections] = useState<Record<string, string | string[]>>({});
  const [preferenceProductId, setPreferenceProductId] = useState<string | null>(null);

  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="text-center px-6">
          <p className="text-slate-500 mb-4">Product not found.</p>
          <button onClick={() => router.back()} className="text-sm font-medium text-slate-900 underline">
            ← Go back
          </button>
        </div>
      </div>
    );
  }

  const themeColor = shop.theme_color;
  const images = product.media_urls || [];
  const stockLeft =
    product.quantity_type === 'limited'
      ? (product.quantity_available ?? 0) - product.quantity_sold
      : null;
  const outOfStock = stockLeft !== null && stockLeft <= 0;
  const maxQty = stockLeft !== null ? Math.min(stockLeft, 10) : 10;

  const handleAddToBag = () => {
    addItem(product, quantity, buildSelectedPreferences());
    openBag();
  };

  const handleBuyNow = () => {
    addItem(product, quantity, buildSelectedPreferences());
    router.push('/checkout');
  };

  const recommendations = products.filter((p) => p.id !== product.id).slice(0, 4);

  useEffect(() => {
    if (!product) return;
    if (preferenceProductId === product.id) return;

    const nextSelections: Record<string, string | string[]> = {};
    if (product.preferences?.length) {
      product.preferences.forEach((pref) => {
        if (!pref.options?.length) return;
        const key = pref.id || pref.name;
        if (pref.required) {
          nextSelections[key] = pref.multi_select ? [pref.options[0]] : pref.options[0];
        }
      });
    }
    setPreferenceSelections(nextSelections);
    setPreferenceProductId(product.id);
  }, [product, preferenceProductId]);

  const buildSelectedPreferences = (): CartItemPreference[] | undefined => {
    if (!product?.preferences?.length) return undefined;
    const selections = product.preferences.reduce<CartItemPreference[]>((acc, pref) => {
      const key = pref.id || pref.name;
      const selection = preferenceSelections[key];
      const values = Array.isArray(selection)
        ? selection
        : selection
          ? [selection]
          : [];
      if (values.length === 0) return acc;
      acc.push({ id: pref.id, name: pref.name, values });
      return acc;
    }, []);

    return selections.length ? selections : undefined;
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#2B3437]">
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-slate-200/60 bg-white/70 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => router.back()}
              className="w-9 h-9 rounded border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition"
            >
              <span className="material-symbols-outlined text-slate-700" style={{ fontSize: 18 }}>arrow_back</span>
            </button>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Product detail</p>
              <h1 className="text-sm font-semibold text-slate-900 truncate tracking-[-0.02em]">
                {product.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="hidden sm:flex text-xs uppercase tracking-[0.2em] text-slate-500 hover:text-slate-900 transition"
            >
              Shop
            </button>
            <button
              onClick={openBag}
              className="relative w-10 h-10 rounded border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition"
            >
              <span className="material-symbols-outlined text-slate-700" style={{ fontSize: 18 }}>shopping_bag</span>
              {totalItems > 0 && (
                <span
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded text-white text-[10px] font-semibold flex items-center justify-center"
                  style={{ backgroundColor: themeColor }}
                >
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-16 space-y-16">
        <section className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] items-start">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-[4/5] bg-white border border-slate-200 rounded overflow-hidden">
              {images.length > 0 ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-slate-200" style={{ fontSize: 64 }}>image</span>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto scrollbar-hide snap-scroll">
                {images.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 rounded overflow-hidden border transition snap-start ${selectedImage === i ? 'border-primary' : 'border-slate-200'
                      }`}
                    style={selectedImage === i ? { borderColor: themeColor } : {}}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                {product.onramp ? 'Bank transfer' : `${product.token} on-chain`}
              </p>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <h2 className="text-3xl font-bold text-slate-900 tracking-[-0.03em]">
                  {product.name}
                </h2>
                <p className="text-2xl font-semibold" style={{ color: themeColor }}>
                  {product.onramp && product.amount_ngn
                    ? `₦${(product.amount_ngn * quantity).toLocaleString('en-NG', { minimumFractionDigits: 0 })}`
                    : `$${(product.price_usd * quantity).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                </p>
              </div>
              {product.description && (
                <p className="text-sm text-slate-600 leading-relaxed max-w-lg">
                  {product.description}
                </p>
              )}
            </div>

            {stockLeft !== null && stockLeft > 0 && stockLeft <= 10 && (
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-amber-200 bg-amber-50 text-[11px] text-amber-700 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Only {stockLeft} left
              </div>
            )}

            {/* Preferences */}
            {product.preferences?.length ? (
              <div className="space-y-4">
                {product.preferences.map((pref) => (
                  <div key={pref.id || pref.name} className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      {pref.name}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {pref.options?.length ? (
                        pref.options.map((option) => {
                          const key = pref.id || pref.name;
                          const selection = preferenceSelections[key];
                          const selected = Array.isArray(selection)
                            ? selection.includes(option)
                            : selection === option;
                          return (
                            <button
                              key={option}
                              onClick={() =>
                                setPreferenceSelections((prev) => {
                                  if (pref.multi_select) {
                                    const current = Array.isArray(prev[key]) ? prev[key] : [];
                                    const next = current.includes(option)
                                      ? current.filter((value) => value !== option)
                                      : [...current, option];
                                    return { ...prev, [key]: next };
                                  }
                                  return { ...prev, [key]: option };
                                })
                              }
                              className={`px-3 py-1.5 rounded border text-xs font-semibold transition ${selected
                                ? 'border-transparent text-white'
                                : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                }`}
                              style={selected ? { backgroundColor: themeColor } : {}}
                            >
                              {option}
                            </button>
                          );
                        })
                      ) : (
                        <span className="text-xs text-slate-400">No options available.</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {/* Quantity */}
            {!outOfStock && (
              <div className="flex items-center gap-3">
                <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Quantity</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 rounded border border-slate-200 bg-white flex items-center justify-center text-base font-bold text-slate-600 hover:bg-slate-50 transition"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm font-semibold text-slate-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                    className="w-9 h-9 rounded border border-transparent flex items-center justify-center text-base font-bold text-white transition"
                    style={{ backgroundColor: themeColor }}
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                onClick={handleAddToBag}
                disabled={outOfStock}
                className="py-3 rounded border border-slate-200 text-xs font-semibold text-slate-900 hover:border-slate-300 transition disabled:opacity-40"
              >
                {outOfStock ? 'Sold out' : 'Add to bag'}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={outOfStock}
                className="py-3 rounded text-xs font-semibold text-white transition active:scale-[0.98] disabled:opacity-40"
                style={{ backgroundColor: themeColor }}
              >
                Buy now
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                {product.onramp ? 'account_balance' : 'paid'}
              </span>
              {product.onramp
                ? 'Pay with bank transfer (NGN)'
                : <>Paid in <span className="font-semibold text-slate-700">{product.token}</span> on Solana</>}
            </div>
          </div>
        </section>

        {recommendations.length > 0 && (
          <section className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Recommended pairings</p>
              <h3 className="text-2xl font-semibold text-slate-900 tracking-[-0.03em]">
                Complete the ensemble.
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {recommendations.map((item) => (
                <ProductCard key={item.id} product={item} themeColor={themeColor} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
