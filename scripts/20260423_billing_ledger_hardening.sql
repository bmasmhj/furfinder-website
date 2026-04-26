-- Billing ledger hardening:
-- 1) keep every new transaction event
-- 2) prevent duplicate inserts for same transaction id within platform+environment
-- 3) store key parsed fields from store payload for fast analytics/reconciliation

ALTER TABLE public.purchase_events
  ADD COLUMN IF NOT EXISTS environment VARCHAR(32) NOT NULL DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS transaction_reason VARCHAR(64),
  ADD COLUMN IF NOT EXISTS purchase_date_ms BIGINT,
  ADD COLUMN IF NOT EXISTS expires_date_ms BIGINT,
  ADD COLUMN IF NOT EXISTS original_purchase_date_ms BIGINT,
  ADD COLUMN IF NOT EXISTS web_order_line_item_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_group_id TEXT,
  ADD COLUMN IF NOT EXISTS ownership_type VARCHAR(64),
  ADD COLUMN IF NOT EXISTS country_code VARCHAR(8),
  ADD COLUMN IF NOT EXISTS storefront_country_code VARCHAR(8),
  ADD COLUMN IF NOT EXISTS app_bundle_id TEXT;

UPDATE public.purchase_events
SET environment = COALESCE(
  NULLIF(environment, ''),
  NULLIF(store_payload->>'environmentIOS', ''),
  NULLIF(store_payload->>'environment', ''),
  NULLIF(store_payload->'payload'->>'environmentIOS', ''),
  NULLIF(store_payload->'payload'->>'environment', ''),
  'unknown'
);

DROP INDEX IF EXISTS idx_purchase_events_transaction_id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_purchase_events_platform_environment_txn
  ON public.purchase_events(platform, environment, transaction_id)
  WHERE transaction_id IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_purchase_events_original_tx
  ON public.purchase_events(original_transaction_id, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_purchase_events_expires_date_ms
  ON public.purchase_events(expires_date_ms DESC)
  WHERE deleted_at IS NULL;
