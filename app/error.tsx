'use client';

import { useEffect } from 'react';

interface ErrorBoundaryProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorBoundaryProps) {
    useEffect(() => {
        console.error('[shop-error-boundary]', error.message, error.digest, error.stack);
    }, [error]);

    return (
        <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center px-6">
            <div className="text-center max-w-sm">
                <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-red-400" style={{ fontSize: 28 }}>
                        error
                    </span>
                </div>
                <h1 className="text-lg font-bold text-slate-900 mb-1">Something went wrong</h1>
                <p className="text-sm text-slate-500 mb-5">
                    {error.message || 'An unexpected error occurred loading this shop.'}
                </p>
                <button
                    onClick={reset}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-700 transition"
                >
                    Try again
                </button>
            </div>
        </div>
    );
}
