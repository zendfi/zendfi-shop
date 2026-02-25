'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useShop } from '@/components/ShopProvider';
import { useBag } from '@/lib/useBag';
import { cartCheckout } from '@/lib/api';

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

  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F9F9]">
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
    addItem(product, quantity);
    router.back();
  };

  const handleBuyNow = async () => {
    setBuyingNow(true);
    setError(null);
    try {
      const res = await cartCheckout(slug, {
        items: [{ product_id: product.id, quantity }],
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
    <div className="min-h-screen bg-[#F9F9F9]">
      {/* Floating Capsule Header */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-lg z-30 bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-2xl shadow-lg shadow-slate-100/50">
        <div className="px-3 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition"
          >
            <span className="material-symbols-outlined text-slate-700" style={{ fontSize: 18 }}>arrow_back</span>
          </button>
          <h1 className="font-bold text-slate-900 text-sm truncate flex-1">{product.name}</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto pt-20">
        {/* Image Carousel */}
        {images.length > 0 ? (
          <div>
            <div className="aspect-square bg-white overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide snap-scroll">
                {images.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition snap-start ${selectedImage === i ? 'border-primary' : 'border-transparent'
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
        ) : (
          <div className="aspect-square bg-white flex items-center justify-center">
            <span className="material-symbols-outlined text-slate-200" style={{ fontSize: 64 }}>image</span>
          </div>
        )}

        {/* Product Info */}
        <div className="px-4 pt-5 pb-40">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h2 className="text-xl font-bold text-slate-900 leading-tight">{product.name}</h2>
            <p className="text-xl font-bold shrink-0" style={{ color: themeColor }}>
              {product.onramp && product.amount_ngn
                ? `₦${(product.amount_ngn * quantity).toLocaleString('en-NG', { minimumFractionDigits: 0 })}`
                : `$${(product.price_usd * quantity).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            </p>
          </div>

          {product.description && (
            <p className="text-sm text-slate-600 leading-relaxed mb-4">{product.description}</p>
          )}

          {/* Stock badge */}
          {stockLeft !== null && stockLeft > 0 && stockLeft <= 10 && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-semibold mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Only {stockLeft} left
            </div>
          )}

          {/* Quantity */}
          {!outOfStock && (
            <div className="flex items-center gap-3 mb-6">
              <span className="text-sm text-slate-500 font-medium">Qty</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-600 hover:bg-slate-200 transition"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm font-bold text-slate-900">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-lg font-bold text-white transition hover:opacity-90"
                  style={{ backgroundColor: themeColor }}
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Payment method badge */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
              {product.onramp ? 'account_balance' : 'paid'}
            </span>
            {product.onramp
              ? 'Pay with bank transfer (NGN)'
              : <>Paid in <span className="font-semibold text-slate-500">{product.token}</span> on Solana</>}
          </div>
        </div>
      </div>

      {/* Floating Bottom CTA Capsule */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-lg z-30 bg-white/80 backdrop-blur-md border border-slate-200/50 p-2 rounded-2xl shadow-xl shadow-slate-100/50">
        <div className="flex gap-2">
          <button
            onClick={handleAddToBag}
            disabled={outOfStock}
            className="flex-1 py-3.5 rounded-xl border-2 text-xs font-bold text-slate-900 hover:bg-slate-50 transition active:scale-[0.98] disabled:opacity-40"
            style={{ borderColor: themeColor }}
          >
            {outOfStock ? 'Sold out' : 'Add to bag'}
          </button>
          <button
            onClick={handleBuyNow}
            disabled={outOfStock || buyingNow}
            className="flex-1 py-3.5 rounded-xl text-xs font-bold text-white transition active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: themeColor }}
          >
            {buyingNow ? 'Preparing…' : 'Buy now'}
          </button>
        </div>
        {error && (
          <p className="mt-2 text-[10px] text-red-500 text-center font-medium">{error}</p>
        )}
      </div>
    </div>
  );
}
