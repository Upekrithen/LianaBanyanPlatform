-- B076 follow-up: make auto-grant trigger extraction compatible with table variants.

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
  v_user_id := COALESCE(
    NULLIF(v_payload->>'user_id', '')::UUID,
    NULLIF(v_payload->>'owner_id', '')::UUID,
    NULLIF(v_payload->>'holder_user_id', '')::UUID,
    NULLIF(v_payload->>'captain_user_id', '')::UUID
  );
  v_ref_id := COALESCE(
    v_payload->>'id',
    v_payload->>'project_id',
    v_payload->>'initiative_id'
  );
  v_status := lower(
    COALESCE(
      v_payload->>'status',
      v_payload->>'harper_status',
      v_payload->>'crown_status'
    )
  );
  v_bool_active := COALESCE((v_payload->>'is_active')::BOOLEAN, true);

  IF v_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF v_source = 'project' THEN
    PERFORM public.upsert_battery_dispatch_grant(v_user_id, 'project', v_ref_id, 'active', 'Auto-granted from project path');
    RETURN NEW;
  END IF;

  IF v_source = 'crown' THEN
    IF v_status IS NULL OR v_status IN ('active', 'accepted', 'offered') THEN
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
  IF to_regclass('public.crown_positions') IS NOT NULL THEN
    DROP TRIGGER IF EXISTS trg_bda_grant_from_crown_positions ON public.crown_positions;
    CREATE TRIGGER trg_bda_grant_from_crown_positions
    AFTER INSERT OR UPDATE ON public.crown_positions
    FOR EACH ROW
    EXECUTE FUNCTION public.grant_battery_dispatch_from_row('crown');
  END IF;
END $$;
