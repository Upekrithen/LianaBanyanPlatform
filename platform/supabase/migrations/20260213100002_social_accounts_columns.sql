-- ============================================
-- SOCIAL ACCOUNTS COLUMN ADDITIONS
-- Migration: 20260213100001_social_accounts_columns.sql
-- Purpose: Add missing columns needed by socialOAuth.ts and social-post edge function
-- ============================================

-- Add missing columns to member_social_accounts
-- These are needed for proper token management and display

-- account_handle: For storing display handles (e.g., @handle on Twitter, handle on Bluesky)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'member_social_accounts'
      AND column_name = 'account_handle'
  ) THEN
    ALTER TABLE public.member_social_accounts ADD COLUMN account_handle text;
  END IF;
END $$;

-- last_used_at: Track when the account was last used for posting
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'member_social_accounts'
      AND column_name = 'last_used_at'
  ) THEN
    ALTER TABLE public.member_social_accounts ADD COLUMN last_used_at timestamptz;
  END IF;
END $$;

-- updated_at: Standard timestamp for when the record was last modified
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'member_social_accounts'
      AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.member_social_accounts ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- ─── RLS POLICIES ───
-- Enable RLS if not already enabled
ALTER TABLE public.member_social_accounts ENABLE ROW LEVEL SECURITY;

-- Users can view their own social accounts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'member_social_accounts'
      AND policyname = 'Users can view own social accounts'
  ) THEN
    CREATE POLICY "Users can view own social accounts"
      ON public.member_social_accounts
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Users can insert their own social accounts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'member_social_accounts'
      AND policyname = 'Users can insert own social accounts'
  ) THEN
    CREATE POLICY "Users can insert own social accounts"
      ON public.member_social_accounts
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Users can update their own social accounts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'member_social_accounts'
      AND policyname = 'Users can update own social accounts'
  ) THEN
    CREATE POLICY "Users can update own social accounts"
      ON public.member_social_accounts
      FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Users can delete (disconnect) their own social accounts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'member_social_accounts'
      AND policyname = 'Users can delete own social accounts'
  ) THEN
    CREATE POLICY "Users can delete own social accounts"
      ON public.member_social_accounts
      FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Service role can access all (for edge functions)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'member_social_accounts'
      AND policyname = 'Service role full access to social accounts'
  ) THEN
    CREATE POLICY "Service role full access to social accounts"
      ON public.member_social_accounts
      FOR ALL
      USING (auth.jwt() ->> 'role' = 'service_role');
  END IF;
END $$;

-- ─── MEMBER_SCHEDULED_POSTS ADDITIONS ───

-- Add time_zone column if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'member_scheduled_posts'
      AND column_name = 'time_zone'
  ) THEN
    ALTER TABLE public.member_scheduled_posts ADD COLUMN time_zone text;
  END IF;
END $$;

-- Add hashtags column if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'member_scheduled_posts'
      AND column_name = 'hashtags'
  ) THEN
    ALTER TABLE public.member_scheduled_posts ADD COLUMN hashtags text[];
  END IF;
END $$;

-- Add link_url column if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'member_scheduled_posts'
      AND column_name = 'link_url'
  ) THEN
    ALTER TABLE public.member_scheduled_posts ADD COLUMN link_url text;
  END IF;
END $$;

-- RLS for scheduled posts
ALTER TABLE public.member_scheduled_posts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'member_scheduled_posts'
      AND policyname = 'Users can manage own scheduled posts'
  ) THEN
    CREATE POLICY "Users can manage own scheduled posts"
      ON public.member_scheduled_posts
      FOR ALL
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- ─── INDEXES ───
CREATE INDEX IF NOT EXISTS idx_member_social_accounts_user
  ON public.member_social_accounts(user_id);

CREATE INDEX IF NOT EXISTS idx_member_social_accounts_platform
  ON public.member_social_accounts(user_id, platform);

CREATE INDEX IF NOT EXISTS idx_member_scheduled_posts_user_status
  ON public.member_scheduled_posts(user_id, status, scheduled_for);
