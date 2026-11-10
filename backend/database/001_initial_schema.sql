-- NOVA MARKET: initial PostgreSQL schema blueprint
-- Status: migration draft only. This file does not create a live database.
-- Apply only to a newly provisioned, secured PostgreSQL environment after review.
-- Never store card numbers, CVVs, API secrets, or supplier credentials here.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_subject TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner','operator','reviewer','support')),
  preferred_language TEXT NOT NULL DEFAULT 'ar',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS language_registry (
  language_tag TEXT PRIMARY KEY,
  language_name TEXT NOT NULL,
  support_status TEXT NOT NULL DEFAULT 'planned'
    CHECK (support_status IN ('planned','machine_translated','reviewed','fully_supported')),
  is_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  is_rtl BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO language_registry (language_tag, language_name, support_status, is_enabled, is_rtl)
VALUES ('ar', 'Arabic', 'reviewed', TRUE, TRUE),
       ('en', 'English', 'reviewed', TRUE, FALSE)
ON CONFLICT (language_tag) DO NOTHING;

CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  integration_status TEXT NOT NULL DEFAULT 'not_connected'
    CHECK (integration_status IN ('not_connected','test_mode','connected','disabled')),
  api_base_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO suppliers (code, display_name, integration_status, notes)
VALUES
 ('cj', 'CJdropshipping', 'not_connected', 'Primary candidate; API access and terms must be verified.'),
 ('aliexpress_dsers', 'AliExpress + DSers', 'not_connected', 'Alternative candidate; account and API eligibility must be verified.'),
 ('zendrop', 'Zendrop', 'not_connected', 'Backup candidate; account and API eligibility must be verified.')
ON CONFLICT (code) DO NOTHING;

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  category_code TEXT NOT NULL,
  source_language TEXT NOT NULL REFERENCES language_registry(language_tag),
  source_title TEXT NOT NULL,
  source_description TEXT NOT NULL,
  brand TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','needs_review','approved','published','paused','rejected','archived')),
  public_price NUMERIC(12,2),
  public_currency CHAR(3),
  compliance_status TEXT NOT NULL DEFAULT 'unchecked'
    CHECK (compliance_status IN ('unchecked','passed','needs_review','rejected')),
  approved_by UUID REFERENCES admin_users(id),
  approved_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK ((public_price IS NULL) = (public_currency IS NULL)),
  CHECK (public_price IS NULL OR public_price >= 0)
);

CREATE TABLE IF NOT EXISTS product_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  language_tag TEXT NOT NULL REFERENCES language_registry(language_tag),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  seo_title TEXT,
  seo_description TEXT,
  translation_method TEXT NOT NULL DEFAULT 'human'
    CHECK (translation_method IN ('human','machine','ai_assisted')),
  review_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (review_status IN ('pending','reviewed','rejected')),
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  reviewed_by UUID REFERENCES admin_users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (product_id, language_tag, version)
);

CREATE TABLE IF NOT EXISTS supplier_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  supplier_product_id TEXT NOT NULL,
  supplier_variant_id TEXT,
  sku TEXT,
  source_url TEXT,
  cost_amount NUMERIC(12,2),
  cost_currency CHAR(3),
  stock_quantity INTEGER,
  stock_checked_at TIMESTAMPTZ,
  quality_notes TEXT,
  is_selected BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (cost_amount IS NULL OR cost_amount >= 0),
  CHECK (stock_quantity IS NULL OR stock_quantity >= 0),
  UNIQUE (supplier_id, supplier_product_id, supplier_variant_id)
);

CREATE TABLE IF NOT EXISTS shipping_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_offer_id UUID NOT NULL REFERENCES supplier_offers(id) ON DELETE CASCADE,
  destination_country CHAR(2) NOT NULL,
  destination_region TEXT,
  shipping_service TEXT,
  shipping_amount NUMERIC(12,2),
  shipping_currency CHAR(3),
  min_delivery_days INTEGER,
  max_delivery_days INTEGER,
  quote_status TEXT NOT NULL DEFAULT 'unknown'
    CHECK (quote_status IN ('unknown','available','unavailable','expired')),
  checked_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  CHECK (shipping_amount IS NULL OR shipping_amount >= 0),
  CHECK (min_delivery_days IS NULL OR min_delivery_days >= 0),
  CHECK (max_delivery_days IS NULL OR max_delivery_days >= 0),
  CHECK (min_delivery_days IS NULL OR max_delivery_days IS NULL OR max_delivery_days >= min_delivery_days)
);

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  preferred_language TEXT REFERENCES language_registry(language_tag),
  marketing_consent BOOLEAN NOT NULL DEFAULT FALSE,
  privacy_notice_version TEXT,
  consent_recorded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES customers(id),
  status TEXT NOT NULL DEFAULT 'pending_payment'
    CHECK (status IN ('pending_payment','paid','risk_review','awaiting_fulfilment_approval',
      'submitted_to_supplier','shipped','delivered','payment_failed','address_review',
      'supplier_stockout','supplier_price_changed','fulfilment_failed','cancellation_requested',
      'refund_pending_approval','refunded','cancelled')),
  currency CHAR(3) NOT NULL,
  subtotal NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0),
  shipping_total NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (shipping_total >= 0),
  tax_total NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (tax_total >= 0),
  grand_total NUMERIC(12,2) NOT NULL CHECK (grand_total >= 0),
  shipping_address_snapshot JSONB,
  payment_provider TEXT,
  payment_reference TEXT,
  payment_verified_at TIMESTAMPTZ,
  preferred_language TEXT REFERENCES language_registry(language_tag),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  supplier_offer_id UUID REFERENCES supplier_offers(id),
  product_title_snapshot TEXT NOT NULL,
  variant_snapshot JSONB,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
  unit_cost_snapshot NUMERIC(12,2),
  shipping_cost_snapshot NUMERIC(12,2),
  currency CHAR(3) NOT NULL
);

CREATE TABLE IF NOT EXISTS fulfilments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  supplier_order_reference TEXT,
  status TEXT NOT NULL DEFAULT 'pending_approval'
    CHECK (status IN ('pending_approval','approved','submitted','processing','shipped','delivered','failed','cancelled')),
  carrier TEXT,
  tracking_number TEXT,
  tracking_url TEXT,
  submitted_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  requested_by TEXT NOT NULL,
  requested_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected','cancelled','executed','execution_failed')),
  decided_by UUID REFERENCES admin_users(id),
  decision_note TEXT,
  decided_at TIMESTAMPTZ,
  executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS agent_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module TEXT NOT NULL,
  task_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued','running','draft_ready','needs_approval','completed','failed','cancelled')),
  language_tag TEXT REFERENCES language_registry(language_tag),
  input_references JSONB NOT NULL DEFAULT '{}'::jsonb,
  draft_output JSONB,
  error_code TEXT,
  error_message TEXT,
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_events (
  id BIGSERIAL PRIMARY KEY,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('owner','admin','agent','supplier','payment_provider','system')),
  actor_id TEXT,
  event_type TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  request_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_status_category ON products(status, category_code);
CREATE INDEX IF NOT EXISTS idx_translations_product_language ON product_translations(product_id, language_tag);
CREATE INDEX IF NOT EXISTS idx_supplier_offers_product ON supplier_offers(product_id);
CREATE INDEX IF NOT EXISTS idx_shipping_country_status ON shipping_quotes(destination_country, quote_status);
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fulfilments_order ON fulfilments(order_id);
CREATE INDEX IF NOT EXISTS idx_approvals_status_created ON approvals(status, created_at);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_status_created ON agent_tasks(status, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_target_created ON audit_events(target_type, target_id, created_at DESC);

-- Before production:
-- 1) Create a separate least-privilege database role for the application.
-- 2) Enable row-level security where appropriate and define explicit policies.
-- 3) Restrict audit_events updates/deletes to a controlled maintenance role.
-- 4) Encrypt backups and sensitive address snapshots; define retention/deletion rules.
-- 5) Store secrets only in the hosting provider's secret manager.
-- 6) Verify payment webhooks server-side; browser redirects never prove payment.
-- 7) Do not submit supplier orders or refunds without an approved workflow.
