'use client';

import { ShieldCheck, X } from 'lucide-react';

export interface CheckoutSummaryItem {
  id: string;
  name: string;
  quantity: number;
  amount: string;
  subtitle?: string;
}

export interface CheckoutSummaryRow {
  label: string;
  value: string;
}

interface CheckoutSummaryModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  items: CheckoutSummaryItem[];
  summaryRows: CheckoutSummaryRow[];
  confirmLabel: string;
  confirmLoading?: boolean;
}

export default function CheckoutSummaryModal({
  open,
  onClose,
  onConfirm,
  title,
  items,
  summaryRows,
  confirmLabel,
  confirmLoading = false,
}: CheckoutSummaryModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120]" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-slate-900/45" onClick={onClose} />

      <div className="absolute inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center p-3 sm:p-6">
        <div className="w-full sm:max-w-lg rounded-3xl border border-slate-200 bg-white overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-heading font-bold text-slate-900">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center justify-center"
              aria-label="Close checkout summary"
            >
              <X size={18} />
            </button>
          </div>

          <div className="px-5 sm:px-6 py-4 space-y-4 max-h-[60dvh] overflow-y-auto">
            <div className="space-y-2">
              {items.map((item) => (
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
              {summaryRows.map((row, index) => (
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
              onClick={onConfirm}
              disabled={confirmLoading}
              className="w-full py-3.5 rounded-xl bg-slate-900 text-white text-sm font-semibold disabled:opacity-60"
            >
              {confirmLoading ? 'Preparing checkout...' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
