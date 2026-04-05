# Product Preferences Backend Notes (Rust)

This document describes a lightweight backend schema for product preferences and how to expose them to the storefront. It is aligned with the frontend model:

```
preferences?: Array<{ name: string; options: string[]; required?: boolean; multi_select?: boolean; id?: string }>
```

## 1) Data Model

### Option A: Normalize (recommended)
Use 2 tables plus a join for options. This is flexible and queryable.

- products
- product_preferences
- product_preference_options

Example schema (Postgres-style):

```
products (
  id uuid primary key,
  shop_id uuid not null,
  ...
)

product_preferences (
  id uuid primary key,
  product_id uuid not null references products(id) on delete cascade,
  name text not null,
  required boolean not null default false,
  multi_select boolean not null default false,
  display_order int not null default 0
)

product_preference_options (
  id uuid primary key,
  preference_id uuid not null references product_preferences(id) on delete cascade,
  label text not null,
  value text not null,
  display_order int not null default 0
)
```

Notes:
- `label` and `value` can be the same string if you want a simple shape.
- `display_order` is optional but helps keep predictable ordering.

### Option B: JSON column on product
Store a JSON array directly in `products.preferences`.

Pros: minimal tables. Cons: validation and querying are harder.

Example JSON:

```
[
  {"id":"pref-size","name":"Size","options":["XS","S","M","L"],"required":true},
  {"id":"pref-color","name":"Color","options":["Black","Stone"]}
]
```

## 2) Rust Types (serde)

Define a struct used for API responses. This is the minimal shape expected by the frontend.

```
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProductPreference {
    pub id: Option<String>,
    pub name: String,
    pub options: Vec<String>,
    pub required: Option<bool>,
    pub multi_select: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Product {
    pub id: String,
    pub shop_id: String,
    pub name: String,
    pub description: Option<String>,
    pub price_usd: f64,
    pub token: String,
    pub preferences: Option<Vec<ProductPreference>>,
    // ...rest of fields
}
```

If you normalize tables, map query results into `ProductPreference` by grouping on `preference_id` and collecting option labels.

## 3) API Response Shape

The storefront expects `preferences` to be optional. If a product has none, return `preferences: null` or omit the field.

Example payload:

```
{
  "id": "demo-prod-3",
  "name": "Indigo Hoodie",
  "preferences": [
    {"id":"pref-size","name":"Size","options":["XS","S","M","L"]},
    {"id":"pref-color","name":"Color","options":["Midnight","Stone"]}
  ]
}
```

## 4) Validation Guidelines

- `name` should be unique per product.
- `options` should be non-empty if a preference exists.
- If `multi_select` is true, the frontend can allow multiple choices later.
- If `required` is true, enforce selection server-side at checkout.

## 5) Backward Compatibility

Products without preferences should continue to work. Make the field optional in DB queries and API responses.

## 6) Future Extensions

If you need richer options later, you can expand options to objects:

```
{"label":"XL","value":"xl","price_delta_usd":2.0}
```

That would require a versioned API or a new field to avoid breaking the current frontend shape.
