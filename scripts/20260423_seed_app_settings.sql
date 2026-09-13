-- Seed app_settings with configurable constants
-- Run: psql $DATABASE_URL -f migrations/20260423_seed_app_settings.sql

INSERT INTO public.app_settings (key, value) VALUES
  -- Subscription limits
  ('free_max_reports',                '1'),
  ('free_max_profiles',               '1'),
  ('free_max_photos',                 '1'),
  ('premium_max_photos',              '5'),

  -- AI detection caps (per day)
  ('free_ai_detections_per_day',      '0'),
  ('premium_ai_detections_per_day',   '10'),

  -- Pricing (USD)
  ('premium_monthly_price',           '4.99'),
  ('premium_yearly_price',            '49.99'),
  ('premium_yearly_savings_pct',      '17'),
  ('premium_monthly_breakdown',       '4.17'),
  ('premium_max_boosts_per_month',    '5'),

  -- Boost
  ('boost_price',                     '0.99'),
  ('boost_duration_days',             '7')

ON CONFLICT (key) DO UPDATE SET
  value      = EXCLUDED.value,
  updated_at = NOW();
