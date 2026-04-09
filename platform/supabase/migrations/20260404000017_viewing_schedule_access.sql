-- Viewing Schedule access gate + analytics

CREATE TABLE IF NOT EXISTS public.platform_feature_flags (
  flag_key TEXT PRIMARY KEY,
  flag_value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS public.viewing_schedule_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE DEFAULT encode(extensions.gen_random_bytes(16), 'hex'),
  label TEXT,
  created_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ,
  max_uses INTEGER,
  use_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.viewing_schedule_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id UUID REFERENCES public.viewing_schedule_tokens(id),
  viewer_ip_hash TEXT,
  user_agent TEXT,
  referrer TEXT,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_viewing_schedule_tokens_token ON public.viewing_schedule_tokens(token);
CREATE INDEX IF NOT EXISTS idx_viewing_schedule_tokens_created_at ON public.viewing_schedule_tokens(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_viewing_schedule_views_token_id ON public.viewing_schedule_views(token_id);
CREATE INDEX IF NOT EXISTS idx_viewing_schedule_views_viewed_at ON public.viewing_schedule_views(viewed_at DESC);

INSERT INTO public.platform_feature_flags (flag_key, flag_value, description)
VALUES ('viewing_schedule_access', 'private', 'Access level: private | semi_public | public')
ON CONFLICT (flag_key) DO NOTHING;

ALTER TABLE public.platform_feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viewing_schedule_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viewing_schedule_views ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'platform_feature_flags'
      AND policyname = 'Anyone can read platform feature flags'
  ) THEN
    CREATE POLICY "Anyone can read platform feature flags"
      ON public.platform_feature_flags
      FOR SELECT
      USING (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'platform_feature_flags'
      AND policyname = 'Admins manage platform feature flags'
  ) THEN
    CREATE POLICY "Admins manage platform feature flags"
      ON public.platform_feature_flags
      FOR ALL
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'viewing_schedule_tokens'
      AND policyname = 'Admins manage viewing schedule tokens'
  ) THEN
    CREATE POLICY "Admins manage viewing schedule tokens"
      ON public.viewing_schedule_tokens
      FOR ALL
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'viewing_schedule_views'
      AND policyname = 'Admins read viewing schedule views'
  ) THEN
    CREATE POLICY "Admins read viewing schedule views"
      ON public.viewing_schedule_views
      FOR SELECT
      USING (public.is_admin());
  END IF;
END
$$;
