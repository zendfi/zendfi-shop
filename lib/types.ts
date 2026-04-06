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
  hero_image_url?: string;
  hero_image_fit?: 'cover' | 'contain';
  hero_image_position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  hero_headline?: string;
  hero_cta?: string;
  about?: string | null;
  contact_email?: string | null;
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
  preferences?: ProductPreferenceDefinition[];
  related_products?: ProductRelationship[];
  created_at: string;
}

export type ProductRelationshipType = 'upsell' | 'cross_sell' | 'bundle';

export interface ProductRelationship {
  id: string;
  related_product_id: string;
  relationship_type: ProductRelationshipType;
  display_order: number;
}

export interface ProductPreferenceOption {
  id: string;
  value: string;
  label: string;
  upcharge_usd: number;
  display_order: number;
  is_active: boolean;
}

export interface ProductPreferenceDefinition {
  id: string;
  key: string;
  label: string;
  type: 'select' | 'dropdown' | 'text' | 'number' | 'boolean';
  required: boolean;
  constraints_json: Record<string, unknown>;
  display_order: number;
  is_active: boolean;
  options: ProductPreferenceOption[];
}

export type SelectedPreferences = Record<string, unknown>;

export interface StorefrontResponse {
  shop: Shop;
  products: ShopProduct[];
}

export interface CartItem {
  product: ShopProduct;
  quantity: number;
  selected_preferences?: SelectedPreferences;
  preference_upcharge_usd?: number;
}

export interface CartCheckoutRequest {
  items: { product_id: string; quantity: number; selected_preferences?: SelectedPreferences }[];
  customer_email?: string;
  onramp_only?: boolean;
}

export interface CartCheckoutLineItem {
  product_id: string;
  quantity: number;
  unit_price_usd: number;
  preference_upcharge_usd: number;
  line_total_usd: number;
  selected_preferences: SelectedPreferences;
}

export interface CartCheckoutResponse {
  payment_url: string;
  link_code: string;
  total_usd: number;
  item_count: number;
  line_items?: CartCheckoutLineItem[];
}
