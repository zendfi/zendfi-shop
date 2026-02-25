// ─── Storefront Types ──────────────────────────────────────────────────────────

export interface Shop {
  id: string;
  merchant_id: string;
  name: string;
  slug: string;
  description: string | null;
  theme_color: string;
  is_live: boolean;
  merchant_name?: string;
  welcome_message?: string | null;
  about?: string | null;
  contact_email?: string | null;
  twitter_url?: string | null;
  facebook_url?: string | null;
  instagram_url?: string | null;
  created_at: string;
  updated_at: string;
  product_count?: number;
}

export interface ShopProduct {
  id: string;
  shop_id: string;
  name: string;
  description: string | null;
  price_usd: number;
  token: string;
  payment_link_id: string | null;
  payment_url: string | null;
  quantity_type: 'unlimited' | 'limited';
  quantity_available: number | null;
  quantity_sold: number;
  media_urls: string[];
  display_order: number;
  is_active: boolean;
  onramp: boolean;
  collect_customer_info: boolean;
  amount_ngn: number | null;
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
  onramp_only?: boolean;
}

export interface CartCheckoutResponse {
  payment_url: string;
  link_code: string;
  total_usd: number;
  item_count: number;
}
