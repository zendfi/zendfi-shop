'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useShop } from '@/components/ShopProvider';
import { useBag } from '@/lib/useBag';
import { cartCheckout } from '@/lib/api';
import Header from '@/components/Header';
import { ArrowLeft, ImageIcon, Minus, Plus, Building2, Coins, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import type { SelectedPreferences } from '@/lib/types';

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
  const [error, setError] = useState<string | null>(null);
  const [selectedPreferences, setSelectedPreferences] = useState<SelectedPreferences>({});

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

  const handleBuyNow = async () => {
    if (missingRequired) {
      setError('Please complete all required product preferences.');
      return;
    }
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
      setError(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setBuyingNow(false);
    }
  };

  return (
    <div className="min-h-screen font-sans flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-32 sm:pb-12 w-full">
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
            <div className="aspect-[4/5] sm:aspect-square bg-gradient-to-br from-slate-100 to-slate-50 rounded-3xl overflow-hidden relative border border-slate-200/60 shadow-[0_14px_32px_rgba(15,23,42,0.08)]">
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
            <div className="lg:sticky lg:top-24 bg-white/78 backdrop-blur-xl border border-white rounded-3xl p-5 sm:p-7 shadow-[0_18px_46px_rgba(15,23,42,0.08)]">
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
                        <select
                          value={String(selectedPreferences[pref.key] ?? '')}
                          onChange={(e) => setSelectedPreferences((prev) => ({ ...prev, [pref.key]: e.target.value }))}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900"
                        >
                          <option value="">Select {pref.label}</option>
                          {pref.options.filter((opt) => opt.is_active).map((opt) => (
                            <option key={opt.id} value={opt.value}>
                              {opt.label}{opt.upcharge_usd > 0 ? ` (+$${opt.upcharge_usd.toFixed(2)})` : ''}
                            </option>
                          ))}
                        </select>
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
                  onClick={handleBuyNow}
                  disabled={outOfStock || buyingNow}
                  className="flex-1 py-4 sm:py-5 rounded-2xl text-sm font-bold text-white transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center hover:opacity-90 shadow-[0_14px_32px_rgba(15,23,42,0.16)]"
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
      </main>

      {!outOfStock && (
        <div className="fixed bottom-0 left-0 right-0 lg:hidden z-30 border-t border-slate-200 bg-white/95 backdrop-blur px-4 pt-3" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
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
              onClick={handleBuyNow}
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
