BEGIN;

ALTER TABLE IF EXISTS public.ads ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE IF EXISTS public.analytics_events ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE IF EXISTS public.app_settings ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE IF EXISTS public.blocked_users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE IF EXISTS public.blogs ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE IF EXISTS public.comments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE IF EXISTS public.content_reports ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE IF EXISTS public.conversations ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE IF EXISTS public.faqs ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE IF EXISTS public.features ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE IF EXISTS public.how_it_works_steps ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE IF EXISTS public.messages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE IF EXISTS public.notifications ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE IF EXISTS public.organisation_animals ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE IF EXISTS public.organisations ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE IF EXISTS public.pet_profiles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE IF EXISTS public.pet_reports ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE IF EXISTS public.pricing_plans ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE IF EXISTS public.referral_rewards ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE IF EXISTS public.report_likes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE IF EXISTS public.reunited_stories ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE IF EXISTS public.social_shares ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE IF EXISTS public.timeline_events ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE IF EXISTS public.who_its_for_segments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE IF EXISTS public.claim_requests ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE IF EXISTS public.subscriptions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE IF EXISTS public.purchase_events ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE IF EXISTS public.webhook_events ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE IF EXISTS public.saved_pets ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Convert strict uniqueness to active-row uniqueness for soft-delete tables.
ALTER TABLE IF EXISTS public.blocked_users
  DROP CONSTRAINT IF EXISTS blocked_users_blocker_id_blocked_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_blocked_users_unique_active
  ON public.blocked_users (blocker_id, blocked_id)
  WHERE deleted_at IS NULL;

ALTER TABLE IF EXISTS public.report_likes
  DROP CONSTRAINT IF EXISTS report_likes_report_id_user_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_report_likes_unique_active
  ON public.report_likes (report_id, user_id)
  WHERE deleted_at IS NULL;

ALTER TABLE IF EXISTS public.social_shares
  DROP CONSTRAINT IF EXISTS social_shares_user_id_platform_shared_date_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_social_shares_unique_active
  ON public.social_shares (user_id, platform, shared_date)
  WHERE deleted_at IS NULL;

ALTER TABLE IF EXISTS public.conversations
  DROP CONSTRAINT IF EXISTS conversations_report_id_participant1_id_participant2_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_conversations_unique_active
  ON public.conversations (report_id, participant1_id, participant2_id)
  WHERE deleted_at IS NULL;

DROP INDEX IF EXISTS public.idx_claim_requests_unique_pending;
CREATE UNIQUE INDEX IF NOT EXISTS idx_claim_requests_unique_pending_active
  ON public.claim_requests (lost_report_id, found_report_id)
  WHERE status = 'pending' AND deleted_at IS NULL;

DO $$
BEGIN
  IF to_regclass('public.saved_pets') IS NOT NULL THEN
    ALTER TABLE public.saved_pets
      DROP CONSTRAINT IF EXISTS saved_pets_user_id_pet_id_key;

    CREATE UNIQUE INDEX IF NOT EXISTS idx_saved_pets_unique_active
      ON public.saved_pets (user_id, pet_id)
      WHERE deleted_at IS NULL;
  END IF;
END $$;

-- Helpful lookup indexes.
CREATE INDEX IF NOT EXISTS idx_pet_reports_deleted_at ON public.pet_reports (deleted_at);
CREATE INDEX IF NOT EXISTS idx_pet_profiles_deleted_at ON public.pet_profiles (deleted_at);
CREATE INDEX IF NOT EXISTS idx_notifications_deleted_at ON public.notifications (deleted_at);
CREATE INDEX IF NOT EXISTS idx_claim_requests_deleted_at ON public.claim_requests (deleted_at);
DO $$
BEGIN
  IF to_regclass('public.saved_pets') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_saved_pets_deleted_at ON public.saved_pets (deleted_at);
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_report_likes_deleted_at ON public.report_likes (deleted_at);

COMMIT;
