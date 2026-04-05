import type { StorefrontResponse, Shop, ShopProduct } from './types';

export const DUMMY_SHOP_SLUG = 'demo';

export function isDummyDataEnabled(): boolean {
  return process.env.NODE_ENV !== 'production'
    && process.env.NEXT_PUBLIC_USE_DUMMY_DATA === 'true';
}

function buildDummyShop(slug: string, now: string): Shop {
  return {
    id: 'shop_demo',
    merchant_id: 'merchant_demo',
    name: 'Zendfi Demo Shop',
    slug,
    description: 'Small batch goods and digital drops.',
    theme_color: '#0F766E',
    is_live: true,
    merchant_name: 'Zendfi Demo',
    welcome_message: 'Fresh finds every week',
    hero_image_url:
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=2000&q=80',
    hero_background_color: '#0F766E',
    hero_image_focus: 'center',
    hero_image_scaling: 'cover',
    about:
      'This is a sample storefront populated with dummy products so you can work without the API.',
    contact_email: 'hello@zendfi.demo',
    twitter_url: 'https://x.com/zendfi',
    facebook_url: null,
    instagram_url: null,
    shop_location: 'Lagos, NG',
    can_deliver_nationwide: true,
    is_24_hours: false,
    open_time: '09:00',
    close_time: '18:00',
    created_at: now,
    updated_at: now,
    product_count: 6,
  };
}

function buildDummyProducts(shopId: string, now: string): ShopProduct[] {
  return [
    {
      id: 'demo-prod-1',
      shop_id: shopId,
      name: 'Citrus Cold Brew',
      description: 'Bright and smooth cold brew with hints of orange.',
      preferences: [
        {
          id: 'pref-ice',
          name: 'Ice level',
          options: ['Light', 'Regular', 'Extra'],
        },
        {
          id: 'pref-sweet',
          name: 'Sweetener',
          options: ['None', 'Cane sugar', 'Honey'],
        },
      ],
      price_usd: 6.5,
      token: 'USDC',
      payment_link_id: null,
      payment_url: null,
      quantity_type: 'limited',
      quantity_available: 50,
      quantity_sold: 8,
      media_urls: [
        'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80',
      ],
      display_order: 1,
      is_active: true,
      onramp: false,
      collect_customer_info: false,
      amount_ngn: null,
      created_at: now,
    },
    {
      id: 'demo-prod-2',
      shop_id: shopId,
      name: 'Jollof Rice Bowl',
      description: 'Smoky, spicy, and packed with flavor. Served warm.',
      preferences: [
        {
          id: 'pref-spice',
          name: 'Spice level',
          options: ['Mild', 'Medium', 'Hot'],
        },
      ],
      price_usd: 4,
      token: 'USDC',
      payment_link_id: null,
      payment_url: null,
      quantity_type: 'unlimited',
      quantity_available: null,
      quantity_sold: 0,
      media_urls: [
        'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=900&q=80',
      ],
      display_order: 2,
      is_active: true,
      onramp: true,
      collect_customer_info: true,
      amount_ngn: 3500,
      created_at: now,
    },
    {
      id: 'demo-prod-3',
      shop_id: shopId,
      name: 'Indigo Hoodie',
      description: 'Soft fleece hoodie with a relaxed streetwear cut.',
      preferences: [
        {
          id: 'pref-size',
          name: 'Size',
          options: ['XS', 'S', 'M', 'L', 'XL'],
        },
        {
          id: 'pref-color',
          name: 'Color',
          options: ['Midnight', 'Stone', 'Citrus'],
        },
      ],
      price_usd: 42,
      token: 'USDC',
      payment_link_id: null,
      payment_url: null,
      quantity_type: 'limited',
      quantity_available: 24,
      quantity_sold: 6,
      media_urls: [
        'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80',
      ],
      display_order: 3,
      is_active: true,
      onramp: false,
      collect_customer_info: true,
      amount_ngn: null,
      created_at: now,
    },
    {
      id: 'demo-prod-4',
      shop_id: shopId,
      name: 'Weekend Market Tote',
      description: 'Canvas tote with reinforced handles and inner pocket.',
      preferences: [
        {
          id: 'pref-strap',
          name: 'Strap length',
          options: ['Standard', 'Long'],
        },
        {
          id: 'size',
          name: 'Size',
          options: ['Small', 'Medium', 'Large'],
        },
      ],
      price_usd: 18,
      token: 'USDC',
      payment_link_id: null,
      payment_url: null,
      quantity_type: 'unlimited',
      quantity_available: null,
      quantity_sold: 0,
      media_urls: [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
      ],
      display_order: 4,
      is_active: true,
      onramp: true,
      collect_customer_info: false,
      amount_ngn: 12000,
      created_at: now,
    },
    {
      id: 'demo-prod-5',
      shop_id: shopId,
      name: 'Vinyl Listening Session',
      description: 'Ticket for a private 45-minute vinyl session.',
      price_usd: 12,
      token: 'USDC',
      payment_link_id: null,
      payment_url: null,
      quantity_type: 'limited',
      quantity_available: 10,
      quantity_sold: 2,
      media_urls: [],
      display_order: 5,
      is_active: true,
      onramp: false,
      collect_customer_info: true,
      amount_ngn: null,
      created_at: now,
    },
    {
      id: 'demo-prod-6',
      shop_id: shopId,
      name: 'Studio Postcard Pack',
      description: 'Set of 6 high-quality prints on matte stock.',
      price_usd: 9,
      token: 'USDC',
      payment_link_id: null,
      payment_url: null,
      quantity_type: 'limited',
      quantity_available: 30,
      quantity_sold: 12,
      media_urls: [
        'https://images.unsplash.com/photo-1526481280695-3c687fd643ed?auto=format&fit=crop&w=900&q=80',
      ],
      display_order: 6,
      is_active: true,
      onramp: false,
      collect_customer_info: false,
      amount_ngn: null,
      created_at: now,
    },
  ];
}

export function getDummyStorefront(slug?: string): StorefrontResponse {
  const now = new Date().toISOString();
  const shopSlug = slug && slug.length > 0 ? slug : DUMMY_SHOP_SLUG;
  const shop = buildDummyShop(shopSlug, now);
  const products = buildDummyProducts(shop.id, now);
  return { shop, products };
}
