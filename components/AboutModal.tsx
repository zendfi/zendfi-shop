'use client';

import { useEffect } from 'react';
import type { Shop } from '@/lib/types';
import { X, Store, MapPin, Truck, Mail, Info, Clock, ExternalLink } from 'lucide-react';
import { useBodyScrollLock } from '@/lib/useBodyScrollLock';

interface Props {
    shop: Shop;
    onClose: () => void;
}

const TWITTER_ICON = (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.632 5.905-5.632Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const FACEBOOK_ICON = (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.026 4.388 11.02 10.125 11.927v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796v8.437C19.612 23.093 24 18.099 24 12.073z" />
    </svg>
);

const INSTAGRAM_ICON = (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
);

export default function AboutModal({ shop, onClose }: Props) {
    useBodyScrollLock(true);

    const themeColor = shop.theme_color;
    const hasSocials = !!(shop.twitter_url || shop.facebook_url || shop.instagram_url);
    const hoursLabel = shop.is_24_hours
        ? 'Open 24 hours'
        : shop.open_time && shop.close_time
          ? `${shop.open_time} – ${shop.close_time}`
          : null;

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-slate-900/40 z-0" />

            <div
                className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up sm:animate-none z-10 font-sans flex flex-col"
                style={{ maxHeight: 'calc(100dvh - 32px)' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div 
                  className="h-1.5 w-full bg-gradient-to-r" 
                  style={{ backgroundImage: `linear-gradient(90deg, ${themeColor}, ${themeColor}77)` }} 
                />

                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-slate-800">
                    <Info size={18} />
                    <h2 className="font-heading font-bold text-lg">About Store</h2>
                  </div>
                  <button
                      onClick={onClose}
                      className="p-2 -mr-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors"
                  >
                      <X size={20} />
                  </button>
                </div>

                <div className="overflow-y-auto p-6 flex-1 bg-slate-50/50">
                    <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100">
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 shadow-sm bg-white"
                            style={{ color: themeColor, border: `1px solid ${themeColor}22` }}
                        >
                            <Store size={32} />
                        </div>
                        <h2 className="text-xl font-heading font-bold text-slate-900">{shop.name}</h2>
                        {shop.description && (
                            <p className="text-sm text-slate-500 mt-1 max-w-sm">{shop.description}</p>
                        )}
                    </div>

                    <div className="py-6">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Our Story</h3>
                        {shop.about ? (
                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{shop.about}</p>
                        ) : (
                            <p className="text-sm text-slate-400 italic">This shop hasn't added an about section yet.</p>
                        )}
                    </div>

                    {(shop.shop_location || shop.can_deliver_nationwide || hoursLabel) && (
                        <div className="py-6 border-t border-slate-100">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Location & Logistics</h3>
                            <div className="flex flex-col gap-3">
                                {shop.shop_location && (
                                    <div className="flex items-start gap-3 text-sm text-slate-700 bg-white p-3 rounded-xl border border-slate-100">
                                        <MapPin size={18} className="mt-0.5 shrink-0" style={{ color: themeColor }} />
                                        <span className="leading-tight">{shop.shop_location}</span>
                                    </div>
                                )}
                                {shop.can_deliver_nationwide && (
                                    <div className="flex items-center gap-3 text-sm text-slate-700 bg-white p-3 rounded-xl border border-slate-100">
                                        <Truck size={18} className="shrink-0" style={{ color: themeColor }} />
                                        <span>Nationwide delivery available</span>
                                    </div>
                                )}
                                {hoursLabel && (
                                    <div className="flex items-center gap-3 text-sm text-slate-700 bg-white p-3 rounded-xl border border-slate-100">
                                        <Clock size={18} className="shrink-0" style={{ color: themeColor }} />
                                        <span>{hoursLabel}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {(shop.contact_email || hasSocials) && (
                        <div className="py-6 border-t border-slate-100">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Contact & Support</h3>
                            
                            <div className="flex flex-wrap gap-2">
                                {shop.contact_email && (
                                    <a
                                        href={`mailto:${shop.contact_email}`}
                                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:border-slate-300 hover:shadow-sm transition-all"
                                    >
                                        <Mail size={16} className="text-slate-400" />
                                        Email Support
                                    </a>
                                )}
                                {shop.twitter_url && (
                                    <a
                                        href={shop.twitter_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:border-slate-300 hover:shadow-sm transition-all"
                                    >
                                        {TWITTER_ICON}
                                        Twitter <ExternalLink size={12} className="text-slate-300" />
                                    </a>
                                )}
                                {shop.facebook_url && (
                                    <a
                                        href={shop.facebook_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:border-slate-300 hover:shadow-sm transition-all"
                                    >
                                        {FACEBOOK_ICON}
                                        Facebook <ExternalLink size={12} className="text-slate-300" />
                                    </a>
                                )}
                                {shop.instagram_url && (
                                    <a
                                        href={shop.instagram_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:border-slate-300 hover:shadow-sm transition-all"
                                    >
                                        {INSTAGRAM_ICON}
                                        Instagram <ExternalLink size={12} className="text-slate-300" />
                                    </a>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
