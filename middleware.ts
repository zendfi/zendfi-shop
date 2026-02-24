import { NextRequest, NextResponse } from 'next/server';

// Extracts the subdomain slug from the host header and passes it as X-Shop-Slug.
// Supports: {slug}.zendfi.app, {slug}.localhost:3002 (dev)
export function middleware(request: NextRequest) {
  // If the Worker already injected x-shop-slug, use it as-is
  const existingSlug = request.headers.get('x-shop-slug');
  if (existingSlug) {
    return NextResponse.next({ request });
  }

  const host = request.headers.get('host') || '';
  const shopBaseDomain = process.env.NEXT_PUBLIC_SHOP_BASE_DOMAIN || 'zendfi.app';

  // Extract subdomain
  let slug = '';
  if (host.includes('.')) {
    // strip port from hostname
    const hostname = host.split(':')[0];
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      const base = parts.slice(-2).join('.');
      if (
        base === shopBaseDomain ||
        hostname.endsWith('.localhost') ||
        base === 'localhost'
      ) {
        slug = parts[0];
      } else {
        slug = parts[0]; // fallback: anything before first dot
      }
    }
  } else if (host.startsWith('localhost')) {
    // dev without subdomain: read ?shop= query param as fallback
    slug = request.nextUrl.searchParams.get('shop') || 'demo';
  }

  const requestHeaders = new Headers(request.headers);
  if (slug) {
    requestHeaders.set('x-shop-slug', slug);
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    // Match all paths except Next.js internals and static files
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
