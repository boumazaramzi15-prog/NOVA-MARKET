-- NOVA MARKET: person-to-person marketplace listings blueprint
-- Draft migration only. Do not apply until production authentication, privacy,
-- moderation, reporting, and local legal review are implemented.

CREATE TABLE IF NOT EXISTS marketplace_sellers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_subject TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  preferred_language TEXT NOT NULL DEFAULT 'ar',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES marketplace_sellers(id),
  listing_type TEXT NOT NULL CHECK (listing_type IN ('real_estate','used_vehicle','vehicle','vehicle_part','motorcycle_scooter')),
  category_code TEXT NOT NULL CHECK (category_code IN ('real-estate','used-cars','cars','auto-parts','motorcycles-scooters')),
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 5 AND 180),
  description TEXT NOT NULL CHECK (char_length(description) BETWEEN 20 AND 10000),
  price_amount NUMERIC(14,2) NOT NULL CHECK (price_amount > 0),
  price_currency CHAR(3) NOT NULL DEFAULT 'DZD',
  wilaya_code TEXT NOT NULL,
  wilaya_name TEXT NOT NULL,
  municipality TEXT NOT NULL,
  attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending_review'
    CHECK (status IN ('draft','pending_review','approved','published','rejected','sold','expired','removed')),
  moderation_note TEXT,
  reviewed_by UUID REFERENCES admin_users(id),
  reviewed_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS marketplace_listing_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order SMALLINT NOT NULL DEFAULT 0 CHECK (sort_order BETWEEN 0 AND 20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_marketplace_listings_public
  ON marketplace_listings(status, category_code, wilaya_code, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_seller
  ON marketplace_listings(seller_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_listing_images
  ON marketplace_listing_images(listing_id, sort_order);

-- Seller contact details must never be included in public listing responses.
-- Public search must return only status='published' listings.
-- New/edited listings enter pending_review; no direct public publishing.
-- Require verified account ownership, rate limits, image validation, report/block
-- workflows, audit logging, retention/deletion controls, and anti-fraud checks.
-- Real-estate fields (property type, area, rooms, title/deed status) and vehicle
-- fields (make, model, year, mileage, condition, registration status) belong in
-- validated attributes JSON with server-side per-type schemas.
