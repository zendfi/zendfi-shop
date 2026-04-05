import type { StorefrontResponse, CartCheckoutRequest, CartCheckoutResponse } from './types';
import { getDummyStorefront, isDummyDataEnabled } from './dummyStorefront';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.zendfi.tech';
const USE_DUMMY_DATA = isDummyDataEnabled();

function buildDummyCheckout(body: CartCheckoutRequest): CartCheckoutResponse {
  return {
    payment_url: '/',
    link_code: 'demo',
    total_usd: 0,
    item_count: body.items.reduce((sum, item) => sum + item.quantity, 0),
  };
}

export async function getStorefront(slug: string): Promise<StorefrontResponse | null> {
  if (USE_DUMMY_DATA) {
    return getDummyStorefront(slug);
  }

  if (!slug) return null;

  try {
    const res = await fetch(`${API_BASE}/api/v1/shops/${slug}`);
    if (res.status === 404) return null;
    if (!res.ok) {
      console.error(`[getStorefront] API error ${res.status} for slug="${slug}"`);
      throw new Error(`API error: ${res.status}`);
    }
    return res.json();
  } catch (err) {
    console.error(`[getStorefront] fetch failed for slug="${slug}":`, err);
    return USE_DUMMY_DATA ? getDummyStorefront(slug) : null;
  }
}

export async function cartCheckout(
  slug: string,
  body: CartCheckoutRequest,
): Promise<CartCheckoutResponse> {
  if (USE_DUMMY_DATA) {
    return buildDummyCheckout(body);
  }

  try {
    const res = await fetch(`${API_BASE}/api/v1/shops/${slug}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      if (USE_DUMMY_DATA) {
        console.warn('[cartCheckout] API error, returning dummy checkout.');
        return buildDummyCheckout(body);
      }
      throw new Error(text || 'Checkout failed');
    }
    return res.json();
  } catch (err) {
    if (USE_DUMMY_DATA) {
      console.warn('[cartCheckout] fetch failed, returning dummy checkout.');
      return buildDummyCheckout(body);
    }
    throw err;
  }
}
