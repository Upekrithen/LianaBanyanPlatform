-- K446a: Add conductor_mode preference column to members table
-- Migration: 20260425000001_k446a_conductor_mode_column.sql
-- Source: K446a Phase 1.4, Innovation #2277 (The Conductor's Baton)

-- Add conductor_mode column with default 'auto'
ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS conductor_mode TEXT
  NOT NULL
  DEFAULT 'auto'
  CHECK (conductor_mode IN ('auto', 'manual', 'vendor-lock'));

COMMENT ON COLUMN public.members.conductor_mode IS
  'Conductor routing mode preference (#2277). '
  'auto = automatic model selection (default); '
  'manual = member chooses model per query; '
  'vendor-lock = always use one vendor (audit/regulatory use case). '
  'Added K446a/B119.';

-- RLS: Members can read and update their own conductor_mode.
-- No new policies needed — existing members table policies cover this column.
-- Verify: existing "members can view own profile" and "members can update own profile"
-- policies (added in earlier migrations) apply to all columns including conductor_mode.
