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
  hero_image_url?: string | null;
  hero_background_color?: string | null;
  hero_image_focus?: string | null;
  hero_image_scaling?: string | null;
  twitter_url?: string | null;
  facebook_url?: string | null;
  instagram_url?: string | null;
  shop_location?: string | null;
  can_deliver_nationwide?: boolean;
  is_24_hours?: boolean;
  open_time?: string | null;
  close_time?: string | null;
  created_at: string;
  updated_at: string;
  product_count?: number;
}

export interface ShopProduct {
  id: string;
  shop_id: string;
  name: string;
  description: string | null;
  preferences?: ProductPreference[];
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

export interface ProductPreference {
  id?: string;
  name: string;
  options: string[];
  required?: boolean;
  multi_select?: boolean;
}

export interface StorefrontResponse {
  shop: Shop;
  products: ShopProduct[];
}

export interface CartItemPreference {
  id?: string;
  name: string;
  values: string[];
}

export interface CartItem {
  key: string;
  product: ShopProduct;
  quantity: number;
  preferences?: CartItemPreference[];
}

export interface CartCheckoutRequest {
  items: { product_id: string; quantity: number; preferences?: CartItemPreference[] }[];
  customer_email?: string;
  onramp_only?: boolean;
}

export interface CartCheckoutResponse {
  payment_url: string;
  link_code: string;
  total_usd: number;
  item_count: number;
}
