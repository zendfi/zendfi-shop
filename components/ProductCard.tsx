'use client';

import { useRouter } from 'next/navigation';
import { useBag } from '@/lib/useBag';
import type { ShopProduct } from '@/lib/types';
import { ImageIcon } from 'lucide-react';
import Image from 'next/image';

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
  const hasRequiredPreferences = (product.preferences ?? []).some((pref) => pref.is_active && pref.required);

  const handleAddToBag = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasRequiredPreferences) {
      router.push(`/product/${product.id}`);
      return;
    }
    if (!outOfStock) addItem(product);
  };

  return (
    <div
      className="group bg-white/95 rounded-3xl overflow-hidden cursor-pointer hover:-translate-y-1 transition-all duration-300 border border-slate-200/70 shadow-[0_12px_32px_rgba(15,23,42,0.06)] flex flex-col"
      onClick={() => router.push(`/product/${product.id}`)}
    >
      {/* Image Container */}
      <div className="aspect-[4/5] bg-gradient-to-br from-slate-100 to-slate-50 relative overflow-hidden flex items-center justify-center">
        {hasImage ? (
          <Image
            src={product.media_urls[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <ImageIcon size={48} className="text-slate-200" strokeWidth={1} />
        )}
        
        {/* Badges Overlay */}
        <div className="absolute top-2 left-2 flex flex-col gap-2 z-10">
           {outOfStock && (
             <span className="text-[10px] uppercase tracking-wider font-bold text-slate-800 bg-white/90 backdrop-blur px-2.5 py-1 flex items-center shadow-sm">
               Sold out
             </span>
           )}
           {stockLeft !== null && stockLeft <= 5 && stockLeft > 0 && (
             <span className="text-[10px] uppercase tracking-wider font-bold text-amber-800 bg-amber-200/90 backdrop-blur px-2.5 py-1 flex items-center shadow-sm">
               Low Stock
             </span>
           )}
        </div>
      </div>

      {/* Info Container */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        <h3 className="text-sm font-semibold text-slate-900 leading-tight line-clamp-1">{product.name}</h3>
        <div className="flex-1">
          {product.description && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t border-slate-100/80 flex items-center justify-between">
          <p className="text-sm font-bold text-slate-900" style={{ color: themeColor }}>
            {product.onramp && product.amount_ngn
              ? `₦${product.amount_ngn.toLocaleString('en-NG', { minimumFractionDigits: 0 })}`
              : `$${product.price_usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </p>
        </div>

        {/* Quick Add Button */}
        <button
          onClick={handleAddToBag}
          disabled={outOfStock}
          className="w-full mt-3 py-2.5 rounded-xl text-xs font-bold text-white transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 group-hover:shadow-[0_8px_18px_rgba(15,23,42,0.14)] hover:bg-opacity-90"
          style={{ backgroundColor: outOfStock ? '#94a3b8' : themeColor }}
        >
          {outOfStock ? 'Sold Out' : hasRequiredPreferences ? 'Choose Options' : 'Quick Add'}
        </button>
      </div>
    </div>
  );
}
