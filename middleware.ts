import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const shopBaseDomain = process.env.NEXT_PUBLIC_SHOP_BASE_DOMAIN || 'zendfi.app';

  // x-shop-host is explicitly set by the Cloudflare Worker with the original subdomain.
  // x-forwarded-host is the fallback (may be overwritten by CF infra on Worker→Pages hops).
  const shopHost = request.headers.get('x-shop-host') || '';
  const forwardedHost = request.headers.get('x-forwarded-host') || '';
  const host = shopHost || forwardedHost || request.headers.get('host') || '';
  const hostname = host.split(':')[0];

  let slug = request.headers.get('x-shop-slug') || '';

  if (!slug && hostname.includes('.')) {
    const parts = hostname.split('.');
    const base = parts.slice(-2).join('.');
    if (base === shopBaseDomain || hostname.endsWith('.localhost')) {
      slug = parts[0];
    }
  }

  if (!slug && hostname === 'localhost') {
    slug = request.nextUrl.searchParams.get('shop') || 'demo';
  }

  if (!slug) return NextResponse.next();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-shop-slug', slug);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
