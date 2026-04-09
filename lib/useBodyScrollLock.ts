'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    __zendfiBodyLockCount?: number;
    __zendfiBodyPrevOverflow?: string;
    __zendfiHtmlPrevOverflow?: string;
    __zendfiBodyPrevPosition?: string;
    __zendfiBodyPrevTop?: string;
    __zendfiBodyPrevLeft?: string;
    __zendfiBodyPrevRight?: string;
    __zendfiBodyPrevWidth?: string;
    __zendfiBodyPrevOverscrollBehavior?: string;
    __zendfiHtmlPrevOverscrollBehavior?: string;
    __zendfiScrollYBeforeLock?: number;
  }
}

function lockBodyScroll() {
  if (typeof window === 'undefined') return;
  const count = window.__zendfiBodyLockCount ?? 0;
  if (count === 0) {
    const html = document.documentElement;
    window.__zendfiScrollYBeforeLock = window.scrollY;
    window.__zendfiHtmlPrevOverflow = html.style.overflow;
    window.__zendfiBodyPrevOverflow = document.body.style.overflow;
    window.__zendfiBodyPrevPosition = document.body.style.position;
    window.__zendfiBodyPrevTop = document.body.style.top;
    window.__zendfiBodyPrevLeft = document.body.style.left;
    window.__zendfiBodyPrevRight = document.body.style.right;
    window.__zendfiBodyPrevWidth = document.body.style.width;
    window.__zendfiBodyPrevOverscrollBehavior = document.body.style.overscrollBehavior;
    window.__zendfiHtmlPrevOverscrollBehavior = html.style.overscrollBehavior;

    html.style.overflow = 'hidden';
    html.style.overscrollBehavior = 'none';
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${window.__zendfiScrollYBeforeLock}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overscrollBehavior = 'none';
  }
  window.__zendfiBodyLockCount = count + 1;
}

function unlockBodyScroll() {
  if (typeof window === 'undefined') return;
  const count = window.__zendfiBodyLockCount ?? 0;
  if (count <= 1) {
    const html = document.documentElement;
    const scrollY = window.__zendfiScrollYBeforeLock ?? 0;

    html.style.overflow = window.__zendfiHtmlPrevOverflow ?? '';
    html.style.overscrollBehavior = window.__zendfiHtmlPrevOverscrollBehavior ?? '';
    document.body.style.overflow = window.__zendfiBodyPrevOverflow ?? '';
    document.body.style.position = window.__zendfiBodyPrevPosition ?? '';
    document.body.style.top = window.__zendfiBodyPrevTop ?? '';
    document.body.style.left = window.__zendfiBodyPrevLeft ?? '';
    document.body.style.right = window.__zendfiBodyPrevRight ?? '';
    document.body.style.width = window.__zendfiBodyPrevWidth ?? '';
    document.body.style.overscrollBehavior = window.__zendfiBodyPrevOverscrollBehavior ?? '';

    window.__zendfiBodyLockCount = 0;
    window.scrollTo(0, scrollY);
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
