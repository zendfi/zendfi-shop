import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const shopBaseDomain = process.env.NEXT_PUBLIC_SHOP_BASE_DOMAIN || 'zendfi.app';

  // x-forwarded-host is set by Cloudflare to the original hostname (e.g. test.zendfi.app)
  // when the Worker proxies to Pages — use it to extract the slug without Worker header injection
  const forwardedHost = request.headers.get('x-forwarded-host') || '';
  const host = forwardedHost || request.headers.get('host') || '';
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
