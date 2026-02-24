import type { StorefrontResponse, CartCheckoutRequest, CartCheckoutResponse } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.zendfi.tech';

export async function getStorefront(slug: string): Promise<StorefrontResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/shops/${slug}`, {
      next: { revalidate: 30 },
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  } catch {
    return null;
  }
}

export async function cartCheckout(
  slug: string,
  body: CartCheckoutRequest,
): Promise<CartCheckoutResponse> {
  const res = await fetch(`${API_BASE}/api/v1/shops/${slug}/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Checkout failed');
  }
  return res.json();
}
