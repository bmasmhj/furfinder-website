-- Create pricing_features table
CREATE TABLE IF NOT EXISTS public.pricing_features (
    id SERIAL PRIMARY KEY,
    icon VARCHAR(50) NOT NULL,
    label VARCHAR(255) NOT NULL,
    free_value VARCHAR(100) NOT NULL,
    premium_value VARCHAR(100) NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Seed initial features
INSERT INTO public.pricing_features (icon, label, free_value, premium_value, display_order) VALUES
  ('search',           'AI Photo Detections', '0 / day',      '10 / day',   1),
  ('images',           'Photos per Profile',  '1 Photo',      '5 Photos',   2),
  ('document-text',    'Active Pet Profiles', '1 Profile',    'Unlimited',  3),
  ('megaphone',        'Active Lost Reports', '1 Report',     'Unlimited',  4),
  ('flash',            'Report Boosting',     'Standard',     'Priority',   5),
  ('shield-checkmark', 'Premium Badge',       'None',         'Included',   6)
ON CONFLICT DO NOTHING;
