'use client';

import { use, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useShop } from '@/components/ShopProvider';
import { useBag } from '@/lib/useBag';
import { useBodyScrollLock } from '@/lib/useBodyScrollLock';
import { cartCheckout } from '@/lib/api';
import Header from '@/components/Header';
import { ArrowLeft, ImageIcon, Minus, Plus, Building2, Coins, ShieldCheck, X } from 'lucide-react';
import Image from 'next/image';
import type { ProductRelationshipType, SelectedPreferences } from '@/lib/types';

interface Props {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const { shop, products, slug } = useShop();
  const { addItem, clearBag } = useBag();
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [buyingNow, setBuyingNow] = useState(false);
  const [showCheckoutSummary, setShowCheckoutSummary] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPreferences, setSelectedPreferences] = useState<SelectedPreferences>({});

  useBodyScrollLock(showCheckoutSummary);

  const product = products.find((p) => p.id === id);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!id) return;
    const raw = window.localStorage.getItem('zendfi_recently_viewed');
    const prev = raw ? (JSON.parse(raw) as string[]) : [];
    const next = [id, ...(Array.isArray(prev) ? prev.filter((item) => item !== id) : [])].slice(0, 12);
    window.localStorage.setItem('zendfi_recently_viewed', JSON.stringify(next));
  }, [id]);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center px-6">
            <p className="text-slate-500 mb-4">Product not found.</p>
            <button onClick={() => router.back()} className="text-sm font-medium text-slate-900 hover:underline inline-flex items-center gap-2">
              <ArrowLeft size={16} /> Go back
            </button>
          </div>
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

  const activePreferences = (product.preferences ?? [])
    .filter((pref) => pref.is_active)
    .sort((a, b) => a.display_order - b.display_order);

  const isSelectLike = (type: string) => type === 'select' || type === 'dropdown';

  const missingRequired = activePreferences.some((pref) => pref.required && (selectedPreferences[pref.key] === undefined || selectedPreferences[pref.key] === ''));

  const preferenceUpcharge = activePreferences.reduce((sum, pref) => {
    if (!isSelectLike(pref.type)) return sum;
    const selectedValue = selectedPreferences[pref.key];
    const option = pref.options.find((opt) => opt.is_active && opt.value === selectedValue);
    return sum + (option?.upcharge_usd ?? 0);
  }, 0);

  const handleAddToBag = () => {
    if (missingRequired) {
      setError('Please complete all required product preferences.');
      return;
    }
    addItem(product, quantity, selectedPreferences, preferenceUpcharge);
    setError(null);
  };

  const openBuyNowSummary = () => {
    if (missingRequired) {
      setError('Please complete all required product preferences.');
      return;
    }
    setError(null);
    setShowCheckoutSummary(true);
  };

  const handleBuyNow = async () => {
    setBuyingNow(true);
    setError(null);
    try {
      const res = await cartCheckout(slug, {
        items: [{ product_id: product.id, quantity, selected_preferences: selectedPreferences }],
        onramp_only: product.onramp,
      });
      clearBag();
      window.location.href = res.payment_url;
    } catch (err: unknown) {
      setShowCheckoutSummary(false);
      setError(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setBuyingNow(false);
    }
  };

  const relationshipLabels: Record<ProductRelationshipType, string> = {
    upsell: 'Upgrade picks',
    cross_sell: 'Pairs well with',
    bundle: 'Bundle it with',
  };

  const groupedRelatedProducts = useMemo(() => {
    const byId = new Map(products.map((item) => [item.id, item]));
    const grouped: Record<ProductRelationshipType, typeof products> = {
      upsell: [],
      cross_sell: [],
      bundle: [],
    };

    for (const relation of product.related_products || []) {
      if (relation.related_product_id === product.id) continue;
      const related = byId.get(relation.related_product_id);
      if (!related || !related.is_active) continue;
      if (grouped[relation.relationship_type].some((item) => item.id === related.id)) continue;
      grouped[relation.relationship_type].push(related);
    }

    return grouped;
  }, [product.id, product.related_products, products]);

  const hasRelatedRecommendations =
    groupedRelatedProducts.upsell.length > 0 ||
    groupedRelatedProducts.cross_sell.length > 0 ||
    groupedRelatedProducts.bundle.length > 0;

  const buyNowSummaryItems = [
    {
      id: product.id,
      name: product.name,
      quantity,
      amount: product.onramp && product.amount_ngn
        ? `₦${(product.amount_ngn * quantity).toLocaleString('en-NG', { minimumFractionDigits: 0 })}`
        : `$${((product.price_usd + preferenceUpcharge) * quantity).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      subtitle: product.onramp ? 'NGN transfer checkout' : `${product.token} checkout`,
    },
  ];

  const buyNowSummaryRows = [
    {
      label: 'Subtotal',
      value: product.onramp && product.amount_ngn
        ? `₦${(product.amount_ngn * quantity).toLocaleString('en-NG', { minimumFractionDigits: 0 })}`
        : `$${((product.price_usd + preferenceUpcharge) * quantity).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    },
    {
      label: 'Payment method',
      value: product.onramp ? 'Bank transfer checkout' : `${product.token} checkout`,
    },
  ];

  return (
    <div className="min-h-screen font-sans flex flex-col">
      <Header />

      {showCheckoutSummary && (
        <div className="fixed inset-0 z-[120]" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-slate-900/45" onClick={() => setShowCheckoutSummary(false)} />

          <div className="absolute inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center p-3 sm:p-6">
            <div className="w-full sm:max-w-lg rounded-3xl border border-slate-200 bg-white overflow-hidden">
              <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-heading font-bold text-slate-900">Review your purchase</h3>
                <button
                  type="button"
                  onClick={() => setShowCheckoutSummary(false)}
                  className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center justify-center"
                  aria-label="Close checkout summary"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="px-5 sm:px-6 py-4 space-y-4 max-h-[60dvh] overflow-y-auto">
                <div className="space-y-2">
                  {buyNowSummaryItems.map((item) => (
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
                  {buyNowSummaryRows.map((row, index) => (
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

              <div className="px-5 sm:px-6 pb-5 sm:pb-6">
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={buyingNow}
                  className="w-full py-3.5 rounded-xl bg-slate-900 text-white text-sm font-semibold disabled:opacity-60"
                >
                  {buyingNow ? 'Preparing checkout...' : 'Confirm and continue'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[82px] sm:pt-[92px] pb-32 sm:pb-12 w-full">
        {/* Breadcrumb / Back */}
        <button
          onClick={() => router.back()}
          className="group inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-6 sm:mb-8"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to products
        </button>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          {/* Left: Image Gallery */}
          <div className="w-full lg:w-1/2 flex flex-col gap-4">
            <div className="aspect-[4/5] sm:aspect-square bg-slate-100 rounded-xl overflow-hidden relative border border-slate-200">
              {images.length > 0 ? (
                <Image
                  src={images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <ImageIcon size={64} className="text-slate-300" strokeWidth={1} />
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto scrollbar-hide py-2">
                {images.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative w-20 sm:w-24 aspect-square rounded-2xl overflow-hidden shrink-0 border-2 transition-all ${
                      selectedImage === i ? 'ring-2 ring-offset-2' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                    style={selectedImage === i ? { borderColor: themeColor, '--tw-ring-color': themeColor } as React.CSSProperties : {}}
                  >
                    <Image src={url} alt="" fill className="object-cover" sizes="96px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details */}
          <div className="w-full lg:w-1/2 flex flex-col">
            <div className="lg:sticky lg:top-24 bg-white border border-slate-200 rounded-xl p-5 sm:p-7">
              {/* Badges */}
              {stockLeft !== null && stockLeft > 0 && stockLeft <= 10 && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Only {stockLeft} left
                </div>
              )}

              <h1 className="text-3xl sm:text-4xl font-heading font-bold text-slate-900 leading-tight mb-4">
                {product.name}
              </h1>

              <div className="text-2xl sm:text-3xl font-bold mb-8" style={{ color: themeColor }}>
                {product.onramp && product.amount_ngn
                  ? `₦${(product.amount_ngn * quantity).toLocaleString('en-NG', { minimumFractionDigits: 0 })}`
                  : `$${((product.price_usd + preferenceUpcharge) * quantity).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              </div>

              {preferenceUpcharge > 0 && !product.onramp && (
                <p className="text-xs text-slate-500 -mt-5 mb-6">
                  Includes ${(preferenceUpcharge * quantity).toLocaleString('en-US', { minimumFractionDigits: 2 })} preference upcharge.
                </p>
              )}

              {activePreferences.length > 0 && (
                <div className="mb-8 space-y-4 rounded-2xl border border-slate-200 bg-slate-50/75 p-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Product Preferences</h3>
                  {activePreferences.map((pref) => (
                    <div key={pref.id} className="space-y-2">
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                        {pref.label}{pref.required ? ' *' : ''}
                      </label>
                      {isSelectLike(pref.type) && (
                        <div className="flex flex-wrap gap-2">
                          {pref.options.filter((opt) => opt.is_active).map((opt) => {
                            const selected = selectedPreferences[pref.key] === opt.value;
                            return (
                              <button
                                type="button"
                                key={opt.id}
                                onClick={() => setSelectedPreferences((prev) => ({ ...prev, [pref.key]: opt.value }))}
                                className={`px-3 py-2 rounded-xl text-sm border transition ${selected
                                  ? 'text-white border-slate-900 bg-slate-900'
                                  : 'text-slate-700 border-slate-200 bg-white'}
                                  `}
                              >
                                {opt.label}{opt.upcharge_usd > 0 ? ` (+$${opt.upcharge_usd.toFixed(2)})` : ''}
                              </button>
                            );
                          })}
                        </div>
                      )}
                      {pref.type === 'text' && (
                        <input
                          type="text"
                          value={String(selectedPreferences[pref.key] ?? '')}
                          onChange={(e) => setSelectedPreferences((prev) => ({ ...prev, [pref.key]: e.target.value }))}
                          maxLength={typeof pref.constraints_json?.max_length === 'number' ? pref.constraints_json.max_length : undefined}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900"
                          placeholder={`Enter ${pref.label.toLowerCase()}`}
                        />
                      )}
                      {pref.type === 'number' && (
                        <input
                          type="number"
                          value={String(selectedPreferences[pref.key] ?? '')}
                          onChange={(e) => setSelectedPreferences((prev) => ({ ...prev, [pref.key]: Number(e.target.value) }))}
                          min={typeof pref.constraints_json?.min === 'number' ? pref.constraints_json.min : undefined}
                          max={typeof pref.constraints_json?.max === 'number' ? pref.constraints_json.max : undefined}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900"
                        />
                      )}
                      {pref.type === 'boolean' && (
                        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={Boolean(selectedPreferences[pref.key])}
                            onChange={(e) => setSelectedPreferences((prev) => ({ ...prev, [pref.key]: e.target.checked }))}
                          />
                          {pref.label}
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Quantity Selector */}
              {!outOfStock && (
                <div className="flex items-center gap-4 mb-8">
                  <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">Quantity</span>
                  <div className="flex items-center bg-white border border-slate-200 rounded-full p-1">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
                      disabled={quantity <= 1}
                    >
                      <Minus size={18} />
                    </button>
                    <span className="w-12 text-center text-sm font-bold text-slate-900">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
                      disabled={quantity >= maxQty}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <button
                  onClick={handleAddToBag}
                  disabled={outOfStock || missingRequired}
                  className="flex-1 py-4 sm:py-5 rounded-2xl border-2 text-sm font-bold text-slate-900 transition-all active:scale-[0.98] disabled:opacity-40 flex items-center justify-center bg-white"
                  style={{ borderColor: outOfStock ? '#e2e8f0' : themeColor }}
                >
                  {outOfStock ? 'Sold out' : 'Add to bag'}
                </button>
                <button
                  onClick={openBuyNowSummary}
                  disabled={outOfStock || buyingNow}
                  className="flex-1 py-4 sm:py-5 rounded-2xl text-sm font-bold text-white transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center hover:opacity-90"
                  style={{ backgroundColor: outOfStock ? '#94a3b8' : themeColor }}
                >
                  {buyingNow ? 'Preparing…' : 'Buy it now'}
                </button>
              </div>
              
              {error && (
                <div className="p-4 mb-8 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                  {error}
                </div>
              )}

              {/* Description Box */}
              {product.description && (
                <div className="prose prose-slate prose-sm sm:prose-base max-w-none mb-10">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2 mb-4">
                    Description
                  </h3>
                  <div className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {product.description}
                  </div>
                </div>
              )}

              {/* Features List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8 border-t border-slate-200">
                <div className="flex items-center gap-3 text-sm text-slate-600 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <ShieldCheck size={20} className="text-slate-400" />
                  <span>Secure checkout</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  {product.onramp ? (
                    <Building2 size={20} className="text-slate-400" />
                  ) : (
                    <Coins size={20} className="text-slate-400" />
                  )}
                  <span>
                    {product.onramp ? 'Pay with bank transfer' : `Pay with ${product.token}`}
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {hasRelatedRecommendations && (
          <section className="mt-14 sm:mt-16">
            <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-7">
              <h2 className="text-2xl font-heading font-bold text-slate-900 mb-2">Would be perfect with</h2>
              <p className="text-sm text-slate-500 mb-6">Handpicked suggestions to complete your order.</p>

              <div className="space-y-8">
                {(Object.keys(groupedRelatedProducts) as ProductRelationshipType[]).map((type) => {
                  const relatedProducts = groupedRelatedProducts[type];
                  if (relatedProducts.length === 0) return null;

                  return (
                    <div key={type}>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">{relationshipLabels[type]}</h3>
                      <div className="grid grid-cols-1 min-[430px]:grid-cols-2 lg:grid-cols-3 gap-4">
                        {relatedProducts.map((relatedProduct) => (
                          <a
                            key={relatedProduct.id}
                            href={`/product/${relatedProduct.id}`}
                            className="rounded-2xl border border-slate-200 bg-white p-3 hover:border-slate-300 transition-all"
                          >
                            <div className="aspect-[4/3] rounded-xl bg-slate-100 overflow-hidden mb-3 relative">
                              {relatedProduct.media_urls?.[0] ? (
                                <Image
                                  src={relatedProduct.media_urls[0]}
                                  alt={relatedProduct.name}
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 768px) 50vw, 33vw"
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <ImageIcon size={28} className="text-slate-300" strokeWidth={1.3} />
                                </div>
                              )}
                            </div>
                            <p className="text-sm font-semibold text-slate-900 line-clamp-2">{relatedProduct.name}</p>
                            <p className="text-sm font-bold mt-1" style={{ color: themeColor }}>
                              {relatedProduct.onramp && relatedProduct.amount_ngn
                                ? `₦${relatedProduct.amount_ngn.toLocaleString('en-NG', { minimumFractionDigits: 0 })}`
                                : `$${relatedProduct.price_usd.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                            </p>
                          </a>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </main>

      {!outOfStock && (
        <div className="fixed bottom-0 left-0 right-0 lg:hidden z-30 border-t border-slate-200 bg-white px-4 pt-3" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Total</p>
              <p className="text-sm font-bold" style={{ color: themeColor }}>
                {product.onramp && product.amount_ngn
                  ? `₦${(product.amount_ngn * quantity).toLocaleString('en-NG', { minimumFractionDigits: 0 })}`
                  : `$${((product.price_usd + preferenceUpcharge) * quantity).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              </p>
            </div>
            <button
              onClick={handleAddToBag}
              disabled={missingRequired}
              className="flex-1 py-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 disabled:opacity-50"
            >
              Add to bag
            </button>
            <button
              onClick={openBuyNowSummary}
              disabled={buyingNow || missingRequired}
              className="flex-1 py-3 rounded-xl text-xs font-bold text-white disabled:opacity-50"
              style={{ backgroundColor: themeColor }}
            >
              {buyingNow ? 'Preparing...' : 'Buy now'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
