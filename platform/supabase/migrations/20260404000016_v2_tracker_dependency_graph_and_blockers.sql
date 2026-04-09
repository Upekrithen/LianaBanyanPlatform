-- Session 274 (B075): connect v2 tracker dependencies to compilation status.

UPDATE v2_redesign_tracker
SET dependencies = CASE page_name
  WHEN 'Membership Page' THEN ARRAY['membership_program_brief']
  WHEN 'Welcome Gate Page' THEN ARRAY['welcome_gate_positioning']
  WHEN 'Cold Start Page' THEN ARRAY['cold_start_pathways']
  WHEN 'Ghost Browse Page' THEN ARRAY['ghost_browse_experience']
  WHEN 'Wallet Page' THEN ARRAY['wallet_three_currency_system']
  WHEN 'Captain Dashboard' THEN ARRAY['captain_system_levels']
  WHEN 'Cephas Gateway Page' THEN ARRAY['cephas_content_index', 'version_toggle_system']
  WHEN 'Cue Card Creator Page' THEN ARRAY['cue_card_program_brief']
  WHEN 'Marketplace Page' THEN ARRAY['storefront_system_compilation', 'cost_plus_20_policy']
  WHEN 'Transparency Ledger Page' THEN ARRAY['transparency_ledger_finance']
  WHEN 'Star Chamber Page' THEN ARRAY['star_chamber_areopagus_rules']
  WHEN 'Guild Directory Page' THEN ARRAY['guild_tribe_rules']
  WHEN 'Housing Hub Page' THEN ARRAY['housing_waterwheel_model', 'roommate_accountability_rules']
  WHEN 'Canister Configurator Page' THEN ARRAY['canister_system_specs']
  WHEN 'Beacon Run Creator Page' THEN ARRAY['beacon_treasure_map_system']
  WHEN 'Dispatch Compose Page' THEN ARRAY['dispatch_workflow_spec']
  WHEN 'Political Expedition Page' THEN ARRAY['political_expedition_legislative_sync']
  WHEN 'Calendar Page' THEN ARRAY['calendar_plug_interface']
  WHEN 'Family Table Hub' THEN ARRAY['family_table_compilation', 'guild_tribe_rules']
  WHEN 'Crew Call Board' THEN ARRAY['crew_call_marketplace', 'adapt_score_system']
  WHEN 'ADAPT Score Profile' THEN ARRAY['adapt_score_system']
  WHEN 'Tribe Directory' THEN ARRAY['guild_tribe_rules']
  WHEN 'Vehicle / Local Wheels' THEN ARRAY['vehicle_domain_sync', 'local_wheels_earn_down']
  WHEN 'Design Democracy' THEN ARRAY['design_democracy_seed_data', 'canister_system_specs']
  WHEN 'HexIsle Landing' THEN ARRAY['patent_bag_5', 'patent_bag_6']
  WHEN 'Storefront Builder' THEN ARRAY['patent_bag_9', 'storefront_system_compilation']
  WHEN 'Red Carpet Landing' THEN ARRAY['red_carpet_onboarding']
  WHEN 'LB Card' THEN ARRAY['lb_card_program_brief', 'patent_bag_8']
  WHEN 'Guided Tour' THEN ARRAY['guided_tour_onboarding']
  WHEN 'Pioneer Showcase' THEN ARRAY['pioneer_program_rules']
  WHEN 'Backer Election' THEN ARRAY['governance_backer_election']
  WHEN 'Content Shield' THEN ARRAY['defense_klaus_system', 'dmca_compliance_rules']
  WHEN 'Subscription Channels' THEN ARRAY['subscription_channel_system']
  WHEN 'Coalition' THEN ARRAY['coalition_alliance_system']
  WHEN 'Treasure Map Builder' THEN ARRAY['beacon_treasure_map_system', 'cephas_content_index']
  WHEN 'Bounty Photography' THEN ARRAY['bounty_photography_network', 'adapt_score_system']
  ELSE dependencies
END,
updated_at = now();

CREATE OR REPLACE FUNCTION v2_get_unmet_dependencies(p_dependencies TEXT[])
RETURNS TEXT[]
LANGUAGE plpgsql
AS $$
DECLARE
  unmet TEXT[];
BEGIN
  SELECT COALESCE(array_agg(dep ORDER BY dep), ARRAY[]::TEXT[])
  INTO unmet
  FROM unnest(COALESCE(p_dependencies, ARRAY[]::TEXT[])) AS dep
  WHERE NOT EXISTS (
    SELECT 1
    FROM compilation_status cs
    WHERE cs.family_name = dep
      AND cs.status = 'compiled'
  );

  RETURN COALESCE(unmet, ARRAY[]::TEXT[]);
END;
$$;

CREATE OR REPLACE VIEW v2_tracker_with_dependency_status AS
SELECT
  t.*,
  v2_get_unmet_dependencies(t.dependencies) AS unmet_dependencies,
  cardinality(v2_get_unmet_dependencies(t.dependencies)) > 0 AS has_unmet_dependencies
FROM v2_redesign_tracker t;

CREATE OR REPLACE FUNCTION v2_apply_blocked_status_to_row()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  unmet TEXT[];
BEGIN
  IF NEW.status IN ('completed', 'review') THEN
    RETURN NEW;
  END IF;

  unmet := v2_get_unmet_dependencies(NEW.dependencies);

  IF cardinality(unmet) > 0 THEN
    NEW.status := 'blocked';
  ELSIF NEW.status = 'blocked' THEN
    NEW.status := 'pending';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS v2_apply_blocked_status_before_write ON v2_redesign_tracker;
CREATE TRIGGER v2_apply_blocked_status_before_write
  BEFORE INSERT OR UPDATE OF status, dependencies ON v2_redesign_tracker
  FOR EACH ROW
  EXECUTE FUNCTION v2_apply_blocked_status_to_row();

CREATE OR REPLACE FUNCTION v2_refresh_blocked_status_from_compilation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE v2_redesign_tracker t
  SET status = CASE
      WHEN t.status IN ('completed', 'review') THEN t.status
      WHEN cardinality(v2_get_unmet_dependencies(t.dependencies)) > 0 THEN 'blocked'
      WHEN t.status = 'blocked' THEN 'pending'
      ELSE t.status
    END,
    updated_at = now()
  WHERE t.status NOT IN ('completed', 'review');

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS sync_v2_tracker_blocked ON compilation_status;
CREATE TRIGGER sync_v2_tracker_blocked
  AFTER INSERT OR UPDATE OF status, family_name OR DELETE ON compilation_status
  FOR EACH STATEMENT
  EXECUTE FUNCTION v2_refresh_blocked_status_from_compilation();

-- One-time backfill so status starts in sync with current compilation progress.
UPDATE v2_redesign_tracker t
SET status = CASE
    WHEN t.status IN ('completed', 'review') THEN t.status
    WHEN cardinality(v2_get_unmet_dependencies(t.dependencies)) > 0 THEN 'blocked'
    WHEN t.status = 'blocked' THEN 'pending'
    ELSE t.status
  END,
  updated_at = now()
WHERE t.status NOT IN ('completed', 'review');
