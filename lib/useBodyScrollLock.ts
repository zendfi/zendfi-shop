'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    __zendfiBodyLockCount?: number;
    __zendfiBodyPrevOverflow?: string;
  }
}

function lockBodyScroll() {
  if (typeof window === 'undefined') return;
  const count = window.__zendfiBodyLockCount ?? 0;
  if (count === 0) {
    window.__zendfiBodyPrevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  window.__zendfiBodyLockCount = count + 1;
}

function unlockBodyScroll() {
  if (typeof window === 'undefined') return;
  const count = window.__zendfiBodyLockCount ?? 0;
  if (count <= 1) {
    document.body.style.overflow = window.__zendfiBodyPrevOverflow ?? '';
    window.__zendfiBodyLockCount = 0;
    return;
  }
  window.__zendfiBodyLockCount = count - 1;
}

export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    lockBodyScroll();
    return () => unlockBodyScroll();
  }, [active]);
}
