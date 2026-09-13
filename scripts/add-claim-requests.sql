-- Migration: Add claim_requests table
-- Run this against your PostgreSQL database

CREATE TABLE IF NOT EXISTS public.claim_requests (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    lost_report_id uuid NOT NULL REFERENCES public.pet_reports(id) ON DELETE CASCADE,
    found_report_id uuid NOT NULL REFERENCES public.pet_reports(id) ON DELETE CASCADE,
    claimer_user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    found_user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status character varying(20) DEFAULT 'pending' NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT claim_requests_status_check CHECK (status IN ('pending', 'approved', 'rejected'))
);

ALTER TABLE public.claim_requests OWNER TO neondb_owner;

-- Index for quick lookup of claims by found_user_id (for found reporters checking claims)
CREATE INDEX IF NOT EXISTS idx_claim_requests_found_user_id ON public.claim_requests(found_user_id, status);

-- Index for quick lookup of claims by claimer_user_id (for lost owners checking sent claims)
CREATE INDEX IF NOT EXISTS idx_claim_requests_claimer_user_id ON public.claim_requests(claimer_user_id, status);

-- Prevent duplicate pending claims for the same pair
CREATE UNIQUE INDEX IF NOT EXISTS idx_claim_requests_unique_pending 
  ON public.claim_requests(lost_report_id, found_report_id) 
  WHERE status = 'pending';
