-- B076 / Session 288: Battery Dispatch access gating
-- Included with commitment paths; not a separate paywall.

CREATE TABLE IF NOT EXISTS public.battery_dispatch_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_source TEXT NOT NULL CHECK (access_source IN (
    'influencer', 'project', 'harper', 'jukebox_artist', 'crown', 'captain', 'staff_override'
  )),
  source_ref_id TEXT,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'revoked')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, access_source, source_ref_id)
);

CREATE INDEX IF NOT EXISTS idx_bda_user ON public.battery_dispatch_access(user_id);
CREATE INDEX IF NOT EXISTS idx_bda_status ON public.battery_dispatch_access(status);
CREATE INDEX IF NOT EXISTS idx_bda_last_active ON public.battery_dispatch_access(last_active_at DESC);
CREATE INDEX IF NOT EXISTS idx_bda_source ON public.battery_dispatch_access(access_source);

ALTER TABLE public.battery_dispatch_access ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.user_is_battery_dispatch_staff()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() = 'service_role' THEN
    RETURN true;
  END IF;

  IF to_regclass('public.staff_members') IS NOT NULL THEN
    IF EXISTS (
      SELECT 1
      FROM public.staff_members sm
      WHERE sm.user_id = auth.uid()
    ) THEN
      RETURN true;
    END IF;
  END IF;

  IF to_regclass('public.user_roles') IS NOT NULL THEN
    IF EXISTS (
      SELECT 1
      FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('admin', 'staff')
    ) THEN
      RETURN true;
    END IF;
  END IF;

  IF to_regclass('public.crown_positions') IS NOT NULL THEN
    IF EXISTS (
      SELECT 1
      FROM public.crown_positions cp
      WHERE cp.holder_user_id = auth.uid()
    ) THEN
      RETURN true;
    END IF;
  END IF;

  IF to_regclass('public.guilds') IS NOT NULL THEN
    IF EXISTS (
      SELECT 1
      FROM public.guilds g
      WHERE g.guild_master_id = auth.uid()
    ) THEN
      RETURN true;
    END IF;
  END IF;

  RETURN false;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'battery_dispatch_access'
      AND policyname = 'Users read their own battery dispatch access'
  ) THEN
    CREATE POLICY "Users read their own battery dispatch access"
      ON public.battery_dispatch_access
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'battery_dispatch_access'
      AND policyname = 'Staff read all battery dispatch access'
  ) THEN
    CREATE POLICY "Staff read all battery dispatch access"
      ON public.battery_dispatch_access
      FOR SELECT
      USING (public.user_is_battery_dispatch_staff());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'battery_dispatch_access'
      AND policyname = 'Staff manage battery dispatch access'
  ) THEN
    CREATE POLICY "Staff manage battery dispatch access"
      ON public.battery_dispatch_access
      FOR ALL
      USING (public.user_is_battery_dispatch_staff())
      WITH CHECK (public.user_is_battery_dispatch_staff());
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.battery_dispatch_access_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_bda_set_updated_at ON public.battery_dispatch_access;
CREATE TRIGGER trg_bda_set_updated_at
BEFORE UPDATE ON public.battery_dispatch_access
FOR EACH ROW
EXECUTE FUNCTION public.battery_dispatch_access_set_updated_at();

CREATE OR REPLACE VIEW public.battery_dispatch_access_status AS
SELECT
  bda.user_id,
  BOOL_OR(bda.status = 'active') AS has_access,
  COALESCE(array_agg(DISTINCT bda.access_source) FILTER (WHERE bda.status = 'active'), ARRAY[]::TEXT[]) AS active_sources,
  MAX(bda.last_active_at) AS most_recent_activity,
  COUNT(*) FILTER (WHERE bda.status = 'active') AS active_grant_count
FROM public.battery_dispatch_access bda
GROUP BY bda.user_id;

CREATE OR REPLACE FUNCTION public.upsert_battery_dispatch_grant(
  p_user_id UUID,
  p_access_source TEXT,
  p_source_ref_id TEXT DEFAULT NULL,
  p_status TEXT DEFAULT 'active',
  p_notes TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_access_source NOT IN ('influencer', 'project', 'harper', 'jukebox_artist', 'crown', 'captain', 'staff_override') THEN
    RAISE EXCEPTION 'Invalid access source: %', p_access_source;
  END IF;

  IF p_status NOT IN ('active', 'suspended', 'revoked') THEN
    RAISE EXCEPTION 'Invalid status: %', p_status;
  END IF;

  INSERT INTO public.battery_dispatch_access (
    user_id, access_source, source_ref_id, status, notes, granted_at, last_active_at, created_at, updated_at
  )
  VALUES (
    p_user_id, p_access_source, p_source_ref_id, p_status, p_notes, now(), now(), now(), now()
  )
  ON CONFLICT (user_id, access_source, source_ref_id)
  DO UPDATE
    SET status = EXCLUDED.status,
        notes = COALESCE(EXCLUDED.notes, public.battery_dispatch_access.notes),
        last_active_at = now(),
        updated_at = now();
END;
$$;

REVOKE ALL ON FUNCTION public.upsert_battery_dispatch_grant(UUID, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.upsert_battery_dispatch_grant(UUID, TEXT, TEXT, TEXT, TEXT) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.touch_battery_dispatch_activity(
  p_user_id UUID,
  p_access_source TEXT,
  p_source_ref_id TEXT DEFAULT NULL,
  p_activity_at TIMESTAMPTZ DEFAULT now()
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.battery_dispatch_access
  SET
    last_active_at = GREATEST(last_active_at, p_activity_at),
    status = CASE WHEN status = 'revoked' THEN status ELSE 'active' END,
    updated_at = now()
  WHERE user_id = p_user_id
    AND access_source = p_access_source
    AND (
      (source_ref_id IS NULL AND p_source_ref_id IS NULL)
      OR source_ref_id = p_source_ref_id
    );
END;
$$;

REVOKE ALL ON FUNCTION public.touch_battery_dispatch_activity(UUID, TEXT, TEXT, TIMESTAMPTZ) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.touch_battery_dispatch_activity(UUID, TEXT, TEXT, TIMESTAMPTZ) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.refresh_battery_dispatch_access_status()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_90_days_ago TIMESTAMPTZ := now() - interval '90 days';
BEGIN
  -- Suspend stale grants (staff_override remains explicit until manually changed).
  UPDATE public.battery_dispatch_access
  SET status = 'suspended',
      updated_at = now()
  WHERE status = 'active'
    AND access_source <> 'staff_override'
    AND last_active_at < v_90_days_ago;

  -- Influencer reactivation: recent posted dispatch activity.
  IF to_regclass('public.member_scheduled_posts') IS NOT NULL THEN
    UPDATE public.battery_dispatch_access bda
    SET status = 'active',
        last_active_at = GREATEST(
          bda.last_active_at,
          COALESCE(
            (
              SELECT MAX(msp.posted_at)
              FROM public.member_scheduled_posts msp
              WHERE msp.user_id = bda.user_id
                AND msp.posted_at IS NOT NULL
                AND msp.posted_at > v_90_days_ago
            ),
            now()
          )
        ),
        updated_at = now()
    WHERE bda.access_source = 'influencer'
      AND bda.status = 'suspended'
      AND EXISTS (
        SELECT 1
        FROM public.member_scheduled_posts msp
        WHERE msp.user_id = bda.user_id
          AND msp.posted_at IS NOT NULL
          AND msp.posted_at > v_90_days_ago
      );
  END IF;

  -- Project-holder reactivation: project row updated recently.
  IF to_regclass('public.projects') IS NOT NULL THEN
    UPDATE public.battery_dispatch_access bda
    SET status = 'active',
        last_active_at = GREATEST(
          bda.last_active_at,
          COALESCE(
            (
              SELECT p.updated_at
              FROM public.projects p
              WHERE p.id::text = bda.source_ref_id
                AND p.updated_at > v_90_days_ago
              ORDER BY p.updated_at DESC
              LIMIT 1
            ),
            now()
          )
        ),
        updated_at = now()
    WHERE bda.access_source = 'project'
      AND bda.status = 'suspended'
      AND EXISTS (
        SELECT 1
        FROM public.projects p
        WHERE p.id::text = bda.source_ref_id
          AND p.updated_at > v_90_days_ago
      );
  END IF;

  -- Crown reactivation: active crown status.
  IF to_regclass('public.initiative_crowns') IS NOT NULL THEN
    UPDATE public.battery_dispatch_access bda
    SET status = 'active',
        last_active_at = now(),
        updated_at = now()
    WHERE bda.access_source = 'crown'
      AND bda.status = 'suspended'
      AND EXISTS (
        SELECT 1
        FROM public.initiative_crowns ic
        WHERE ic.id::text = bda.source_ref_id
          AND ic.crown_status = 'active'
      );
  END IF;

  -- Captain / Harper / Jukebox remain source-trigger driven and can be touched by
  -- source-specific events via touch_battery_dispatch_activity().
END;
$$;

REVOKE ALL ON FUNCTION public.refresh_battery_dispatch_access_status() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.refresh_battery_dispatch_access_status() TO service_role;

CREATE OR REPLACE FUNCTION public.grant_battery_dispatch_from_row()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_source TEXT := COALESCE(TG_ARGV[0], '');
  v_payload JSONB := to_jsonb(NEW);
  v_user_id UUID;
  v_ref_id TEXT;
  v_status TEXT;
  v_bool_active BOOLEAN;
BEGIN
  v_user_id := NULLIF(v_payload->>'user_id', '')::UUID;
  v_ref_id := COALESCE(v_payload->>'id', v_payload->>'project_id', v_payload->>'initiative_id');
  v_status := lower(COALESCE(v_payload->>'status', v_payload->>'harper_status', v_payload->>'crown_status'));
  v_bool_active := COALESCE(
    (v_payload->>'is_active')::BOOLEAN,
    true
  );

  IF v_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF v_source = 'project' THEN
    PERFORM public.upsert_battery_dispatch_grant(v_user_id, 'project', v_ref_id, 'active', 'Auto-granted from project path');
    RETURN NEW;
  END IF;

  IF v_source = 'crown' THEN
    IF v_status IN ('active', 'accepted', 'offered') THEN
      PERFORM public.upsert_battery_dispatch_grant(v_user_id, 'crown', v_ref_id, 'active', 'Auto-granted from crown path');
    END IF;
    RETURN NEW;
  END IF;

  IF v_source = 'captain' THEN
    IF v_status IS NULL OR v_status NOT IN ('revoked', 'resigned', 'inactive') THEN
      PERFORM public.upsert_battery_dispatch_grant(v_user_id, 'captain', v_ref_id, 'active', 'Auto-granted from captain path');
    END IF;
    RETURN NEW;
  END IF;

  IF v_source = 'harper' THEN
    IF v_status IN ('cub_harper', 'stamped_harper', 'harper', 'master_harper', 'active') THEN
      PERFORM public.upsert_battery_dispatch_grant(v_user_id, 'harper', v_ref_id, 'active', 'Auto-granted from Harper Guild path');
    END IF;
    RETURN NEW;
  END IF;

  IF v_source = 'jukebox_artist' THEN
    IF v_bool_active THEN
      PERFORM public.upsert_battery_dispatch_grant(v_user_id, 'jukebox_artist', v_ref_id, 'active', 'Auto-granted from Jukebox artist path');
    END IF;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF to_regclass('public.projects') IS NOT NULL THEN
    DROP TRIGGER IF EXISTS trg_bda_grant_from_project ON public.projects;
    CREATE TRIGGER trg_bda_grant_from_project
    AFTER INSERT OR UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.grant_battery_dispatch_from_row('project');
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.initiative_crowns') IS NOT NULL THEN
    DROP TRIGGER IF EXISTS trg_bda_grant_from_crown ON public.initiative_crowns;
    CREATE TRIGGER trg_bda_grant_from_crown
    AFTER INSERT OR UPDATE ON public.initiative_crowns
    FOR EACH ROW
    EXECUTE FUNCTION public.grant_battery_dispatch_from_row('crown');
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.harper_guild_members') IS NOT NULL THEN
    DROP TRIGGER IF EXISTS trg_bda_grant_from_harper ON public.harper_guild_members;
    CREATE TRIGGER trg_bda_grant_from_harper
    AFTER INSERT OR UPDATE ON public.harper_guild_members
    FOR EACH ROW
    EXECUTE FUNCTION public.grant_battery_dispatch_from_row('harper');
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.jukebox_artists') IS NOT NULL THEN
    DROP TRIGGER IF EXISTS trg_bda_grant_from_jukebox ON public.jukebox_artists;
    CREATE TRIGGER trg_bda_grant_from_jukebox
    AFTER INSERT OR UPDATE ON public.jukebox_artists
    FOR EACH ROW
    EXECUTE FUNCTION public.grant_battery_dispatch_from_row('jukebox_artist');
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.captains') IS NOT NULL THEN
    DROP TRIGGER IF EXISTS trg_bda_grant_from_captains ON public.captains;
    CREATE TRIGGER trg_bda_grant_from_captains
    AFTER INSERT OR UPDATE ON public.captains
    FOR EACH ROW
    EXECUTE FUNCTION public.grant_battery_dispatch_from_row('captain');
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.captain_profiles') IS NOT NULL THEN
    DROP TRIGGER IF EXISTS trg_bda_grant_from_captain_profiles ON public.captain_profiles;
    CREATE TRIGGER trg_bda_grant_from_captain_profiles
    AFTER INSERT OR UPDATE ON public.captain_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.grant_battery_dispatch_from_row('captain');
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'refresh-battery-dispatch-access') THEN
    PERFORM cron.unschedule('refresh-battery-dispatch-access');
  END IF;
END $$;

SELECT cron.schedule(
  'refresh-battery-dispatch-access',
  '0 2 * * *',
  $cron$
    SELECT public.refresh_battery_dispatch_access_status();
  $cron$
);
