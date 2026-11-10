-- NOVA MARKET operational control plane
-- Draft migration: apply only after provisioning a secured development database.
-- No real products, stock, prices, customer records, or shipments are seeded here.

CREATE TABLE IF NOT EXISTS product_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  supplier_offer_id UUID REFERENCES supplier_offers(id) ON DELETE SET NULL,
  sku TEXT NOT NULL,
  location_code TEXT NOT NULL DEFAULT 'supplier',
  on_hand INTEGER NOT NULL DEFAULT 0 CHECK (on_hand >= 0),
  reserved INTEGER NOT NULL DEFAULT 0 CHECK (reserved >= 0 AND reserved <= on_hand),
  safety_stock INTEGER NOT NULL DEFAULT 0 CHECK (safety_stock >= 0),
  stock_source TEXT NOT NULL DEFAULT 'manual'
    CHECK (stock_source IN ('manual','supplier_api','verified_import')),
  source_checked_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(product_id, sku, location_code)
);

CREATE TABLE IF NOT EXISTS inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id UUID NOT NULL REFERENCES product_inventory(id),
  movement_type TEXT NOT NULL CHECK (movement_type IN ('receipt','reserve','release','adjustment','sale','return')),
  quantity_delta INTEGER NOT NULL CHECK (quantity_delta <> 0),
  reason TEXT NOT NULL,
  source_reference TEXT,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('owner','operator','supplier','system')),
  actor_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  old_price NUMERIC(12,2),
  old_currency CHAR(3),
  new_price NUMERIC(12,2) NOT NULL CHECK (new_price >= 0),
  new_currency CHAR(3) NOT NULL,
  reason TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('owner','supplier_sync','pricing_rule')),
  approval_id UUID REFERENCES approvals(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_status_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  note TEXT,
  source TEXT NOT NULL CHECK (source IN ('system','owner','support','payment_provider','supplier','carrier')),
  source_event_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS shipment_tracking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fulfilment_id UUID NOT NULL REFERENCES fulfilments(id) ON DELETE CASCADE,
  carrier_event_id TEXT,
  event_code TEXT,
  event_label TEXT NOT NULL,
  event_location TEXT,
  occurred_at TIMESTAMPTZ,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(fulfilment_id, carrier_event_id)
);

CREATE TABLE IF NOT EXISTS support_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  channel TEXT NOT NULL DEFAULT 'web'
    CHECK (channel IN ('web','email','whatsapp','other')),
  language_tag TEXT REFERENCES language_registry(language_tag),
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open','waiting_customer','waiting_owner','resolved','closed')),
  assigned_to TEXT,
  automation_state TEXT NOT NULL DEFAULT 'draft_only'
    CHECK (automation_state IN ('draft_only','auto_reply_enabled','human_review_required','paused')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES support_conversations(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('customer','agent','owner','system')),
  body TEXT NOT NULL CHECK (length(body) BETWEEN 1 AND 10000),
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  approval_required BOOLEAN NOT NULL DEFAULT FALSE,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS automation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_key TEXT NOT NULL UNIQUE,
  job_type TEXT NOT NULL CHECK (job_type IN ('stock_check','price_check','shipment_sync','support_triage','site_health')),
  is_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  interval_minutes INTEGER NOT NULL CHECK (interval_minutes BETWEEN 5 AND 10080),
  last_started_at TIMESTAMPTZ,
  last_completed_at TIMESTAMPTZ,
  last_status TEXT NOT NULL DEFAULT 'never_run'
    CHECK (last_status IN ('never_run','running','success','failed','needs_attention')),
  last_result JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS product_inventory_product_idx ON product_inventory(product_id);
CREATE INDEX IF NOT EXISTS inventory_movements_inventory_time_idx ON inventory_movements(inventory_id, created_at DESC);
CREATE INDEX IF NOT EXISTS product_price_history_product_time_idx ON product_price_history(product_id, created_at DESC);
CREATE INDEX IF NOT EXISTS order_status_events_order_time_idx ON order_status_events(order_id, created_at DESC);
CREATE INDEX IF NOT EXISTS shipment_tracking_events_fulfilment_time_idx ON shipment_tracking_events(fulfilment_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS support_conversations_status_time_idx ON support_conversations(status, updated_at DESC);
CREATE INDEX IF NOT EXISTS support_messages_conversation_time_idx ON support_messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS automation_jobs_enabled_idx ON automation_jobs(is_enabled, job_type);

-- All operational tables are backend-only. Do not grant anon/authenticated access.
-- Add narrowly scoped server-role grants and RLS policies only after the auth provider
-- and deployment environment are configured and reviewed.
