'use client';

import { useEffect } from 'react';
import type { Shop } from '@/lib/types';

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
    const themeColor = shop.theme_color;
    const hasSocials = shop.twitter_url || shop.facebook_url || shop.instagram_url;
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
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-slide-up sm:animate-none"
                style={{ maxHeight: '90dvh' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Accent bar */}
                <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${themeColor}, ${themeColor}99)` }} />

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition z-10"
                    aria-label="Close"
                >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
                </button>

                {/* Scrollable content */}
                <div className="overflow-y-auto" style={{ maxHeight: 'calc(90dvh - 4px)' }}>
                    {/* Header */}
                    <div className="px-6 pt-7 pb-4 flex items-center gap-3">
                        <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                            style={{ backgroundColor: themeColor + '18', color: themeColor }}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: 24 }}>storefront</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 leading-tight">{shop.name}</h2>
                            {shop.description && (
                                <p className="text-xs text-slate-500 mt-0.5">{shop.description}</p>
                            )}
                        </div>
                    </div>

                    {/* About content */}
                    <div className="px-6 pb-5">
                        {shop.about ? (
                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{shop.about}</p>
                        ) : (
                            <p className="text-sm text-slate-400 italic">This shop hasn&apos;t added an about section yet.</p>
                        )}
                    </div>

                    {/* Location / delivery / hours */}
                    {(shop.shop_location || shop.can_deliver_nationwide || hoursLabel) && (
                        <>
                            <div className="mx-6 border-t border-slate-100" />
                            <div className="px-6 py-4 flex flex-col gap-2">
                                {shop.shop_location && (
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <span className="material-symbols-outlined shrink-0" style={{ fontSize: 16, color: themeColor }}>location_on</span>
                                        <span>{shop.shop_location}</span>
                                    </div>
                                )}
                                {shop.can_deliver_nationwide && (
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <span className="material-symbols-outlined shrink-0" style={{ fontSize: 16, color: themeColor }}>local_shipping</span>
                                        <span>Nationwide delivery available</span>
                                    </div>
                                )}
                                {hoursLabel && (
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <span className="material-symbols-outlined shrink-0" style={{ fontSize: 16, color: themeColor }}>schedule</span>
                                        <span>{hoursLabel}</span>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Divider */}
                    <div className="mx-6 border-t border-slate-100" />

                    {/* Footer: contact + socials */}
                    <div className="px-6 py-5 flex items-center justify-between gap-4">
                        {/* Contact email */}
                        <div className="min-w-0">
                            {shop.contact_email ? (
                                <a
                                    href={`mailto:${shop.contact_email}`}
                                    className="flex items-center gap-1.5 text-sm text-slate-600 hover:underline min-w-0"
                                >
                                    <span className="material-symbols-outlined shrink-0" style={{ fontSize: 16, color: themeColor }}>mail</span>
                                    <span className="truncate">{shop.contact_email}</span>
                                </a>
                            ) : (
                                <span />
                            )}
                        </div>

                        {/* Socials */}
                        {hasSocials && (
                            <div className="flex items-center gap-2 shrink-0">
                                {shop.twitter_url && (
                                    <a
                                        href={shop.twitter_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 transition"
                                        style={{ color: themeColor }}
                                        aria-label="Twitter / X"
                                    >
                                        {TWITTER_ICON}
                                    </a>
                                )}
                                {shop.facebook_url && (
                                    <a
                                        href={shop.facebook_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 transition"
                                        style={{ color: themeColor }}
                                        aria-label="Facebook"
                                    >
                                        {FACEBOOK_ICON}
                                    </a>
                                )}
                                {shop.instagram_url && (
                                    <a
                                        href={shop.instagram_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 transition"
                                        style={{ color: themeColor }}
                                        aria-label="Instagram"
                                    >
                                        {INSTAGRAM_ICON}
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
