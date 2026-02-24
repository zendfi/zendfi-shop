// ─── Storefront Types ──────────────────────────────────────────────────────────

export interface Shop {
  id: string;
  merchant_id: string;
  name: string;
  slug: string;
  description: string | null;
  theme_color: string;
  is_live: boolean;
  created_at: string;
  updated_at: string;
  product_count?: number;
}

export interface ShopProduct {
  id: string;
  shop_id: string;
  merchant_id: string;
  name: string;
  description: string | null;
  price_usd: number;
  token: string;
  payment_link_id: string | null;
  payment_link_code: string | null;
  quantity_type: 'unlimited' | 'limited';
  quantity_available: number | null;
  quantity_sold: number;
  media_urls: string[];
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface StorefrontResponse {
  shop: Shop;
  products: ShopProduct[];
}

export interface CartItem {
  product: ShopProduct;
  quantity: number;
}

export interface CartCheckoutRequest {
  items: { product_id: string; quantity: number }[];
  customer_email?: string;
}

export interface CartCheckoutResponse {
  payment_url: string;
  payment_id: string;
  total_usd: number;
  total_token: number;
  token: string;
}
