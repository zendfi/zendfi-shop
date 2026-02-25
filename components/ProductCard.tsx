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

  const hasImage = product.media_urls && product.media_urls.length > 0;
  const stockLeft =
    product.quantity_type === 'limited'
      ? (product.quantity_available ?? 0) - product.quantity_sold
      : null;
  const outOfStock = stockLeft !== null && stockLeft <= 0;

  const handleAddToBag = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!outOfStock) addItem(product);
  };

  return (
    <div
      className="group bg-white rounded-2xl overflow-hidden cursor-pointer active:scale-[0.98] transition-transform shadow-sm"
      onClick={() => router.push(`/product/${product.id}`)}
    >
      {/* Image */}
      <div className="aspect-square bg-slate-100 relative overflow-hidden">
        {hasImage ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={product.media_urls[0]}
            alt={product.name}
            className="w-full h-full object-cover"
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
            <span className="text-xs font-semibold text-slate-500 bg-white/80 px-2 py-0.5 rounded-full">
              Sold out
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-sm font-semibold text-slate-900 leading-tight truncate">{product.name}</p>
        {product.description && (
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}
        <div className="flex items-center justify-between mt-2">
          <p className="text-sm font-bold" style={{ color: themeColor }}>
            {product.onramp && product.amount_ngn
              ? `₦${product.amount_ngn.toLocaleString('en-NG', { minimumFractionDigits: 0 })}`
              : `$${product.price_usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </p>
          {stockLeft !== null && stockLeft <= 5 && stockLeft > 0 && (
            <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
              {stockLeft} left
            </span>
          )}
        </div>

        <button
          onClick={handleAddToBag}
          disabled={outOfStock}
          className="w-full mt-2 py-2 rounded-xl text-xs font-semibold text-white transition active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: outOfStock ? '#94a3b8' : themeColor }}
        >
          {outOfStock ? 'Sold out' : 'Add to bag'}
        </button>
      </div>
    </div>
  );
}
