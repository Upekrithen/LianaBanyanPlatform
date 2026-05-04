-- ============================================================================
-- Bushel 31 Phase A — Tier 6 Member-Island-Creator class extension
-- BP022 / 2026-05-03 AD
-- ============================================================================
-- Founder direct (BP021 turn 129, preserved verbatim):
--   "I want to put out a pretty big bounty - If you join LB, you can be part
--    of making our own worlds in HexIsle using our new CAI enabled interface..
--    MAKE your own island, that is part of the Ghost World/Real World that IS HexIsle!"
--
-- Composes with:
--   20260502180000_knh6_bounty_posters_tier_class.sql — bounty_tier_class enum (4 prior classes)
--   member_island_creation_bounty_cai_hexisle_ghost_world_real_world_twinning_canon_bp021.eblet.md
--   multi_dimensional_twinning_locations_dimensions_times_conditional_operators_chronos_canon_bp021.eblet.md
--
-- Augur-Pricing exemption: This migration pertains to Marks-class bounty multipliers
-- for island-authoring contributions. LB membership pricing ($5/year) is UNCHANGED and
-- membership-orthogonal. Context exemption: 'pricing identical for all'.
-- ============================================================================

-- Extend bounty_tier_class enum with Tier 6 Member-Island-Creator
-- Uses DO block for idempotent enum extension (IF NOT EXISTS equivalent for enum values)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'tier_6_member_island_creator'
      AND enumtypid = (
        SELECT oid FROM pg_type WHERE typname = 'bounty_tier_class'
      )
  ) THEN
    ALTER TYPE public.bounty_tier_class ADD VALUE 'tier_6_member_island_creator';
  END IF;
END $$;

-- ── Tier 6 bounty metadata table ─────────────────────────────────────────────
-- Stores eligibility requirements specific to the Tier 6 cohort-class.
-- These requirements gate both Bounty submission AND island-canon-class-promotion.

CREATE TABLE IF NOT EXISTS public.member_island_creator_eligibility (
  member_id                            uuid PRIMARY KEY REFERENCES auth.users(id),
  lb_membership_active                 boolean NOT NULL DEFAULT false,
  pedestal_active                      boolean NOT NULL DEFAULT false,
  ip_ledger_registered                 boolean NOT NULL DEFAULT false,
  cooperative_defensive_pledge_signed_at timestamptz,    -- #2260 co-signature
  tier_6_granted_at                    timestamptz,
  granted_by                           text DEFAULT 'system',
  created_at                           timestamptz NOT NULL DEFAULT now(),
  updated_at                           timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.member_island_creator_eligibility IS
  'Tier 6 Member-Island-Creator eligibility gate. '
  'Requires: active LB membership + Pedestal active + IP Ledger registered + '
  '#2260 Cooperative Defensive Patent Pledge co-signature. '
  'Multiplier: 4.0x base Marks bounty pay rate. Bushel 31 Phase A / BP022.';

CREATE INDEX IF NOT EXISTS idx_mic_eligibility_pledge
  ON public.member_island_creator_eligibility (cooperative_defensive_pledge_signed_at)
  WHERE cooperative_defensive_pledge_signed_at IS NOT NULL;

ALTER TABLE public.member_island_creator_eligibility ENABLE ROW LEVEL SECURITY;

-- Members can read their own eligibility record
CREATE POLICY "mic_eligibility_self_read"
  ON public.member_island_creator_eligibility
  FOR SELECT
  USING (auth.uid() = member_id);

-- Service role can insert/update eligibility records
CREATE POLICY "mic_eligibility_service_write"
  ON public.member_island_creator_eligibility
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ── Seed 4 Tier-6 Standing Bounties (MIC-001 through MIC-004) ────────────────
-- Note: Marks multiplier 4.0x reflects recruitment-class lever value.
-- Base reward: 400 Marks (standard 100 × 4.0x Tier 6 multiplier).
-- Augur-Pricing context: these are Marks-denominated bounty rewards, not
-- fiat or membership-pricing changes. membership-orthogonal.

INSERT INTO public.bounties (
  slug, title, tagline, description, empirical_anchor,
  reward_marks, reward_currency, license_scope, status,
  featured_in_lb_frame, featured_order,
  verification_method, submission_requirements,
  tier_class, marks_pay_rate_multiplier, is_tier_bounty
) VALUES
(
  'mic-001-hexel-mechanics-class-member-island',
  'MIC-001 — Hexel-Mechanics-Class Member Island',
  'Build an island where a novel mech innovation lives in the terrain itself.',
  'Author a member-island whose design embeds a novel mechanical innovation '
  'composing with HexIsle''s 33 base mech innovations '
  '(from hexisleProjectSpec.ts). The island terrain, lore, or game-mechanic '
  'must demonstrate or house a mech-class innovation. Real-World Twinning '
  'anchor required. Submit via /hexisle/create-island (CAI ◌ NotCents interface). '
  'IP Ledger stamp fires at submission; creator keeps 83.3% per-visit Marks '
  '(platform Cost+20%). Marks payout is membership-orthogonal '
  '($5/year LB membership unchanged). '
  'Eligibility: active LB membership + Pedestal + IP Ledger registered + '
  '#2260 Cooperative Defensive Patent Pledge co-signature.',
  'platform/src/lib/hexisleProjectSpec.ts (33 mech innovations baseline)',
  400,
  'Marks',
  'AGPL',
  'open',
  TRUE, 201,
  'Island-spec JSON via /hexisle/create-island; IP Ledger stamp verified; '
  'mech-innovation field non-empty + composes with ≥1 of the 33 base mechs; '
  'Real-World Twinning anchor present; Tier 6 eligibility confirmed',
  'Submit via /hexisle/create-island. Receipt must include: island_id (UUID), '
  'ip_ledger_stamp_id (UUID), real_world_twinning_anchor (jsonb), '
  'mech_innovation_description (text, ≥100 chars), composing_base_mech (1-33), '
  'ghost_world_state (jsonb with lore summary + mechanic-class), '
  'tensor_coordinate (Locations×Dimensions×Times), access_key_config (jsonb). '
  'Optional: cross_island_routing_class, pedestal_forum_class_eligibility.',
  'tier_6_member_island_creator', 4.00, TRUE
),
(
  'mic-002-twinning-pair-class-member-island',
  'MIC-002 — Twinning-Pair-Class Member Island',
  'Stake a Real-World location. Build its Ghost-World shadow. Canonical bidirectional link.',
  'Author a member-island that is a bidirectional twinning pair: a Real-World '
  'anchor (geographic / cultural / structural location the member personally knows) '
  'paired with its Ghost-World analog in HexIsle lore-space. The twin-pair must '
  'be canonically linked — each world contains a reference to the other in its '
  'tensor_coordinate metadata. This is the Multi-dim Twinning tensor made tangible: '
  'Locations × Dimensions × Times. Submit via /hexisle/create-island. '
  'IP Ledger creator-stamp persists the bidirectional link permanently. '
  'Marks payout is membership-orthogonal ($5/year LB membership unchanged). '
  'Eligibility: active LB membership + Pedestal + IP Ledger + '
  '#2260 Cooperative Defensive Patent Pledge co-signature.',
  'multi_dimensional_twinning_locations_dimensions_times_conditional_operators_chronos_canon_bp021.eblet.md',
  400,
  'Marks',
  'AGPL',
  'open',
  TRUE, 202,
  'Island-spec JSON with Real-World Twinning anchor + Ghost-World analog; '
  'tensor_coordinate includes both Locations dimensions; IP Ledger stamp fires; '
  'bidirectional link verified in ghost_world_state metadata',
  'Submit via /hexisle/create-island. Receipt must include: island_id, '
  'ip_ledger_stamp_id, real_world_twinning_anchor (with lat/lon or symbolic anchor + '
  'cultural/structural descriptor), ghost_world_analog_description (≥150 chars), '
  'tensor_coordinate.location (Real-World), tensor_coordinate.dimension (Ghost-World layer), '
  'tensor_coordinate.time_anchor (Chronos timestamp, default present+perpetuity), '
  'bidirectional_link_confirmed (boolean, must be true). '
  'Optional: photo_or_map_reference, founding_story.',
  'tier_6_member_island_creator', 4.00, TRUE
),
(
  'mic-003-pedestal-forum-decree-class-member-island',
  'MIC-003 — Pedestal-Forum-Decree-Class Member Island',
  'Design an island that invites co-authorship. Build the canonical welcome mat for decrees.',
  'Author a member-island specifically designed for high Mordecai-Esther '
  'decree-composition density. The island must include: (1) at least one open '
  'canonical question or unresolved lore thread explicitly inviting co-equal-authority '
  'additions, (2) pedestal_forum_decree_id wired and active at submission, '
  '(3) the island''s ghost_world_state contains a "welcome_decrees" field '
  'listing at least 3 open invitation prompts for co-authors. '
  'The Pedestal Forum Decree-Composition pattern: original island is IMMUTABLE '
  '(Law of the Medes and Persians, Esther 8); member-N additions compose alongside '
  'with co-equal authority. Submit via /hexisle/create-island. '
  'Marks payout is membership-orthogonal ($5/year LB membership unchanged). '
  'Eligibility: active LB membership + Pedestal + IP Ledger + '
  '#2260 Cooperative Defensive Patent Pledge co-signature.',
  'mordecai_esther_pedestal_forum_decree_composition_paper_collaboration_canon_bp021.eblet.md',
  400,
  'Marks',
  'AGPL',
  'open',
  TRUE, 203,
  'Island-spec JSON with pedestal_forum_decree_id wired; welcome_decrees field '
  'present with ≥3 open invitation prompts; at least 1 co-author decree appended '
  'after submission (demonstrates Pedestal Forum operational); '
  'original_island_immutable_attestation = true in island_pedestal_forum_additions',
  'Submit via /hexisle/create-island. Receipt must include: island_id, '
  'ip_ledger_stamp_id, pedestal_forum_decree_id (UUID), '
  'welcome_decrees (array of ≥3 open prompts in ghost_world_state), '
  'first_co_author_decree_id (UUID — must have ≥1 appended decree post-submission), '
  'immutability_attestation_confirmed (boolean, must be true). '
  'Optional: decree_composition_invitation_style, thematic_lore_arc.',
  'tier_6_member_island_creator', 4.00, TRUE
),
(
  'mic-004-federation-cross-island-routing-class-member-island',
  'MIC-004 — Federation Cross-Island-Routing-Class Member Island',
  'Build a transit hub. Wire all 3 access keys. Become a gateway in the Federation.',
  'Author a member-island designed as a Federation transit hub: all 3 access-key '
  'classes prominently exposed and tested (Deck Card durable JWT-class / '
  'Guide endorsement-weighted mediated / Babylon Candle Marks-burn transient), '
  'cross-island routing wired (Federation Memory Iceberg anchor registered), '
  'and Wrasse anchors active for sub-ms retrieval. The island''s lore-purpose '
  'is explicitly transit-oriented (a port, a crossroads, a nexus, a waystation). '
  'All 3 access keys must be exercised in the empirical receipt '
  '(3 test-visits via distinct key classes). '
  'Babylon Candle burns credit creator IP Ledger (83.3% creator-keeps). '
  'Marks payout is membership-orthogonal ($5/year LB membership unchanged). '
  'Eligibility: active LB membership + Pedestal + IP Ledger + '
  '#2260 Cooperative Defensive Patent Pledge co-signature.',
  'multi_dimensional_twinning_locations_dimensions_times_conditional_operators_chronos_canon_bp021.eblet.md — FLAG_MARKER FM-001',
  400,
  'Marks',
  'AGPL',
  'open',
  TRUE, 204,
  'Island-spec JSON with all 3 access_key_config fields true; '
  '3 test-visit receipts (one per access-key class) in empirical receipt; '
  'Wrasse anchor registered (wrasse_anchor_id present); '
  'cross-island routing operational; IP Ledger credit fires on Babylon Candle burn',
  'Submit via /hexisle/create-island. Receipt must include: island_id, '
  'ip_ledger_stamp_id, wrasse_anchor_id (UUID), '
  'access_key_config.deck_card_durable (true), '
  'access_key_config.guide_mediated (true), '
  'access_key_config.babylon_candle_consumable (true), '
  'visit_receipt_deck_card (UUID — test visit via Deck Card), '
  'visit_receipt_guide (UUID — test visit via Guide endorsement), '
  'visit_receipt_babylon_candle (UUID — test visit via Babylon Candle burn), '
  'babylon_candle_ip_ledger_credit_row_id (UUID — credit fired to creator). '
  'Optional: cross_island_routing_hub_description, federation_waystation_lore.',
  'tier_6_member_island_creator', 4.00, TRUE
)
ON CONFLICT (slug) DO NOTHING;
