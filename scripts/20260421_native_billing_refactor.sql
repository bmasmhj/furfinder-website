-- Native billing refactor (RevenueCat removal)

-- Normalize subscriptions table for backend-owned billing state
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS product_id TEXT,
  ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS latest_transaction_id TEXT;

UPDATE public.subscriptions
SET product_id = COALESCE(product_id, store_product_id),
    current_period_start = COALESCE(current_period_start, started_at),
    current_period_end = COALESCE(current_period_end, expires_at)
WHERE product_id IS NULL OR current_period_start IS NULL OR current_period_end IS NULL;

CREATE INDEX IF NOT EXISTS idx_subscriptions_product_id ON public.subscriptions(product_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_period_end ON public.subscriptions(current_period_end);

-- Immutable purchase event stream
CREATE TABLE IF NOT EXISTS public.purchase_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  platform VARCHAR(20) NOT NULL,
  event_type VARCHAR(64) NOT NULL,
  transaction_id TEXT,
  original_transaction_id TEXT,
  product_id TEXT,
  expires_at TIMESTAMPTZ,
  store_payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_purchase_events_user_id ON public.purchase_events(user_id);
CREATE INDEX IF NOT EXISTS idx_purchase_events_created_at ON public.purchase_events(created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_purchase_events_transaction_id
  ON public.purchase_events(transaction_id)
  WHERE transaction_id IS NOT NULL;

-- Webhook idempotency tracking
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  source VARCHAR(20) NOT NULL,
  event_id TEXT NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb,
  processed BOOLEAN NOT NULL DEFAULT false,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_webhook_events_source_event_id
  ON public.webhook_events(source, event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed
  ON public.webhook_events(processed, created_at DESC);
