-- Add membership stake payment tracking columns to user_credits
-- These were applied directly to production DB during Session 57 payment debugging.
-- This migration codifies them so local/staging environments stay in sync.

ALTER TABLE public.user_credits
  ADD COLUMN IF NOT EXISTS membership_stake_paid boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS membership_stake_paid_at timestamptz;
