import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { getStorefront } from '@/lib/api';
import ShopProvider from '@/components/ShopProvider';
import BagDrawer from '@/components/BagDrawer';
import '@/app/globals.css';

export const runtime = 'edge';

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const slug = headersList.get('x-shop-slug') || '';
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
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const slug = headersList.get('x-shop-slug') || '';

  // Fetch shop data
  const data = slug ? await getStorefront(slug) : null;

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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <style
          dangerouslySetInnerHTML={{
            __html: `:root { --shop-primary: ${themeColor}; }`,
          }}
        />
      </head>
      <body className="bg-[#F9F9F9] min-h-screen font-sans antialiased">
        <ShopProvider shop={shop} products={products} slug={slug}>
          {children}
          <BagDrawer slug={slug} />
        </ShopProvider>
      </body>
    </html>
  );
}
