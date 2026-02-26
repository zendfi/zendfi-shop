import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { getStorefront } from '@/lib/api';
import ShopProvider from '@/components/ShopProvider';
import BagDrawer from '@/components/BagDrawer';
import '@/app/globals.css';

export const runtime = 'edge';

const SHOP_BASE_DOMAIN = process.env.NEXT_PUBLIC_SHOP_BASE_DOMAIN || 'zendfi.app';

/** Extract the shop slug from the current request's host header.
 *  Works directly from the host header — bypasses the middleware header-forwarding
 *  which is unreliable on Cloudflare Pages / next-on-pages.
 */
async function getShopSlug(): Promise<string> {
  const headersList = await headers();

  // Prefer x-shop-slug if middleware DID forward it
  const fromMiddleware = headersList.get('x-shop-slug') || '';
  if (fromMiddleware) return fromMiddleware;

  // Fall back: derive from actual host header
  const host = headersList.get('x-shop-host')
    || headersList.get('x-forwarded-host')
    || headersList.get('host')
    || '';
  const hostname = host.split(':')[0];

  console.log(`[layout:getShopSlug] host="${host}" hostname="${hostname}"`);

  if (hostname.includes('.')) {
    const parts = hostname.split('.');
    const base = parts.slice(-2).join('.');
    if (base === SHOP_BASE_DOMAIN) {
      return parts.slice(0, -2).join('.');
    }
  }

  return '';
}

export async function generateMetadata(): Promise<Metadata> {
  const slug = await getShopSlug();
  if (!slug) return { title: 'Shop' };

  const data = await getStorefront(slug);
  if (!data) return { title: 'Shop not found' };

  return {
    title: data.shop.name,
    description: data.shop.description || `Shop at ${data.shop.name}`,
    openGraph: {
      title: data.shop.name,
      description: data.shop.description || `Shop at ${data.shop.name}`,
      siteName: data.shop.name,
    },
    icons: {
      icon: '/favicon.ico',
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const slug = await getShopSlug();
  console.log(`[layout:RootLayout] slug="${slug}"`);

  // Fetch shop data
  const data = slug ? await getStorefront(slug) : null;

  console.log(`[layout] slug="${slug}" data=${data ? `found(${data.shop.name})` : 'null'}`);

  if (!data) {
    return (
      <html lang="en">
        <body className="bg-white min-h-screen flex items-center justify-center font-sans">
          <div className="text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-slate-400" style={{ fontSize: 32 }}>storefront</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">Shop not found</h1>
            <p className="text-sm text-slate-500">
              This shop doesn't exist or isn't live yet.
            </p>
          </div>
        </body>
      </html>
    );
  }

  const { shop, products } = data;
  const themeColor = shop.theme_color || '#8B7BF7';

  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content={themeColor} />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
              :root { --shop-primary: ${themeColor}; }
            `,
          }}
        />
      </head>
      <body className="bg-[#F9F9F9] min-h-screen font-sans antialiased flex flex-col">
        <ShopProvider shop={shop} products={products} slug={slug}>
          <div className="flex-1">
            {children}
          </div>

          {/* Powered by Zendfi */}
          <footer className="py-12 text-center shrink-0">
            <a
              href="https://zendfi.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition"
            >
              <span>Powered by</span>
              <img src="/img/zendfi-logo.png" alt="ZendFi" className="h-3.5 opacity-80" />
            </a>
          </footer>

          <BagDrawer slug={slug} />
        </ShopProvider>
      </body>
    </html>
  );
}
