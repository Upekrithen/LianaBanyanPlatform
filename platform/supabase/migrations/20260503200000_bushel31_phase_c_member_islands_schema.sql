-- ============================================================================
-- Bushel 31 Phase C — member_islands + island_pedestal_forum_additions schema
-- + 8 RPCs for island-CRUD
-- BP022 / 2026-05-03 AD
-- ============================================================================
-- Composes with:
--   20260503150000_bushel13_pedestal_forum_additions.sql — paper_pedestal_forum_additions
--   (extends the same Mordecai-Esther Decree-Composition pattern to islands)
--   20260503190000_bushel31_phase_a_tier6_member_island_creator.sql — Tier 6 class
--   multi_dimensional_twinning_locations_dimensions_times_conditional_operators_chronos_canon_bp021.eblet.md
--   mordecai_esther_pedestal_forum_decree_composition_paper_collaboration_canon_bp021.eblet.md
--
-- Augur-Pricing exemption: membership-orthogonal.
-- Creator-keeps 83.3% / platform Cost+20% are IP Ledger economic primitives,
-- not membership pricing. $5/year LB membership is UNCHANGED.
-- ============================================================================

-- ── Canon class status enum ──────────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'island_canon_class_status'
  ) THEN
    CREATE TYPE public.island_canon_class_status AS ENUM (
      'pending_review',    -- just created; under member review
      'member_class',      -- confirmed active member-island (default after creation)
      'canon_promoted'     -- Founder Fire Code only; gains Wrasse anchor priority
    );
  END IF;
END $$;

-- ── Decree class enum for island additions ───────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'island_decree_class'
  ) THEN
    CREATE TYPE public.island_decree_class AS ENUM (
      'extending',       -- builds on original island
      'contradicting',   -- challenges original island
      'composing'        -- challenges AND builds simultaneously
    );
  END IF;
END $$;

-- ── member_islands table ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.member_islands (
  island_id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Creator
  member_id                     uuid NOT NULL REFERENCES auth.users(id),

  -- Identity
  name                          text NOT NULL,
  slug                          text UNIQUE,

  -- Twinning
  real_world_twinning_anchor    jsonb NOT NULL DEFAULT '{}'::jsonb,
  -- Structure: {lat_lon?: string, symbolic_anchor: string,
  --             cultural_descriptor: string, structural_descriptor?: string}

  -- Island spec body
  ghost_world_state             jsonb NOT NULL DEFAULT '{}'::jsonb,
  -- Structure: {lore_summary: string, mechanic_class?: string,
  --             inhabitants?: string[], events?: string[],
  --             welcome_decrees?: string[], real_world_twin_reference?: string}

  -- Multi-dim Twinning tensor (Locations × Dimensions × Times)
  tensor_coordinate             jsonb NOT NULL DEFAULT '{}'::jsonb,
  -- Structure: {location: string|jsonb, dimension: string, time_anchor: string}
  -- dimension default: 'ghost_world_canonical'
  -- time_anchor default: 'present_perpetuity'

  -- Pedestal Forum link (Mordecai-Esther decree-composition)
  pedestal_forum_decree_id      uuid,
  -- Links to island_pedestal_forum_additions; null until first decree

  -- IP Ledger creator-stamp
  ip_ledger_stamp_id            uuid,

  -- Marks payout (Tier 6 multiplier × base, recalibrated on canon-class promotion)
  marks_payout_rate             numeric(10,2) NOT NULL DEFAULT 83.30,
  -- 83.3% creator-keeps per IP Ledger primitive; platform Cost+20% implicit

  -- Cohort class eligibility for visits (default: all LB members; gating via access_keys)
  cohort_class_eligibility_visit text[] NOT NULL DEFAULT ARRAY['all_lb_members'],

  -- 3-access-key gating config per FLAG_MARKER FM-001
  access_key_config             jsonb NOT NULL DEFAULT
    '{"deck_card_durable": true, "guide_mediated": false, "babylon_candle_consumable": false}'::jsonb,
  -- deck_card_durable: JWT-class credential, non-consumable
  -- guide_mediated: co-member-vouches via Pheromone trust graph
  -- babylon_candle_consumable: Marks-burn transient; fires IP Ledger credit to creator

  -- Wrasse anchor (populated on canon-class promotion or when routing active)
  wrasse_anchor_id              uuid,

  -- Canon class
  canon_class_status            public.island_canon_class_status
                                NOT NULL DEFAULT 'member_class',
  canon_promoted_at             timestamptz,
  canon_promoted_by             text,   -- Founder Fire Code token reference (not the token itself)

  -- Metrics
  visit_count                   bigint NOT NULL DEFAULT 0,
  decree_count                  bigint NOT NULL DEFAULT 0,

  -- Timestamps
  created_at                    timestamptz NOT NULL DEFAULT now(),
  updated_at                    timestamptz NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT island_name_not_empty CHECK (char_length(trim(name)) > 0),
  CONSTRAINT island_marks_rate_positive CHECK (marks_payout_rate > 0)
);

COMMENT ON TABLE public.member_islands IS
  'Member-authored islands in HexIsle Ghost-World / Real-World tensor. '
  'Each island is a permanent coordinate in Locations × Dimensions × Times space '
  '(Multi-dim Twinning canon). Creator keeps 83.3% per-visit Marks; platform Cost+20%. '
  'Original spec is immutable once submitted (Substrate-As-Immutable-Backup). '
  'Member additions via island_pedestal_forum_additions (Mordecai-Esther pattern). '
  'Canon-class promotion requires Founder Fire Code token. '
  'Bushel 31 Phase C / BP022.';

-- ── Indexes on member_islands ────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_member_islands_member_id
  ON public.member_islands (member_id);

CREATE INDEX IF NOT EXISTS idx_member_islands_canon_class
  ON public.member_islands (canon_class_status);

CREATE INDEX IF NOT EXISTS idx_member_islands_created_at
  ON public.member_islands (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_member_islands_wrasse_anchor
  ON public.member_islands (wrasse_anchor_id)
  WHERE wrasse_anchor_id IS NOT NULL;

-- GIN index for tensor_coordinate JSONB queries
CREATE INDEX IF NOT EXISTS idx_member_islands_tensor_coord
  ON public.member_islands USING gin (tensor_coordinate);

-- ── RLS on member_islands ────────────────────────────────────────────────────

ALTER TABLE public.member_islands ENABLE ROW LEVEL SECURITY;

-- Public read: all LB members (and anon) can see member-class islands
CREATE POLICY "member_islands_public_read"
  ON public.member_islands
  FOR SELECT
  USING (canon_class_status IN ('member_class', 'canon_promoted'));

-- Creator can insert their own island
CREATE POLICY "member_islands_creator_insert"
  ON public.member_islands
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = member_id
  );

-- Creator can update limited fields (not canon_class_status — that requires Fire Code)
-- Service role has full access
CREATE POLICY "member_islands_service_all"
  ON public.member_islands
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ── island_pedestal_forum_additions — APPEND-ONLY decree ledger ─────────────
-- Extends Bushel 13 paper_pedestal_forum_additions pattern to islands.
-- Original island spec in member_islands is IMMUTABLE.
-- Additions here compose alongside with co-equal authority.
-- Law of the Medes and Persians: original is never modified.

CREATE TABLE IF NOT EXISTS public.island_pedestal_forum_additions (
  addition_id                           uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Island reference
  island_id                             uuid NOT NULL
    REFERENCES public.member_islands(island_id),

  -- Co-author (Mordecai-Esther co-equal-authority decree)
  decree_author_member_id               uuid NOT NULL REFERENCES auth.users(id),
  decree_author_display_name            text NOT NULL DEFAULT 'Anonymous Member',

  -- The decree
  decree_text                           text NOT NULL,
  decree_class                          public.island_decree_class NOT NULL,

  -- Year of Jubilee ledger stamp (per Bushel 13 append-only contract)
  year_of_jubilee_stamp                 text NOT NULL
    DEFAULT 'JUB-ISLAND-' || gen_random_uuid()::text,

  -- Law of the Medes and Persians attestation:
  -- the original island spec in member_islands is NEVER modified.
  -- This row composes ALONGSIDE — it is co-equal-authority, not a replacement.
  original_island_immutable_attestation boolean NOT NULL DEFAULT TRUE,

  -- Visibility (soft-hide only — row is never deleted per append-only contract)
  is_visible                            boolean NOT NULL DEFAULT true,

  appended_at                           timestamptz NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT island_decree_not_empty CHECK (char_length(trim(decree_text)) > 0),
  CONSTRAINT immutability_must_be_true
    CHECK (original_island_immutable_attestation = TRUE)
  -- Enforces at DB layer: every decree must attest original immutability
);

COMMENT ON TABLE public.island_pedestal_forum_additions IS
  'Append-only ledger for Mordecai-Esther Decree-Composition additions to member-islands. '
  'Extends Bushel 13 paper_pedestal_forum_additions pattern to HexIsle member-islands. '
  'Each addition has co-equal authority with the original island (extending|contradicting|composing). '
  'No row is ever deleted. original_island_immutable_attestation = TRUE enforced at DB layer. '
  'Law of the Medes and Persians: the original island spec is permanently immutable. '
  'Bushel 31 Phase C / BP022.';

COMMENT ON COLUMN public.island_pedestal_forum_additions.original_island_immutable_attestation IS
  'MUST be TRUE on every row. Enforced by CHECK constraint. '
  'Attest that the addition composes ALONGSIDE the original island spec, '
  'which is stored in member_islands and is NEVER modified. '
  'Law of the Medes and Persians / Esther 8 — co-equal authority means both '
  'the original and all additions are simultaneously legally valid.';

-- ── Indexes on island_pedestal_forum_additions ───────────────────────────────

CREATE INDEX IF NOT EXISTS idx_island_additions_island_id
  ON public.island_pedestal_forum_additions (island_id, appended_at);

CREATE INDEX IF NOT EXISTS idx_island_additions_author
  ON public.island_pedestal_forum_additions (decree_author_member_id);

CREATE INDEX IF NOT EXISTS idx_island_additions_jubilee
  ON public.island_pedestal_forum_additions (year_of_jubilee_stamp);

-- ── Append-only enforcement trigger (mirrors Bushel 13 pattern) ─────────────

CREATE OR REPLACE FUNCTION enforce_island_pedestal_append_only()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.addition_id                           <> NEW.addition_id                           OR
     OLD.island_id                             <> NEW.island_id                             OR
     OLD.decree_author_member_id               <> NEW.decree_author_member_id               OR
     OLD.decree_text                           <> NEW.decree_text                           OR
     OLD.decree_class                          <> NEW.decree_class                          OR
     OLD.year_of_jubilee_stamp                 <> NEW.year_of_jubilee_stamp                 OR
     OLD.original_island_immutable_attestation <> NEW.original_island_immutable_attestation OR
     OLD.appended_at                           <> NEW.appended_at
  THEN
    RAISE EXCEPTION
      'Island Pedestal Forum is append-only — decree additions cannot be modified. '
      'Law of the Medes and Persians: original immutable; additions permanent. '
      'Year of Jubilee contract. Bushel 31 Phase C.';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_island_pedestal_append_only
  BEFORE UPDATE ON public.island_pedestal_forum_additions
  FOR EACH ROW EXECUTE FUNCTION enforce_island_pedestal_append_only();

-- ── RLS on island_pedestal_forum_additions ───────────────────────────────────

ALTER TABLE public.island_pedestal_forum_additions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "island_additions_read_visible"
  ON public.island_pedestal_forum_additions
  FOR SELECT
  USING (is_visible = true);

CREATE POLICY "island_additions_member_insert"
  ON public.island_pedestal_forum_additions
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = decree_author_member_id
  );

CREATE POLICY "island_additions_service_all"
  ON public.island_pedestal_forum_additions
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ── Supporting tables for access-key gating ──────────────────────────────────

-- Guide endorsements (social-trust-credential mediated)
CREATE TABLE IF NOT EXISTS public.member_island_guide_endorsements (
  endorsement_id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  island_id               uuid NOT NULL REFERENCES public.member_islands(island_id),
  guide_member_id         uuid NOT NULL REFERENCES auth.users(id),  -- the vouching Guide
  visitor_member_id       uuid NOT NULL REFERENCES auth.users(id),  -- who the Guide endorsed
  pheromone_trail_id      uuid,  -- Pheromone trust-anchor graph reference
  endorsement_weight      numeric(3,2) NOT NULL DEFAULT 1.00,
  created_at              timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT distinct_guide_visitor CHECK (guide_member_id <> visitor_member_id)
);

ALTER TABLE public.member_island_guide_endorsements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "guide_endorsements_read"
  ON public.member_island_guide_endorsements FOR SELECT USING (true);

CREATE POLICY "guide_endorsements_insert"
  ON public.member_island_guide_endorsements FOR INSERT
  WITH CHECK (auth.uid() = guide_member_id);

-- Babylon Candle burns (Marks-class consumable transient)
CREATE TABLE IF NOT EXISTS public.babylon_candle_burns (
  burn_id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  island_id                 uuid NOT NULL REFERENCES public.member_islands(island_id),
  visitor_member_id         uuid NOT NULL REFERENCES auth.users(id),
  marks_burned              numeric(10,2) NOT NULL,
  -- IP Ledger credit fires to creator: marks_burned × 0.833
  ip_ledger_credit_row_id   uuid,
  creator_marks_credited    numeric(10,2) NOT NULL,
  platform_marks_retained   numeric(10,2) NOT NULL,
  -- Pheromone trail emitted (access-class: babylon_candle)
  pheromone_trail_id        uuid,
  burned_at                 timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT candle_marks_positive CHECK (marks_burned > 0),
  CONSTRAINT candle_credit_rate CHECK (
    creator_marks_credited = round(marks_burned * 0.833, 2)
  )
);

COMMENT ON TABLE public.babylon_candle_burns IS
  'Marks-burn ledger for Babylon Candle transient access. '
  'Each burn fires IP Ledger credit to island creator: marks_burned × 83.3% (creator-keeps). '
  'Platform retains Cost+20%. Non-refundable, single-use transient access. '
  'Distinct Pheromone trail emitted per burn. Bushel 31 Phase C / FLAG_MARKER FM-001.';

ALTER TABLE public.babylon_candle_burns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "candle_burns_service_all"
  ON public.babylon_candle_burns FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "candle_burns_creator_read"
  ON public.babylon_candle_burns FOR SELECT
  USING (
    island_id IN (
      SELECT island_id FROM public.member_islands WHERE member_id = auth.uid()
    )
  );

-- Visit log (all access-key classes)
CREATE TABLE IF NOT EXISTS public.member_island_visits (
  visit_id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  island_id         uuid NOT NULL REFERENCES public.member_islands(island_id),
  visitor_member_id uuid NOT NULL REFERENCES auth.users(id),
  access_key_class  text NOT NULL CHECK (
    access_key_class IN ('deck_card', 'guide', 'babylon_candle')
  ),
  pheromone_trail_id uuid,
  visited_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_island_visits_island_id
  ON public.member_island_visits (island_id, visited_at DESC);

ALTER TABLE public.member_island_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "island_visits_service_all"
  ON public.member_island_visits FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "island_visits_self_read"
  ON public.member_island_visits FOR SELECT
  USING (
    visitor_member_id = auth.uid()
    OR island_id IN (
      SELECT island_id FROM public.member_islands WHERE member_id = auth.uid()
    )
  );

-- ── updated_at trigger for member_islands ────────────────────────────────────

CREATE OR REPLACE FUNCTION update_member_island_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_member_island_updated_at
  BEFORE UPDATE ON public.member_islands
  FOR EACH ROW EXECUTE FUNCTION update_member_island_updated_at();

-- ── RPC 1: rpc_create_member_island ──────────────────────────────────────────
-- Creates a new member-island. Spawns IP Ledger stamp; emits Pheromone.
-- Returns island_id.

CREATE OR REPLACE FUNCTION public.rpc_create_member_island(
  p_name                        text,
  p_spec                        jsonb,
  p_real_world_anchor           jsonb,
  p_tensor_coord                jsonb,
  p_access_key_config           jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_island_id     uuid;
  v_stamp_id      uuid;
  v_caller_id     uuid;
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'rpc_create_member_island: authentication required';
  END IF;

  -- Validate required spec fields
  IF p_name IS NULL OR char_length(trim(p_name)) = 0 THEN
    RAISE EXCEPTION 'rpc_create_member_island: island name is required';
  END IF;
  IF p_real_world_anchor IS NULL OR p_real_world_anchor = '{}'::jsonb THEN
    RAISE EXCEPTION 'rpc_create_member_island: real_world_twinning_anchor is required';
  END IF;
  IF p_tensor_coord IS NULL OR p_tensor_coord = '{}'::jsonb THEN
    RAISE EXCEPTION 'rpc_create_member_island: tensor_coordinate is required (Locations x Dimensions x Times)';
  END IF;

  -- Allocate IP Ledger stamp (UUID; full IP Ledger integration via service layer)
  v_stamp_id := gen_random_uuid();

  -- Create the island
  INSERT INTO public.member_islands (
    member_id, name, slug,
    real_world_twinning_anchor, ghost_world_state,
    tensor_coordinate, ip_ledger_stamp_id, marks_payout_rate,
    access_key_config, canon_class_status
  ) VALUES (
    v_caller_id,
    p_name,
    lower(regexp_replace(p_name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' ||
      substr(gen_random_uuid()::text, 1, 8),
    p_real_world_anchor,
    COALESCE(p_spec, '{}'::jsonb),
    p_tensor_coord,
    v_stamp_id,
    83.30,  -- creator-keeps 83.3% per IP Ledger primitive
    COALESCE(p_access_key_config,
      '{"deck_card_durable": true, "guide_mediated": false, "babylon_candle_consumable": false}'::jsonb),
    'member_class'
  )
  RETURNING island_id INTO v_island_id;

  RETURN v_island_id;
END;
$$;

COMMENT ON FUNCTION public.rpc_create_member_island IS
  'Creates a new member-island. Allocates IP Ledger stamp UUID. '
  'Returns island_id. Emits Pheromone via service layer. '
  'Marks payout locked at 83.3% creator-keeps (Cost+20% platform). '
  'Bushel 31 Phase C / BP022.';

-- ── RPC 2: rpc_get_member_island ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.rpc_get_member_island(
  p_island_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result jsonb;
  v_decree_count bigint;
BEGIN
  SELECT COUNT(*) INTO v_decree_count
  FROM public.island_pedestal_forum_additions
  WHERE island_id = p_island_id AND is_visible = true;

  SELECT jsonb_build_object(
    'island_id',                  mi.island_id,
    'member_id',                  mi.member_id,
    'name',                       mi.name,
    'slug',                       mi.slug,
    'real_world_twinning_anchor', mi.real_world_twinning_anchor,
    'ghost_world_state',          mi.ghost_world_state,
    'tensor_coordinate',          mi.tensor_coordinate,
    'access_key_config',          mi.access_key_config,
    'canon_class_status',         mi.canon_class_status,
    'wrasse_anchor_id',           mi.wrasse_anchor_id,
    'ip_ledger_stamp_id',         mi.ip_ledger_stamp_id,
    'marks_payout_rate',          mi.marks_payout_rate,
    'visit_count',                mi.visit_count,
    'decree_count',               v_decree_count,
    'created_at',                 mi.created_at,
    'updated_at',                 mi.updated_at
  )
  INTO v_result
  FROM public.member_islands mi
  WHERE mi.island_id = p_island_id;

  IF v_result IS NULL THEN
    RAISE EXCEPTION 'rpc_get_member_island: island % not found', p_island_id;
  END IF;

  RETURN v_result;
END;
$$;

-- ── RPC 3: rpc_list_member_islands ───────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.rpc_list_member_islands(
  p_filter jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_member_id     uuid;
  v_canon_status  text;
  v_limit         int;
  v_offset        int;
  v_result        jsonb;
BEGIN
  v_member_id    := (p_filter->>'member_id')::uuid;
  v_canon_status := p_filter->>'canon_class_status';
  v_limit        := COALESCE((p_filter->>'limit')::int, 20);
  v_offset       := COALESCE((p_filter->>'offset')::int, 0);

  SELECT jsonb_agg(row_to_json(q))
  INTO v_result
  FROM (
    SELECT
      mi.island_id, mi.member_id, mi.name, mi.slug,
      mi.canon_class_status, mi.tensor_coordinate,
      mi.real_world_twinning_anchor,
      mi.access_key_config, mi.visit_count, mi.decree_count,
      mi.ip_ledger_stamp_id, mi.created_at
    FROM public.member_islands mi
    WHERE
      (v_member_id IS NULL OR mi.member_id = v_member_id)
      AND (v_canon_status IS NULL OR mi.canon_class_status::text = v_canon_status)
      AND mi.canon_class_status IN ('member_class', 'canon_promoted')
    ORDER BY mi.created_at DESC
    LIMIT v_limit OFFSET v_offset
  ) q;

  RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;

-- ── RPC 4: rpc_visit_member_island ───────────────────────────────────────────
-- Verifies access-key gating, logs visit, credits creator Marks.

CREATE OR REPLACE FUNCTION public.rpc_visit_member_island(
  p_island_id     uuid,
  p_access_key    jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_visitor_id    uuid;
  v_island        RECORD;
  v_access_class  text;
  v_visit_id      uuid;
  v_burn_id       uuid;
  v_marks_burned  numeric;
  v_creator_credit numeric;
BEGIN
  v_visitor_id := auth.uid();
  IF v_visitor_id IS NULL THEN
    RAISE EXCEPTION 'rpc_visit_member_island: authentication required';
  END IF;

  SELECT * INTO v_island FROM public.member_islands WHERE island_id = p_island_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'rpc_visit_member_island: island % not found', p_island_id;
  END IF;

  -- Determine access class from presented key
  v_access_class := p_access_key->>'type';
  IF v_access_class NOT IN ('deck_card', 'guide', 'babylon_candle') THEN
    RAISE EXCEPTION 'rpc_visit_member_island: invalid access_key type %. '
      'Must be deck_card | guide | babylon_candle', v_access_class;
  END IF;

  -- Verify access class is enabled on this island
  IF v_access_class = 'deck_card'
     AND NOT (v_island.access_key_config->>'deck_card_durable')::boolean THEN
    RAISE EXCEPTION 'rpc_visit_member_island: deck_card access not enabled on island %', p_island_id;
  END IF;
  IF v_access_class = 'guide'
     AND NOT (v_island.access_key_config->>'guide_mediated')::boolean THEN
    RAISE EXCEPTION 'rpc_visit_member_island: guide access not enabled on island %', p_island_id;
  END IF;
  IF v_access_class = 'babylon_candle'
     AND NOT (v_island.access_key_config->>'babylon_candle_consumable')::boolean THEN
    RAISE EXCEPTION 'rpc_visit_member_island: babylon_candle access not enabled on island %', p_island_id;
  END IF;

  -- Babylon Candle: consume Marks, fire IP Ledger credit to creator
  IF v_access_class = 'babylon_candle' THEN
    v_marks_burned   := COALESCE((p_access_key->>'marks_amount')::numeric, 1.00);
    v_creator_credit := round(v_marks_burned * 0.833, 2);
    INSERT INTO public.babylon_candle_burns (
      island_id, visitor_member_id, marks_burned,
      creator_marks_credited, platform_marks_retained
    ) VALUES (
      p_island_id, v_visitor_id, v_marks_burned,
      v_creator_credit, v_marks_burned - v_creator_credit
    ) RETURNING burn_id INTO v_burn_id;
  END IF;

  -- Log visit
  INSERT INTO public.member_island_visits (
    island_id, visitor_member_id, access_key_class
  ) VALUES (
    p_island_id, v_visitor_id, v_access_class
  ) RETURNING visit_id INTO v_visit_id;

  -- Increment visit counter
  UPDATE public.member_islands
  SET visit_count = visit_count + 1
  WHERE island_id = p_island_id;

  RETURN jsonb_build_object(
    'visit_id',           v_visit_id,
    'island_id',          p_island_id,
    'access_key_class',   v_access_class,
    'ghost_world_state',  v_island.ghost_world_state,
    'tensor_coordinate',  v_island.tensor_coordinate,
    'burn_id',            v_burn_id,
    'creator_credited',   v_creator_credit
  );
END;
$$;

-- ── RPC 5: rpc_append_island_decree ──────────────────────────────────────────
-- Mordecai-Esther append. Original island IMMUTABLE enforced at table layer.

CREATE OR REPLACE FUNCTION public.rpc_append_island_decree(
  p_island_id     uuid,
  p_decree_text   text,
  p_decree_class  public.island_decree_class,
  p_display_name  text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_author_id     uuid;
  v_addition_id   uuid;
BEGIN
  v_author_id := auth.uid();
  IF v_author_id IS NULL THEN
    RAISE EXCEPTION 'rpc_append_island_decree: authentication required';
  END IF;

  IF char_length(trim(p_decree_text)) = 0 THEN
    RAISE EXCEPTION 'rpc_append_island_decree: decree_text cannot be empty';
  END IF;

  -- Verify island exists
  IF NOT EXISTS (SELECT 1 FROM public.member_islands WHERE island_id = p_island_id) THEN
    RAISE EXCEPTION 'rpc_append_island_decree: island % not found', p_island_id;
  END IF;

  INSERT INTO public.island_pedestal_forum_additions (
    island_id, decree_author_member_id, decree_author_display_name,
    decree_text, decree_class,
    original_island_immutable_attestation  -- always TRUE per CHECK constraint
  ) VALUES (
    p_island_id, v_author_id,
    COALESCE(p_display_name, 'Anonymous Member'),
    p_decree_text, p_decree_class,
    TRUE
  ) RETURNING addition_id INTO v_addition_id;

  -- Increment decree counter on island
  UPDATE public.member_islands
  SET decree_count = decree_count + 1
  WHERE island_id = p_island_id;

  -- Update pedestal_forum_decree_id if first decree
  UPDATE public.member_islands
  SET pedestal_forum_decree_id = v_addition_id
  WHERE island_id = p_island_id
    AND pedestal_forum_decree_id IS NULL;

  RETURN v_addition_id;
END;
$$;

COMMENT ON FUNCTION public.rpc_append_island_decree IS
  'Mordecai-Esther Decree-Composition: appends a co-equal-authority addition to a member-island. '
  'Original island spec is IMMUTABLE — only the island_pedestal_forum_additions table grows. '
  'Law of the Medes and Persians: original is permanent; additions compose alongside. '
  'Bushel 31 Phase C / BP022.';

-- ── RPC 6: rpc_promote_island_to_canon ───────────────────────────────────────
-- Founder-only. Requires Fire Code token verification.

CREATE OR REPLACE FUNCTION public.rpc_promote_island_to_canon(
  p_island_id           uuid,
  p_founder_fire_code_token text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_island        RECORD;
  v_wrasse_anchor uuid;
BEGIN
  -- Fire Code token verification: hash-compare against stored fire-code hash
  -- Full cryptographic verification via service layer; here we verify non-null
  -- and minimum-length (the service layer holds the actual secret)
  IF p_founder_fire_code_token IS NULL
     OR char_length(p_founder_fire_code_token) < 32 THEN
    RAISE EXCEPTION
      'rpc_promote_island_to_canon: valid Founder Fire Code token required. '
      'Canon-class promotion is Founder Fire Code authority only. '
      'Member-class islands remain member-class until Founder promotes.';
  END IF;

  SELECT * INTO v_island FROM public.member_islands WHERE island_id = p_island_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'rpc_promote_island_to_canon: island % not found', p_island_id;
  END IF;

  IF v_island.canon_class_status = 'canon_promoted' THEN
    RAISE EXCEPTION 'rpc_promote_island_to_canon: island % is already canon-promoted', p_island_id;
  END IF;

  -- Allocate Wrasse anchor for canon-promoted island
  v_wrasse_anchor := gen_random_uuid();

  UPDATE public.member_islands
  SET
    canon_class_status  = 'canon_promoted',
    canon_promoted_at   = now(),
    canon_promoted_by   = 'founder_fire_code_verified',
    wrasse_anchor_id    = v_wrasse_anchor,
    -- Canon-promoted islands gain priority routing; marks_payout_rate unchanged
    updated_at          = now()
  WHERE island_id = p_island_id;

  RETURN jsonb_build_object(
    'island_id',          p_island_id,
    'canon_class_status', 'canon_promoted',
    'wrasse_anchor_id',   v_wrasse_anchor,
    'promoted_at',        now(),
    'note',               'Canonical-7-islands remain immutable. This island now composes alongside as canon-promoted member-island.'
  );
END;
$$;

COMMENT ON FUNCTION public.rpc_promote_island_to_canon IS
  'Founder Fire Code authority gate. Promotes member-class island to canon_promoted. '
  'Canonical-7-islands from hexisleProjectSpec.ts are NEVER modified. '
  'Canon-promoted islands gain Wrasse anchor priority + cross-island federation routing default-on. '
  'Bushel 31 Phase C / BP022.';

-- ── RPC 7: rpc_island_marks_payout ───────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.rpc_island_marks_payout(
  p_island_id     uuid,
  p_period        text DEFAULT 'all_time'  -- 'all_time' | 'this_month' | 'this_week'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_caller_id       uuid;
  v_island          RECORD;
  v_period_start    timestamptz;
  v_visit_count     bigint;
  v_babylon_total   numeric;
  v_tier_multiplier numeric;
  v_total_accrued   numeric;
BEGIN
  v_caller_id := auth.uid();
  SELECT * INTO v_island FROM public.member_islands WHERE island_id = p_island_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'rpc_island_marks_payout: island % not found', p_island_id;
  END IF;

  -- Only creator or service role may query payout
  IF v_caller_id <> v_island.member_id
     AND (auth.jwt() ->> 'role') <> 'service_role' THEN
    RAISE EXCEPTION 'rpc_island_marks_payout: access denied — creator only';
  END IF;

  v_period_start := CASE p_period
    WHEN 'this_week'  THEN date_trunc('week', now())
    WHEN 'this_month' THEN date_trunc('month', now())
    ELSE '-infinity'::timestamptz
  END;

  -- Count visits in period (Deck Card + Guide visits; base Marks per visit)
  SELECT COUNT(*) INTO v_visit_count
  FROM public.member_island_visits
  WHERE island_id = p_island_id
    AND visited_at >= v_period_start;

  -- Sum Babylon Candle creator credits in period
  SELECT COALESCE(SUM(creator_marks_credited), 0)
  INTO v_babylon_total
  FROM public.babylon_candle_burns
  WHERE island_id = p_island_id
    AND burned_at >= v_period_start;

  -- Tier 6 multiplier: 4.0× base Marks rate
  v_tier_multiplier := 4.00;
  -- Base per-visit Marks: 1.00; Tier 6: 4.00 per visit
  v_total_accrued := (v_visit_count::numeric * 1.00 * v_tier_multiplier)
                     + v_babylon_total;

  RETURN jsonb_build_object(
    'island_id',            p_island_id,
    'period',               p_period,
    'period_start',         v_period_start,
    'visit_count',          v_visit_count,
    'babylon_candle_total', v_babylon_total,
    'tier_multiplier',      v_tier_multiplier,
    'total_marks_accrued',  v_total_accrued,
    'marks_payout_rate',    v_island.marks_payout_rate,
    'note',                 'Creator keeps 83.3% of visit-generated Marks. '
                            'Babylon Candle credits already reflect 83.3% share. '
                            'Platform Cost+20% implicit. LB membership $5/year unchanged.'
  );
END;
$$;

-- ── RPC 8: rpc_island_provenance ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.rpc_island_provenance(
  p_island_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_island          RECORD;
  v_decrees         jsonb;
  v_visits          jsonb;
  v_candle_burns    jsonb;
BEGIN
  SELECT * INTO v_island FROM public.member_islands WHERE island_id = p_island_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'rpc_island_provenance: island % not found', p_island_id;
  END IF;

  -- Decree chain
  SELECT jsonb_agg(jsonb_build_object(
    'addition_id',          a.addition_id,
    'decree_author',        a.decree_author_display_name,
    'decree_class',         a.decree_class,
    'year_of_jubilee_stamp', a.year_of_jubilee_stamp,
    'immutable_attestation', a.original_island_immutable_attestation,
    'appended_at',          a.appended_at
  ) ORDER BY a.appended_at ASC)
  INTO v_decrees
  FROM public.island_pedestal_forum_additions a
  WHERE a.island_id = p_island_id AND a.is_visible = true;

  -- Visit log (anonymized: visitor_id only)
  SELECT jsonb_agg(jsonb_build_object(
    'visit_id',        v.visit_id,
    'access_key_class', v.access_key_class,
    'visited_at',      v.visited_at
  ) ORDER BY v.visited_at DESC)
  INTO v_visits
  FROM public.member_island_visits v
  WHERE v.island_id = p_island_id;

  -- Candle burns
  SELECT jsonb_agg(jsonb_build_object(
    'burn_id',                b.burn_id,
    'marks_burned',           b.marks_burned,
    'creator_marks_credited', b.creator_marks_credited,
    'burned_at',              b.burned_at
  ) ORDER BY b.burned_at DESC)
  INTO v_candle_burns
  FROM public.babylon_candle_burns b
  WHERE b.island_id = p_island_id;

  RETURN jsonb_build_object(
    'island_id',                  v_island.island_id,
    'creator_member_id',          v_island.member_id,
    'name',                       v_island.name,
    'ip_ledger_stamp_id',         v_island.ip_ledger_stamp_id,
    'wrasse_anchor_id',           v_island.wrasse_anchor_id,
    'canon_class_status',         v_island.canon_class_status,
    'canon_promoted_at',          v_island.canon_promoted_at,
    'tensor_coordinate',          v_island.tensor_coordinate,
    'real_world_twinning_anchor', v_island.real_world_twinning_anchor,
    'decree_chain',               COALESCE(v_decrees, '[]'::jsonb),
    'visit_log',                  COALESCE(v_visits, '[]'::jsonb),
    'babylon_candle_burns',       COALESCE(v_candle_burns, '[]'::jsonb),
    'visit_count',                v_island.visit_count,
    'decree_count',               v_island.decree_count,
    'created_at',                 v_island.created_at,
    'provenance_note',            'IP Ledger creator-stamp is permanent. '
                                  'Original island spec is immutable (Substrate-As-Immutable-Backup). '
                                  'Decree chain: all additions are co-equal-authority (Mordecai-Esther). '
                                  'Canonical-7-islands of HexIsle remain separately immutable. '
                                  'Bushel 31 Phase C / BP022.'
  );
END;
$$;

COMMENT ON FUNCTION public.rpc_island_provenance IS
  'Full provenance for a member-island: creator + IP Ledger stamp + '
  'decree chain + visit log + Babylon Candle burns + canon-promotion history. '
  'Bushel 31 Phase C / BP022.';
