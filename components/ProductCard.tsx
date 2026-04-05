'use client';

import { useRouter } from 'next/navigation';
import { useBag } from '@/lib/useBag';
import type { ShopProduct } from '@/lib/types';

interface ProductCardProps {
  product: ShopProduct;
  themeColor: string;
}

export default function ProductCard({ product, themeColor }: ProductCardProps) {
  const router = useRouter();
  const addItem = useBag((s) => s.addItem);
  const updateQuantity = useBag((s) => s.updateQuantity);
  const items = useBag((s) => s.items);

  const hasImage = product.media_urls && product.media_urls.length > 0;
  const stockLeft =
    product.quantity_type === 'limited'
      ? (product.quantity_available ?? 0) - product.quantity_sold
      : null;
  const outOfStock = stockLeft !== null && stockLeft <= 0;
  const metaLabel = product.onramp ? 'Bank transfer' : `${product.token} on-chain`;
  const availability = product.quantity_type === 'limited' ? 'Limited run' : 'Always available';

  const matchingItems = items.filter((item) => item.product.id === product.id);
  const inBagQuantity = matchingItems.reduce((sum, item) => sum + item.quantity, 0);
  const primaryItem = matchingItems[0];

  const handleAddToBag = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!outOfStock) addItem(product, 1, undefined, false);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!outOfStock) addItem(product, 1, undefined, false);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!primaryItem) return;
    updateQuantity(primaryItem.key, Math.max(0, primaryItem.quantity - 1));
  };

  return (
    <div
      className="group h-full bg-white rounded overflow-hidden cursor-pointer transition-shadow hover:shadow-md flex flex-col"
      onClick={() => router.push(`/product/${product.id}`)}
    >
      {/* Image */}
      <div className="aspect-square bg-slate-100 relative overflow-hidden">
        {hasImage ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={product.media_urls[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span
              className="material-symbols-outlined text-slate-300"
              style={{ fontSize: 36 }}
            >
              image
            </span>
          </div>
        )}
        {outOfStock && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
            <span className="text-[11px] font-semibold text-slate-500 bg-white/90 px-2 py-0.5 rounded">
              Sold out
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        <div className="space-y-1">
          {/* <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
            {metaLabel} · {availability}
          </p> */}
          <p className="text-sm font-semibold text-slate-900 leading-tight truncate">
            {product.name}
          </p>
          {product.description && (
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm font-bold" style={{ color: themeColor }}>
            {product.onramp && product.amount_ngn
              ? `₦${product.amount_ngn.toLocaleString('en-NG', { minimumFractionDigits: 0 })}`
              : `$${product.price_usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </p>
          {stockLeft !== null && stockLeft <= 5 && stockLeft > 0 && (
            <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
              {stockLeft} left
            </span>
          )}
        </div>

        {inBagQuantity > 0 ? (
          <div className="mt-auto flex items-center justify-between gap-2 rounded border border-slate-200 bg-slate-50 px-2.5 py-2">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">In bag</p>
              <p className="text-sm font-semibold text-slate-900">{inBagQuantity}</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleDecrement}
                className="w-8 h-8 rounded border border-slate-200 bg-white flex items-center justify-center text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
                aria-label="Remove one"
              >
                -
              </button>
              <button
                onClick={handleIncrement}
                disabled={outOfStock}
                className="w-8 h-8 rounded border border-slate-200 bg-white flex items-center justify-center text-sm font-bold text-slate-600 hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Add one"
              >
                +
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleAddToBag}
            disabled={outOfStock}
            className="w-full py-2 rounded text-xs font-semibold text-white transition active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed mt-auto"
            style={{ backgroundColor: outOfStock ? '#94a3b8' : themeColor }}
          >
            {outOfStock ? 'Sold out' : 'Add to bag'}
          </button>
        )}
      </div>
    </div>
  );
}
