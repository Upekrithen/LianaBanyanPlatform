-- ═══════════════════════════════════════════════════════════════════════════════
-- Roll Schema — BP044 W1 Knight ASK AA-ALPHA
-- The Roll · Get on a Roll · Cooperative-Class Peer-Mesh Ratification
-- SUPERSEDES: BP043 100-cap PEC Council canon
-- Canon: the_roll_get_on_a_roll_cooperative_class_peer_mesh_ratification_bp044.eblet.md
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── roll_members ──────────────────────────────────────────────────────────────
-- Core Roll roster. All Initiative-Crown holders are auto-Roll members.
-- 2:1 non-famous-to-famous ratio invariant enforced at application layer.

CREATE TABLE IF NOT EXISTS public.roll_members (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity
  display_name                TEXT NOT NULL,
  slug                        TEXT UNIQUE GENERATED ALWAYS AS (
    lower(regexp_replace(display_name, '[^a-zA-Z0-9]+', '-', 'g'))
  ) STORED,

  -- Roll class taxonomy
  class                       TEXT NOT NULL CHECK (class IN (
    'founder_personal_anchor',  -- BP032 inaugural Founder-direct picks
    'founder_reserved_20',      -- Founder's 20 reserved suggestion slots (8 named BP044 W1)
    'captains_roll',            -- Captain Council 5-seat advisory ring
    'crown_roll',               -- Initiative-Crown holders (auto-Roll) — 16+3 spinout
    'sleeper_roll',             -- Crown-decline → Sleeper seat offered (cooperative-class kinship)
    'the_roll_open',            -- Cooperative-class authority pool (general)
    'pedestal_roll'             -- Peer-mesh-confirmed subset — highest-class authority
  )),

  -- 3-prong famous-class test (BP044 W1)
  famous_class                BOOLEAN NOT NULL DEFAULT false,
  prong_a_cooperative_craft   BOOLEAN,         -- Demonstrable cooperative-class work
  prong_b_body_cam_class      TEXT CHECK (prong_b_body_cam_class IN (
    'supreme', 'clean', 'repentance_class', 'yellow_flagged', 'defer', 'pending'
  )),
  prong_c_independent_amplification BOOLEAN,   -- Cultural-amplification reach independent of substrate

  -- Repentance-Class Anchor Tier (10-seat tier BP044 W1)
  repentance_class_anchor     BOOLEAN NOT NULL DEFAULT false,

  -- Crown / Initiative association (auto-Roll path)
  crown_initiative            TEXT,            -- snake_case Initiative key if Crown role
  crown_initiative_num        INT CHECK (crown_initiative_num BETWEEN 1 AND 19),

  -- Ratification provenance
  bp_session_ratified         TEXT NOT NULL,   -- BP032 · BP043 · BP044_W1 · etc.
  founder_direct_quote        TEXT,            -- Verbatim Founder-direct anchor if applicable
  nominated_by                TEXT NOT NULL CHECK (nominated_by IN (
    'founder_direct', 'bishop_research', 'pawn_dispatch',
    'initiative_crown', 'member', 'self'
  )),
  nominator_member_id         UUID REFERENCES public.members(id) ON DELETE SET NULL,

  -- Pedestal-Vote / voting status
  pedestal_vote_status        TEXT NOT NULL DEFAULT 'pending' CHECK (pedestal_vote_status IN (
    'accept', 'decline', 'non_response', 'pending'
  )),

  -- Non-famous-class peer-witness requirement (≥2)
  peer_witness_count          INT NOT NULL DEFAULT 0,

  -- Body-Cam Pawn-dispatch trail
  body_cam_pawn_dispatch_id   UUID,

  -- Dual-veto-path (Founder OR Trinity · either alone suffices)
  dual_veto_trigger           BOOLEAN NOT NULL DEFAULT false,
  dual_veto_reason            TEXT,            -- Structural-inversion-class ONLY · NEVER political-class
  dual_veto_by                TEXT CHECK (dual_veto_by IN ('founder', 'trinity')),
  dual_veto_reversed_at       TIMESTAMPTZ,

  -- LB-not-suggesting class (governance restraint · not removal)
  lb_not_suggesting           BOOLEAN NOT NULL DEFAULT false,
  lb_not_suggesting_reason    TEXT,

  -- Deceased-class (no-deceased binding · Schlossburg = only canonical exception)
  deceased_class              BOOLEAN NOT NULL DEFAULT false,
  tribute_class               BOOLEAN NOT NULL DEFAULT false, -- TRIBUTE acknowledgment · NOT roster unless Schlossburg

  -- Cross-stack composability
  cross_stack_initiatives     TEXT[] DEFAULT '{}',  -- Initiative tags (load-bearing composability)
  structurally_load_bearing   BOOLEAN NOT NULL DEFAULT false,
  cinema_canon_anchor         TEXT,            -- Luthen Rael / Davos Seaworth / etc.

  -- Metadata
  public_bio_summary          TEXT,            -- Short cooperative-class authority summary (public-facing)
  body_cam_status_badge       TEXT CHECK (body_cam_status_badge IN (
    'green', 'yellow', 'deferred', 'pending'
  )) DEFAULT 'pending',

  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Constraint: deceased-class members cannot hold Roll seats (Schlossburg exception handled at app layer)
-- Note: Schlossburg is tribute_class=true, deceased_class=true, but is the Initiative #6 namesake anchor
-- The no-deceased-canon exception is that she is NOT on the roster as a Roll member — just namesake

-- Constraint: dual-veto-trigger requires reason
ALTER TABLE public.roll_members
  ADD CONSTRAINT roll_dual_veto_requires_reason
  CHECK (dual_veto_trigger = false OR dual_veto_reason IS NOT NULL);

-- Constraint: non-famous candidates require ≥2 peer witnesses before pedestal_vote_status = 'accept'
-- (enforced at application layer via trigger)

COMMENT ON TABLE public.roll_members IS
  'The Roll — BP044 W1 cooperative-class peer-mesh ratification roster. Supersedes BP043 PEC Council.
   2:1 non-famous-to-famous ratio (famous_class=true). Initiative-Crown holders are auto-Roll (crown_roll class).
   Dual-veto-path: either Founder OR Trinity can veto (structural-inversion-class only, never political-class).
   Canon: the_roll_get_on_a_roll_cooperative_class_peer_mesh_ratification_bp044.eblet.md';

-- ── roll_votes ────────────────────────────────────────────────────────────────
-- Hybrid voting class: Founder (supersedes) + Pedestal Roll members + Members

CREATE TABLE IF NOT EXISTS public.roll_votes (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roll_member_id              UUID NOT NULL REFERENCES public.roll_members(id) ON DELETE CASCADE,

  -- Voter class (hybrid voting canon)
  voter_class                 TEXT NOT NULL CHECK (voter_class IN (
    'founder',              -- Always supersedes
    'pedestal_roll_member', -- Cooperative-class peer-mesh ratification
    'member'                -- Member-substrate voting class
  )),
  voter_id                    UUID,            -- member_id if member · roll_member_id if pedestal_roll
  vote                        TEXT NOT NULL CHECK (vote IN ('yes', 'no', 'abstain')),
  vote_reason                 TEXT,            -- Optional cooperative-class transparency

  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent double-voting per voter per candidate
  UNIQUE (roll_member_id, voter_class, voter_id)
);

COMMENT ON TABLE public.roll_votes IS
  'Hybrid voting for Roll membership. Founder vote always supersedes.
   Threshold: Pedestal Roll majority + Member majority + Founder non-veto = ratified.';

-- ── roll_peer_witnesses ───────────────────────────────────────────────────────
-- Cooperative-class peer-witness for non-famous-class candidates (≥2 required)

CREATE TABLE IF NOT EXISTS public.roll_peer_witnesses (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roll_member_id              UUID NOT NULL REFERENCES public.roll_members(id) ON DELETE CASCADE,

  witness_name                TEXT NOT NULL,
  witness_relationship_class  TEXT NOT NULL,  -- cooperative-class peer / colleague / community-member
  witness_independent         BOOLEAN NOT NULL DEFAULT false, -- TRUE for at least 1 of ≥2 witnesses
  witness_statement           TEXT,

  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.roll_peer_witnesses IS
  'Cooperative-class peer-witnesses for non-famous-class Roll candidates.
   Non-famous-class requires ≥2 witnesses, at least 1 independent (witness_independent=true).
   Famous-class uses public Body-Cam record instead. BP044 W1 canon.';

-- ── roll_nominations ──────────────────────────────────────────────────────────
-- Open-Nomination canon: anyone nominates · including self-nomination
-- Substrate self-limits via Body-Cam + 3-prong + peer-witness + Pedestal-Vote + dual-veto

CREATE TABLE IF NOT EXISTS public.roll_nominations (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who is being nominated
  nominated_display_name      TEXT NOT NULL,
  nominated_bio               TEXT,

  -- Who nominated them
  nominated_by_class          TEXT NOT NULL CHECK (nominated_by_class IN (
    'founder_direct', 'bishop_research', 'pawn_dispatch',
    'initiative_crown', 'member', 'self'
  )),
  nominator_member_id         UUID REFERENCES public.members(id) ON DELETE SET NULL,
  nominator_crown_initiative  TEXT,           -- If initiative_crown lane

  -- Famous-class pre-screening
  proposed_famous_class       BOOLEAN NOT NULL DEFAULT false,
  prong_a_b_c_check_status    TEXT NOT NULL DEFAULT 'pending' CHECK (prong_a_b_c_check_status IN (
    'pending', 'pawn_dispatched', 'verified', 'failed'
  )),

  -- Reality-TV / influencer auto-Pawn-gate
  spectacle_class_flag        BOOLEAN NOT NULL DEFAULT false,  -- Triggers auto-Pawn-dispatch
  pawn_dispatch_id            UUID,           -- Body-Cam / 3-prong Pawn verification trail

  -- Non-famous peer-witness pre-check
  peer_witness_count_minimum_2 INT NOT NULL DEFAULT 0,

  -- Nomination pipeline status
  nomination_status           TEXT NOT NULL DEFAULT 'pending' CHECK (nomination_status IN (
    'pending',          -- Just submitted
    'verified',         -- 3-prong + Body-Cam cleared
    'queued_for_vote',  -- Ready for Pedestal Roll + Member vote
    'ratified',         -- Accepted into Roll
    'rejected',         -- Failed 3-prong or Body-Cam
    'declined'          -- Candidate declined
  )),

  -- If nomination converts to Roll membership
  roll_member_id              UUID REFERENCES public.roll_members(id) ON DELETE SET NULL,

  notes                       TEXT,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.roll_nominations IS
  'Open-Nomination path for The Roll. Anyone can nominate, including self-nomination.
   Substrate self-limits via Body-Cam doctrine, 3-prong famous-class test, peer-witness requirement,
   Pedestal-Vote canon, Passive-Surveillance-Logger, and dual-veto-path.
   Reality-TV/influencer/spectacle-class auto-triggers Pawn dispatch before vote queue placement.
   Canon: open_nomination_canon_anyone_self_substrate_self_limiting_bp044.eblet.md';

-- ══ Indexes ══════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_roll_members_class ON public.roll_members(class);
CREATE INDEX IF NOT EXISTS idx_roll_members_famous_class ON public.roll_members(famous_class);
CREATE INDEX IF NOT EXISTS idx_roll_members_dual_veto_trigger ON public.roll_members(dual_veto_trigger);
CREATE INDEX IF NOT EXISTS idx_roll_members_lb_not_suggesting ON public.roll_members(lb_not_suggesting);
CREATE INDEX IF NOT EXISTS idx_roll_members_crown_initiative ON public.roll_members(crown_initiative);
CREATE INDEX IF NOT EXISTS idx_roll_members_repentance_class ON public.roll_members(repentance_class_anchor);
CREATE INDEX IF NOT EXISTS idx_roll_members_structurally_load_bearing ON public.roll_members(structurally_load_bearing);
CREATE INDEX IF NOT EXISTS idx_roll_members_pedestal_vote_status ON public.roll_members(pedestal_vote_status);
CREATE INDEX IF NOT EXISTS idx_roll_members_bp_session ON public.roll_members(bp_session_ratified);
CREATE INDEX IF NOT EXISTS idx_roll_votes_roll_member ON public.roll_votes(roll_member_id);
CREATE INDEX IF NOT EXISTS idx_roll_votes_voter_class ON public.roll_votes(voter_class);
CREATE INDEX IF NOT EXISTS idx_roll_witnesses_roll_member ON public.roll_peer_witnesses(roll_member_id);
CREATE INDEX IF NOT EXISTS idx_roll_nominations_status ON public.roll_nominations(nomination_status);
CREATE INDEX IF NOT EXISTS idx_roll_nominations_spectacle ON public.roll_nominations(spectacle_class_flag);

-- ══ updated_at triggers ══════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.set_roll_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER roll_members_updated_at
  BEFORE UPDATE ON public.roll_members
  FOR EACH ROW EXECUTE FUNCTION public.set_roll_updated_at();

CREATE TRIGGER roll_nominations_updated_at
  BEFORE UPDATE ON public.roll_nominations
  FOR EACH ROW EXECUTE FUNCTION public.set_roll_updated_at();

-- ══ Crown auto-Roll trigger ══════════════════════════════════════════════════
-- When a crown_initiative is assigned to a member and ratified, auto-create roll_members row.
-- (This trigger fires on insert/update of roll_members with class=crown_roll for enforcement checks.)

CREATE OR REPLACE FUNCTION public.enforce_roll_member_rules()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  -- Enforce: non-famous-class candidates must have ≥2 peer witnesses before accepting
  IF NEW.famous_class = false
     AND NEW.pedestal_vote_status = 'accept'
     AND (SELECT COUNT(*) FROM public.roll_peer_witnesses WHERE roll_member_id = NEW.id) < 2
  THEN
    RAISE EXCEPTION 'Non-famous-class Roll members require at least 2 cooperative-class peer witnesses before acceptance.';
  END IF;

  -- Enforce: deceased-class members cannot hold non-tribute Roll seats
  -- Exception: tribute_class is allowed (Schlossburg-exception application layer)
  IF NEW.deceased_class = true AND NEW.tribute_class = false AND NEW.class != 'founder_personal_anchor' THEN
    RAISE EXCEPTION 'Deceased-class candidates cannot hold Roll seats (no-deceased-canon BP044 W1). Use tribute_class=true for tribute acknowledgments.';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER roll_member_rules_trigger
  BEFORE INSERT OR UPDATE ON public.roll_members
  FOR EACH ROW EXECUTE FUNCTION public.enforce_roll_member_rules();

-- ══ RLS Policies ═════════════════════════════════════════════════════════════

ALTER TABLE public.roll_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roll_peer_witnesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roll_nominations ENABLE ROW LEVEL SECURITY;

-- Public read: Roll members (cooperative-class transparency — selected fields only)
-- Full record access admin/service-role only
CREATE POLICY "roll_members_public_read" ON public.roll_members
  FOR SELECT USING (
    -- Public can see: name, class, crown_initiative, body_cam_status_badge,
    -- repentance_class_anchor, cinema_canon_anchor, structurally_load_bearing, public_bio_summary
    -- Private fields (dual_veto_reason, lb_not_suggesting_reason, founder_direct_quote)
    -- are filtered at the view/API layer — the row is readable but sensitive columns
    -- are excluded in the /roll/ public endpoint
    true
  );

-- Members can read all non-sensitive roll data
CREATE POLICY "roll_members_member_read" ON public.roll_members
  FOR SELECT USING (auth.role() = 'authenticated');

-- Members can vote (via roll_votes table)
CREATE POLICY "roll_votes_member_insert" ON public.roll_votes
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated'
    AND voter_class = 'member'
    -- Voters can only cast their own vote
  );

CREATE POLICY "roll_votes_read" ON public.roll_votes
  FOR SELECT USING (true);

-- Members can submit nominations (open-nomination canon)
CREATE POLICY "roll_nominations_member_insert" ON public.roll_nominations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "roll_nominations_read" ON public.roll_nominations
  FOR SELECT USING (auth.role() = 'authenticated');

-- Peer witnesses: authenticated read + insert
CREATE POLICY "roll_peer_witnesses_read" ON public.roll_peer_witnesses
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "roll_peer_witnesses_insert" ON public.roll_peer_witnesses
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Service-role bypass (admin operations, seed, Founder/Trinity veto)
CREATE POLICY "roll_service_role_full_access_members" ON public.roll_members
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "roll_service_role_full_access_votes" ON public.roll_votes
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "roll_service_role_full_access_nominations" ON public.roll_nominations
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "roll_service_role_full_access_witnesses" ON public.roll_peer_witnesses
  FOR ALL USING (auth.role() = 'service_role');

-- ══ Seed: Day-0 Roll Cohort ══════════════════════════════════════════════════
-- Founder-reserved-20 (8 named BP044 W1): Aghdashloo, Doctorow, Trejo, Hardy,
-- Ferguson, Guzmán, Longoria, Isaac — all Pawn-verified GREEN where applicable

INSERT INTO public.roll_members (display_name, class, famous_class, prong_a_cooperative_craft, prong_b_body_cam_class, prong_c_independent_amplification, bp_session_ratified, nominated_by, pedestal_vote_status, body_cam_status_badge, public_bio_summary) VALUES
  ('Shohreh Aghdashloo',    'founder_reserved_20', true,  true, 'clean', true, 'BP044_W1', 'founder_direct', 'accept', 'green', 'Iranian-American actress and UNHCR Goodwill Ambassador — cooperative-class dignity and human rights advocacy.'),
  ('Cory Doctorow',         'founder_reserved_20', true,  true, 'clean', true, 'BP044_W1', 'founder_direct', 'accept', 'green', 'Author, journalist, and cooperative-class digital rights activist — cooperative-economy and open-source canon.'),
  ('Danny Trejo',           'founder_reserved_20', true,  true, 'clean', true, 'BP044_W1', 'founder_direct', 'accept', 'green', 'Actor and cooperative-class community advocate — ex-incarcerated cooperative-class recovery leader in East LA.'),
  ('Tom Hardy',             'founder_reserved_20', true,  true, 'clean', true, 'BP044_W1', 'founder_direct', 'pending', 'green', 'Actor and martial artist — cooperative-class vulnerability and mental health advocacy.'),
  ('Jesse Ferguson',        'founder_reserved_20', true,  true, 'clean', true, 'BP044_W1', 'founder_direct', 'pending', 'green', 'Chef and cooperative-class food system advocate — cooperative-class food access and community-building.'),
  ('Luis Guzmán',           'founder_reserved_20', true,  true, 'clean', true, 'BP044_W1', 'founder_direct', 'pending', 'green', 'Actor and cooperative-class community advocate — Puerto Rican cooperative-class dignity and cultural representation.'),
  ('Eva Longoria',          'founder_reserved_20', true,  true, 'clean', true, 'BP044_W1', 'founder_direct', 'pending', 'green', 'Actress, director, and cooperative-class activist — Latina cooperative-class economic empowerment.'),
  ('Oscar Isaac',           'founder_reserved_20', true,  true, 'clean', true, 'BP044_W1', 'founder_direct', 'pending', 'green', 'Actor and cooperative-class artist — Guatemalan-American cooperative-class cultural authority and craft.')
ON CONFLICT (id) DO NOTHING;

-- First Four on the Roll (48h window launch cohort — pedestal_roll class, BP044 W1)
INSERT INTO public.roll_members (display_name, class, famous_class, prong_a_cooperative_craft, prong_b_body_cam_class, prong_c_independent_amplification, bp_session_ratified, nominated_by, pedestal_vote_status, body_cam_status_badge, public_bio_summary, structurally_load_bearing, cinema_canon_anchor) VALUES
  ('Michael Cunningham',    'the_roll_open', true, true, 'clean', true, 'BP044_W1', 'bishop_research', 'pending', 'green', 'Pulitzer Prize-winning author — cooperative-class literary craft authority and zero-translation voice.',          true, 'Davos Seaworth (counsel-truth-without-politics)'),
  ('Jimmy Kimmel',          'the_roll_open', true, true, 'clean', true, 'BP038',    'founder_direct',  'pending', 'green', 'Late-night host and cooperative-class healthcare advocacy anchor — BP038 Pedestal-class personal-anchor.',    true, NULL),
  ('Stephen Colbert',       'the_roll_open', true, true, 'clean', true, 'BP044_W1', 'bishop_research', 'pending', 'green', 'Comedian and cooperative-class civic-discourse anchor — Better Know a District ancestry, faith-without-spectacle.', true, NULL),
  ('David Attenborough',    'the_roll_open', true, true, 'clean', true, 'BP044_W1', 'bishop_research', 'pending', 'green', 'Naturalist and broadcaster — 100yo cooperative-class environmental wisdom supreme.',                           true, NULL)
ON CONFLICT (id) DO NOTHING;

-- Founder-direct removals (deceased-class or veto-class per BP044 W1)
-- Inserted as deceased_class=true or dual_veto_trigger=true so they appear in DB for audit trail
INSERT INTO public.roll_members (display_name, class, famous_class, deceased_class, tribute_class, dual_veto_trigger, dual_veto_reason, dual_veto_by, lb_not_suggesting, bp_session_ratified, nominated_by, pedestal_vote_status) VALUES
  ('Tom Brady',             'the_roll_open', true, false, false, true,  'polarizer-out per BP044 W1 — cooperative-class universal-access invariant',                      'founder', false, 'BP044_W1', 'founder_direct', 'decline'),
  ('Spike Lee',             'the_roll_open', true, false, false, true,  'polarizer-out per BP044 W1 — cooperative-class universal-access invariant',                      'founder', false, 'BP044_W1', 'founder_direct', 'decline'),
  ('Greta Thunberg',        'the_roll_open', true, false, false, true,  'polarizer-out per BP044 W1 — cooperative-class universal-access invariant',                      'founder', false, 'BP044_W1', 'founder_direct', 'decline'),
  ('Patrisse Cullors',      'the_roll_open', true, false, false, true,  'polarizer-out per BP044 W1 — cooperative-class universal-access invariant',                      'founder', false, 'BP044_W1', 'founder_direct', 'decline'),
  ('Zach Bryan',            'the_roll_open', true, false, false, true,  'allegation-respect per BP044 W1 — cooperative-class peer-witness Body-Cam integrity',            'founder', false, 'BP044_W1', 'founder_direct', 'decline'),
  ('Oprah Winfrey',         'the_roll_open', true, false, false, true,  'platform-effect-class per BP044 W1 — cooperative-class gravity-well risk',                       'founder', false, 'BP044_W1', 'founder_direct', 'decline'),
  ('Geoffrey Rush',         'the_roll_open', true, false, false, false, NULL,                                                                                              NULL,      true,  'BP044_W1', 'founder_direct', 'pending'),
  ('Tim Allen',             'the_roll_open', true, false, false, false, NULL,                                                                                              NULL,      true,  'BP044_W1', 'founder_direct', 'pending'),
  ('William H. Macy',       'the_roll_open', true, false, false, false, NULL,                                                                                              NULL,      true,  'BP044_W1', 'founder_direct', 'pending'),
  ('Paul Reubens',          'the_roll_open', true, true,  true,  false, NULL,                                                                                              NULL,      false, 'BP044_W1', 'founder_direct', 'decline'),
  ('Alan Rickman',          'the_roll_open', true, true,  true,  false, NULL,                                                                                              NULL,      false, 'BP044_W1', 'founder_direct', 'decline'),
  ('Anthony Bourdain',      'the_roll_open', true, true,  true,  false, NULL,                                                                                              NULL,      false, 'BP044_W1', 'founder_direct', 'decline')
ON CONFLICT (id) DO NOTHING;

-- DEFER-pending-allegation-clarity (NOT permanent veto · revisit BP046+)
INSERT INTO public.roll_members (display_name, class, famous_class, prong_b_body_cam_class, lb_not_suggesting, lb_not_suggesting_reason, bp_session_ratified, nominated_by, pedestal_vote_status, body_cam_status_badge) VALUES
  ('Drake',                 'the_roll_open', true, 'defer', false, NULL, 'BP044_W1', 'founder_direct', 'pending', 'deferred'),
  ('David Adjaye',          'the_roll_open', true, 'defer', false, NULL, 'BP044_W1', 'founder_direct', 'pending', 'deferred'),
  ('Sherman Alexie',        'the_roll_open', true, 'yellow_flagged', false, NULL, 'BP044_W1', 'founder_direct', 'decline', 'yellow')
ON CONFLICT (id) DO NOTHING;
