-- Phase 1 — Database Migrations for Subscription System

-- 1. Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    plan VARCHAR(50) NOT NULL DEFAULT 'premium',
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- active | expired | cancelled | in_trial
    source VARCHAR(20) NOT NULL, -- apple | google | stripe | manual
    store_product_id TEXT, -- e.g. 'premium_monthly', 'premium_yearly'
    revenuecat_customer_id TEXT,
    original_transaction_id TEXT, -- for receipt dedup
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);



-- 3. Update pricing_plans table
ALTER TABLE public.pricing_plans
  ADD COLUMN IF NOT EXISTS apple_product_id TEXT,
  ADD COLUMN IF NOT EXISTS google_product_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;
