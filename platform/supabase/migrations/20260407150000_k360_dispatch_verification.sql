-- K360: Dispatch Verification — Dead Letter Queue, Cron Wiring, Spoonful Pipeline
-- =================================================================================

-- ─── 1. Dead Letter Queue ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.dispatch_dead_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_post_id UUID,
  source_table TEXT NOT NULL DEFAULT 'member_scheduled_posts',
  platform TEXT NOT NULL,
  error_message TEXT,
  payload JSONB,
  attempt_count INTEGER DEFAULT 0,
  first_failed_at TIMESTAMPTZ,
  last_failed_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.dispatch_dead_letters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manages dead letters"
  ON public.dispatch_dead_letters FOR ALL
  USING (public.is_admin());

CREATE POLICY "Owner can view own dead letters"
  ON public.dispatch_dead_letters FOR SELECT
  USING (
    original_post_id IN (
      SELECT id FROM public.member_scheduled_posts WHERE user_id = auth.uid()
    )
    OR
    original_post_id IN (
      SELECT id FROM public.scheduled_posts WHERE user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_dead_letters_unresolved
  ON public.dispatch_dead_letters (resolved_at)
  WHERE resolved_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_dead_letters_platform
  ON public.dispatch_dead_letters (platform);

-- ─── 2. Add retry_count to member_scheduled_posts if missing ────────

ALTER TABLE public.member_scheduled_posts
  ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0;

-- ─── 3. Spoonful → scheduled_posts pipeline function ────────────────
-- When called with a pudding/spoonful ID + content, creates staggered
-- scheduled_posts entries respecting the Concurrent Distribution Grid:
-- Twitter immediately, LinkedIn +2h, Instagram +4h.
-- No two posts from same pudding within 6h on same platform.

CREATE OR REPLACE FUNCTION public.create_spoonful_dispatch(
  p_user_id UUID,
  p_pudding_slug TEXT,
  p_content TEXT,
  p_hashtags TEXT[] DEFAULT ARRAY['#Spoonfuls', '#LianaBanyan'],
  p_link_url TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_batch_id UUID := gen_random_uuid();
  v_base_time TIMESTAMPTZ := now();
  v_twitter_account UUID;
  v_linkedin_account UUID;
  v_instagram_account UUID;
  v_bluesky_account UUID;
  v_last_same_pudding TIMESTAMPTZ;
  v_created_count INT := 0;
  v_platforms JSONB := '[]'::JSONB;
BEGIN
  -- Check 6-hour Concurrent Distribution Grid: no same-pudding post within 6h on any platform
  SELECT MAX(scheduled_for) INTO v_last_same_pudding
  FROM public.member_scheduled_posts
  WHERE user_id = p_user_id
    AND content LIKE '%' || p_pudding_slug || '%'
    AND status IN ('scheduled', 'posting', 'posted')
    AND scheduled_for > (now() - INTERVAL '6 hours');

  IF v_last_same_pudding IS NOT NULL THEN
    v_base_time := v_last_same_pudding + INTERVAL '6 hours';
  END IF;

  -- Look up active accounts per platform
  SELECT id INTO v_twitter_account FROM public.member_social_accounts
    WHERE user_id = p_user_id AND platform = 'twitter' AND is_active = true
    ORDER BY is_default DESC LIMIT 1;

  SELECT id INTO v_linkedin_account FROM public.member_social_accounts
    WHERE user_id = p_user_id AND platform = 'linkedin' AND is_active = true
    ORDER BY is_default DESC LIMIT 1;

  SELECT id INTO v_instagram_account FROM public.member_social_accounts
    WHERE user_id = p_user_id AND platform = 'instagram' AND is_active = true
    ORDER BY is_default DESC LIMIT 1;

  SELECT id INTO v_bluesky_account FROM public.member_social_accounts
    WHERE user_id = p_user_id AND platform = 'bluesky' AND is_active = true
    ORDER BY is_default DESC LIMIT 1;

  -- Twitter: immediately (or after grid delay)
  IF v_twitter_account IS NOT NULL THEN
    INSERT INTO public.member_scheduled_posts (
      user_id, social_account_id, platform, content, hashtags, link_url,
      scheduled_for, status, dispatch_mode, dispatch_batch_id
    ) VALUES (
      p_user_id, v_twitter_account, 'twitter', p_content, p_hashtags, p_link_url,
      v_base_time, 'scheduled', 'spoonful_auto', v_batch_id
    );
    v_created_count := v_created_count + 1;
    v_platforms := v_platforms || '"twitter"'::JSONB;
  END IF;

  -- LinkedIn: +2 hours
  IF v_linkedin_account IS NOT NULL THEN
    INSERT INTO public.member_scheduled_posts (
      user_id, social_account_id, platform, content, hashtags, link_url,
      scheduled_for, status, dispatch_mode, dispatch_batch_id
    ) VALUES (
      p_user_id, v_linkedin_account, 'linkedin', p_content, p_hashtags, p_link_url,
      v_base_time + INTERVAL '2 hours', 'scheduled', 'spoonful_auto', v_batch_id
    );
    v_created_count := v_created_count + 1;
    v_platforms := v_platforms || '"linkedin"'::JSONB;
  END IF;

  -- Instagram: +4 hours
  IF v_instagram_account IS NOT NULL THEN
    INSERT INTO public.member_scheduled_posts (
      user_id, social_account_id, platform, content, hashtags, link_url,
      scheduled_for, status, dispatch_mode, dispatch_batch_id
    ) VALUES (
      p_user_id, v_instagram_account, 'instagram', p_content, p_hashtags, p_link_url,
      v_base_time + INTERVAL '4 hours', 'scheduled', 'spoonful_auto', v_batch_id
    );
    v_created_count := v_created_count + 1;
    v_platforms := v_platforms || '"instagram"'::JSONB;
  END IF;

  -- Bluesky: +1 hour (between Twitter and LinkedIn)
  IF v_bluesky_account IS NOT NULL THEN
    INSERT INTO public.member_scheduled_posts (
      user_id, social_account_id, platform, content, hashtags, link_url,
      scheduled_for, status, dispatch_mode, dispatch_batch_id
    ) VALUES (
      p_user_id, v_bluesky_account, 'bluesky', p_content, p_hashtags, p_link_url,
      v_base_time + INTERVAL '1 hour', 'scheduled', 'spoonful_auto', v_batch_id
    );
    v_created_count := v_created_count + 1;
    v_platforms := v_platforms || '"bluesky"'::JSONB;
  END IF;

  -- Audit log
  INSERT INTO public.dispatch_audit_log (user_id, batch_id, dispatch_mode, platform_count, platforms, base_content)
  VALUES (p_user_id, v_batch_id, 'spoonful_auto', v_created_count, ARRAY(SELECT jsonb_array_elements_text(v_platforms)), left(p_content, 500));

  RETURN jsonb_build_object(
    'batch_id', v_batch_id,
    'created_count', v_created_count,
    'base_time', v_base_time,
    'platforms', v_platforms
  );
END;
$$;

-- ─── 4. Dead letter resolution RPC ──────────────────────────────────

CREATE OR REPLACE FUNCTION public.resolve_dead_letter(
  p_dead_letter_id UUID,
  p_action TEXT DEFAULT 'dismiss',
  p_notes TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin only';
  END IF;

  IF p_action = 'retry' THEN
    UPDATE public.member_scheduled_posts
    SET status = 'scheduled',
        retry_count = 0,
        error_message = NULL,
        scheduled_for = now() + INTERVAL '5 minutes',
        updated_at = now()
    WHERE id = (SELECT original_post_id FROM public.dispatch_dead_letters WHERE id = p_dead_letter_id);

    UPDATE public.scheduled_posts
    SET status = 'scheduled',
        retry_count = 0,
        error_message = NULL,
        scheduled_for = now() + INTERVAL '5 minutes',
        updated_at = now()
    WHERE id = (SELECT original_post_id FROM public.dispatch_dead_letters WHERE id = p_dead_letter_id);
  END IF;

  UPDATE public.dispatch_dead_letters
  SET resolved_at = now(),
      resolved_by = auth.uid(),
      resolution_notes = COALESCE(p_notes, p_action)
  WHERE id = p_dead_letter_id;
END;
$$;

-- ─── 5. Cron schedule verification / wiring ─────────────────────────
-- These SELECT statements verify expected cron entries exist.
-- If pg_cron is available and entries are missing, they get created.
-- Safe to re-run: uses cron.schedule which upserts by job name.

DO $outer$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    -- process-scheduled-posts: every 15 min
    PERFORM cron.schedule(
      'process-scheduled-posts',
      '*/15 * * * *',
      $$SELECT net.http_post(
        url := current_setting('app.settings.supabase_url') || '/functions/v1/process-scheduled-posts',
        headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')),
        body := '{}'::jsonb
      );$$
    );

    -- dispatch-crewman-episode: hourly
    PERFORM cron.schedule(
      'dispatch-crewman-episode',
      '0 * * * *',
      $$SELECT net.http_post(
        url := current_setting('app.settings.supabase_url') || '/functions/v1/dispatch-crewman-episode',
        headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')),
        body := '{}'::jsonb
      );$$
    );

    -- crewman-distribution-analytics-daily: 2:15 AM UTC
    PERFORM cron.schedule(
      'crewman-distribution-analytics-daily',
      '15 2 * * *',
      $$SELECT net.http_post(
        url := current_setting('app.settings.supabase_url') || '/functions/v1/track-crewman-engagement',
        headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')),
        body := '{"mode":"daily_analytics"}'::jsonb
      );$$
    );

    RAISE NOTICE 'pg_cron jobs scheduled: process-scheduled-posts (*/15), dispatch-crewman-episode (hourly), crewman-distribution-analytics-daily (2:15 AM)';
  ELSE
    RAISE NOTICE 'pg_cron extension not available — cron jobs must be configured in Supabase Dashboard';
  END IF;
END $outer$;
