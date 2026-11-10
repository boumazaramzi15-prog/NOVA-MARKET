-- NOVA MARKET payment ledger blueprint
-- Draft only: not applied to a live database.
-- Store amounts in minor units; never store PAN, CVV, or payment credentials.
-- This ledger is for NOVA-owned product orders only, not peer-to-peer listings.

CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_reference TEXT NOT NULL,
  provider_code TEXT NOT NULL,
  provider_checkout_id TEXT,
  provider_transaction_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','authorized','paid','failed','cancelled','partially_refunded','refunded','disputed')),
  amount_minor BIGINT NOT NULL CHECK (amount_minor > 0),
  currency CHAR(3) NOT NULL CHECK (currency = upper(currency)),
  provider_fee_minor BIGINT CHECK (provider_fee_minor IS NULL OR provider_fee_minor >= 0),
  idempotency_key TEXT NOT NULL UNIQUE,
  provider_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ,
  UNIQUE (provider_code, provider_transaction_id)
);

CREATE INDEX IF NOT EXISTS payment_transactions_order_idx
  ON payment_transactions(order_reference, created_at DESC);
CREATE INDEX IF NOT EXISTS payment_transactions_status_idx
  ON payment_transactions(status, created_at DESC);

CREATE TABLE IF NOT EXISTS payment_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_code TEXT NOT NULL,
  provider_event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  signature_verified BOOLEAN NOT NULL DEFAULT FALSE,
  processing_status TEXT NOT NULL DEFAULT 'received'
    CHECK (processing_status IN ('received','processed','ignored','failed')),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  UNIQUE (provider_code, provider_event_id)
);

CREATE INDEX IF NOT EXISTS payment_webhook_events_status_idx
  ON payment_webhook_events(processing_status, received_at);

CREATE TABLE IF NOT EXISTS payment_refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payment_transactions(id),
  provider_refund_id TEXT,
  amount_minor BIGINT NOT NULL CHECK (amount_minor > 0),
  currency CHAR(3) NOT NULL CHECK (currency = upper(currency)),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','succeeded','failed')),
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (provider_refund_id)
);

-- Provider secrets belong only in the production secret manager/environment.
-- Never add card data or provider secrets to this schema, frontend, or Git.
