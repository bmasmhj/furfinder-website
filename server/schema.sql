CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  consent_privacy BOOLEAN NOT NULL DEFAULT FALSE,
  consent_terms BOOLEAN NOT NULL DEFAULT FALSE,
  consent_ai BOOLEAN NOT NULL DEFAULT FALSE,
  consent_data_storage BOOLEAN NOT NULL DEFAULT FALSE,
  consent_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pet_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'lost',
  pet_type VARCHAR(20) NOT NULL,
  pet_name VARCHAR(255) NOT NULL,
  breed VARCHAR(255) NOT NULL DEFAULT '',
  size VARCHAR(20) NOT NULL DEFAULT 'medium',
  color VARCHAR(255) NOT NULL DEFAULT '',
  markings TEXT NOT NULL DEFAULT '',
  photo_uri TEXT NOT NULL DEFAULT '',
  photo_uris JSONB NOT NULL DEFAULT '[]',
  description TEXT NOT NULL DEFAULT '',
  latitude DOUBLE PRECISION NOT NULL DEFAULT 0,
  longitude DOUBLE PRECISION NOT NULL DEFAULT 0,
  location_name VARCHAR(500) NOT NULL DEFAULT '',
  last_seen_date VARCHAR(50) NOT NULL DEFAULT '',
  reward VARCHAR(100) NOT NULL DEFAULT '',
  reward_pool DOUBLE PRECISION NOT NULL DEFAULT 0,
  contact_name VARCHAR(255) NOT NULL DEFAULT '',
  contact_phone VARCHAR(100) NOT NULL DEFAULT '',
  show_contact_public BOOLEAN NOT NULL DEFAULT TRUE,
  reunion_message TEXT,
  reunion_date TIMESTAMPTZ,
  is_boosted BOOLEAN NOT NULL DEFAULT FALSE,
  boosted_at TIMESTAMPTZ,
  boost_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES pet_reports(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  author VARCHAR(255) NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES pet_reports(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pet_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pet_type VARCHAR(20) NOT NULL,
  pet_name VARCHAR(255) NOT NULL,
  breed VARCHAR(255) NOT NULL DEFAULT '',
  size VARCHAR(20) NOT NULL DEFAULT 'medium',
  color VARCHAR(255) NOT NULL DEFAULT '',
  markings TEXT NOT NULL DEFAULT '',
  photo_uris JSONB NOT NULL DEFAULT '[]',
  biometric_photo_uris JSONB NOT NULL DEFAULT '[]',
  microchip_number VARCHAR(100) NOT NULL DEFAULT '',
  medical_notes TEXT NOT NULL DEFAULT '',
  suburb VARCHAR(255) NOT NULL DEFAULT '',
  owner_name VARCHAR(255) NOT NULL DEFAULT '',
  owner_phone VARCHAR(100) NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(500) NOT NULL,
  message TEXT NOT NULL,
  report_id UUID,
  profile_id UUID,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS report_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES pet_reports(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(report_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_pet_reports_user_id ON pet_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_pet_reports_status ON pet_reports(status);
CREATE INDEX IF NOT EXISTS idx_pet_reports_location ON pet_reports(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_pet_reports_boosted ON pet_reports(is_boosted, boost_expires_at);
CREATE INDEX IF NOT EXISTS idx_pet_reports_type_status ON pet_reports(pet_type, status);
CREATE INDEX IF NOT EXISTS idx_pet_reports_type_status_geo ON pet_reports(pet_type, status, latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_pet_reports_created ON pet_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_report_id ON comments(report_id);
CREATE INDEX IF NOT EXISTS idx_timeline_report_id ON timeline_events(report_id);
CREATE INDEX IF NOT EXISTS idx_pet_profiles_user_id ON pet_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_report_likes_report_id ON report_likes(report_id);

ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code VARCHAR(10) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES users(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS premium_until TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(30) NOT NULL,
  days_awarded INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS social_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform VARCHAR(30) NOT NULL,
  shared_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, platform, shared_date)
);

CREATE TABLE IF NOT EXISTS blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);

CREATE TABLE IF NOT EXISTS content_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  report_id UUID REFERENCES pet_reports(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  reason VARCHAR(100) NOT NULL,
  details TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_rewards_user ON referral_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_social_shares_user ON social_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker ON blocked_users(blocker_id);
CREATE INDEX IF NOT EXISTS idx_content_reports_reporter ON content_reports(reporter_id);

ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'user';

CREATE TABLE IF NOT EXISTS organisations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL,
  abn VARCHAR(50),
  address TEXT NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  website VARCHAR(500),
  latitude DOUBLE PRECISION NOT NULL DEFAULT 0,
  longitude DOUBLE PRECISION NOT NULL DEFAULT 0,
  description TEXT,
  logo_uri TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS organisation_animals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  pet_type VARCHAR(20) NOT NULL,
  pet_name VARCHAR(255) NOT NULL DEFAULT '',
  breed VARCHAR(255) NOT NULL DEFAULT '',
  size VARCHAR(20) NOT NULL DEFAULT 'medium',
  color VARCHAR(255) NOT NULL DEFAULT '',
  markings TEXT NOT NULL DEFAULT '',
  photo_uris JSONB NOT NULL DEFAULT '[]',
  description TEXT NOT NULL DEFAULT '',
  intake_date DATE,
  intake_type VARCHAR(30) NOT NULL DEFAULT 'stray',
  microchip_number VARCHAR(100),
  desexed BOOLEAN NOT NULL DEFAULT FALSE,
  status VARCHAR(20) NOT NULL DEFAULT 'available',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES pet_reports(id) ON DELETE SET NULL,
  participant1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  participant2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_message_text TEXT NOT NULL DEFAULT '',
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(report_id, participant1_id, participant2_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_participant1 ON conversations(participant1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant2 ON conversations(participant2_id);

ALTER TABLE users ADD COLUMN IF NOT EXISTS push_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'user';

CREATE INDEX IF NOT EXISTS idx_organisations_user_id ON organisations(user_id);
CREATE INDEX IF NOT EXISTS idx_organisations_status ON organisations(status);
CREATE INDEX IF NOT EXISTS idx_org_animals_org_id ON organisation_animals(org_id);
CREATE INDEX IF NOT EXISTS idx_org_animals_status ON organisation_animals(status);
CREATE INDEX IF NOT EXISTS idx_org_animals_pet_type ON organisation_animals(pet_type);
