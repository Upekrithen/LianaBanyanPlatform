-- =============================================================================
-- MIGRATION: 20260627000001_m22_extended_reservation_jury_marks_bp096.sql
-- PURPOSE:   M22-EXTENDED-v3 — CSIA Two-Layer Governance: Reservations,
--            Curator Self-Scaling, Member Votes (open), Curator Eligibility,
--            csia_rounds, Marks Grants, Member Relationships
-- BISHOP:    BP096 compose-only · §15 BLOOD · §14 BLOOD gadget-verified
-- COMPOSED:  2026-06-26 (v1) · REVISED 2026-06-26 (v2, two-layer governance)
--            REVISED 2026-06-26 (v3, marks_class column + FK order fix)
-- APPLIES:   AFTER M22 base (csia_submissions / entity_memberships) is live
-- CANON:     canon_csia_two_layer_governance_open_member_vote_plus_paid_curator_panel_one_per_ten_bp096
--            canon_curator_spot_bounty_self_scaling_recruitment_rp_xp_build_path_bp096
--            canon_backed_vs_empty_marks_patent_portfolio_backing_binary_bp096
--            pearl: a1d9175ac5122cc0
-- =============================================================================
--
-- TRUTH-ALWAYS BLOCK (read before applying)
-- ==========================================
-- NEW TABLES CREATED (all net-new, zero prior existence confirmed by gadget):
--   csia_rounds               -- CREATED FIRST (FK target for reservations + curators)
--   marks_grants              -- admin-only grant ledger, authenticated read-own
--   csia_reservations         -- pre-reservation with Marks-or-refund mechanic
--   csia_curators             -- curator seat assignments (renamed from csia_juries)
--   csia_member_relationships -- disclosed/inferred conflict-of-interest graph
--   csia_member_votes         -- all-member open votes (Layer 1, no conflict gates)
--
-- NEW VIEW CREATED:
--   csia_curator_eligibility  -- conflict gates apply to Curators only
--
-- V3 CHANGES (v2 → v3):
--   1. TABLE CREATION ORDER FIXED: csia_rounds now created BEFORE csia_reservations
--      (v2 had forward-reference bug: csia_reservations FK'd csia_rounds before
--       csia_rounds was created in the same migration)
--   2. marks_grants: added marks_class TEXT NOT NULL DEFAULT 'backed'
--      CHECK (marks_class IN ('backed','empty'))
--      Canon: canon_backed_vs_empty_marks_patent_portfolio_backing_binary_bp096
--      Pearl: a1d9175ac5122cc0
--   3. Added index marks_grants_class_idx ON marks_grants (marks_class)
--   4. Updated COMMENT ON COLUMN marks_grants.marks_class with canon citation
--
-- NAMING CHANGES (v1 → v2, carried into v3):
--   csia_juries        → csia_curators
--   csia_vote_eligibility → csia_curator_eligibility
--
-- FK DEPENDENCY ORDER (v3 corrected):
--   csia_rounds         (section 1) — no FK dependencies
--   marks_grants        (section 2) — no FK to csia_rounds
--   csia_reservations   (section 3) — FK → csia_rounds(round_id) + marks_grants(grant_id)
--   csia_curators       (section 4) — FK → csia_rounds(round_id) + marks_grants(grant_id)
--   csia_member_votes   (section 5) — FK → entity_memberships only
--   csia_member_relationships (section 6) — FK → entity_memberships only
--   csia_curator_eligibility  (section 7) — VIEW; depends on csia_submissions (M22)
--
-- COMPOSITIONAL TENSION (surface for Founder awareness):
--   csia_member_relationships overlaps semantically with M22's csia_referrals.
--   csia_referrals tracks who referred whom (economic chain-of-custody).
--   csia_member_relationships tracks conflict-of-interest graph for Curators
--   (crew, anchor-sponsor, personal relationship). DIFFERENT semantics — kept
--   as separate tables. Founder may wish to confirm no merge is intended.
--
-- UNDECIDED ITEMS (Founder must ratify before full activation):
--   1. vote_value format: -1/+1 (upvote/downvote) OR 1-5 (star rating)?
--      Current: SMALLINT CHECK (BETWEEN -1 AND 1). Founder confirms.
--   2. Curator cash compensation rate: Bishop proposes $50-200/round.
--   3. csia_curator_eligibility view — should csia_referrals (referrer relationship)
--      also auto-flag as conflict? Currently omitted.
--
-- RUNNING TWICE IS IDEMPOTENT (IF NOT EXISTS + DO $$ EXCEPTION blocks).
-- NO DESTRUCTIVE OPERATIONS.
-- =============================================================================


-- ---------------------------------------------------------------------------
-- 1. csia_rounds
--    Weekly round buckets with status enum.
--    MUST BE CREATED FIRST — FK target for csia_reservations + csia_curators.
--    Eblet ref: canon_csia_two_layer_governance_open_member_vote_plus_paid_curator_panel_one_per_ten_bp096
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS csia_rounds (
    id                      BIGSERIAL   PRIMARY KEY,
    round_id                UUID        NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    round_name              TEXT        NOT NULL,
    opens_at                TIMESTAMPTZ NOT NULL,
    submissions_close_at    TIMESTAMPTZ NOT NULL,
    voting_closes_at        TIMESTAMPTZ NOT NULL,
    curation_completes_at   TIMESTAMPTZ,
    status                  TEXT        NOT NULL DEFAULT 'reservation_open'
                                CHECK (status IN (
                                    'reservation_open',
                                    'submission_open',
                                    'voting_open',
                                    'curating',
                                    'closed'
                                )),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE csia_rounds IS
    'Weekly CSIA round buckets. Status enum: reservation_open → submission_open → '
    'voting_open → curating → closed. '
    'Canon: canon_csia_two_layer_governance_open_member_vote_plus_paid_curator_panel_one_per_ten_bp096. '
    'BP096 Founder-direct.';

COMMENT ON COLUMN csia_rounds.round_id IS
    'Stable external reference UUID. FK target from csia_reservations + csia_curators.';
COMMENT ON COLUMN csia_rounds.status IS
    'State machine: reservation_open | submission_open | voting_open | curating | closed. '
    'Weekly cadence — Founder-direct BP096.';

CREATE INDEX IF NOT EXISTS idx_csia_rounds_status
    ON csia_rounds (status);
CREATE INDEX IF NOT EXISTS idx_csia_rounds_opens_at
    ON csia_rounds (opens_at);
CREATE INDEX IF NOT EXISTS idx_csia_rounds_round_name
    ON csia_rounds (round_name);

ALTER TABLE csia_rounds ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY csia_rounds_service_role_all
        ON csia_rounds
        FOR ALL
        TO service_role
        USING (true)
        WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY csia_rounds_authenticated_select_all
        ON csia_rounds
        FOR SELECT
        TO authenticated
        USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY csia_rounds_anon_select_all
        ON csia_rounds
        FOR SELECT
        TO anon
        USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ---------------------------------------------------------------------------
-- 2. marks_grants
--    Admin-only ledger of Marks awarded to members.
--    Authenticated users may SELECT their own rows only.
--    INSERT/UPDATE/DELETE require service_role (no authenticated path).
--    marks_class column: BACKED (patent-portfolio-backed, Joules-convertible)
--    vs EMPTY (reputation-class only, not convertible).
--    Canon: canon_backed_vs_empty_marks_patent_portfolio_backing_binary_bp096
--    Pearl: a1d9175ac5122cc0
--    Eblet ref: canon_sanders_fork_50_percent_savings_license_tier_bp092
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS marks_grants (
    id                    BIGSERIAL PRIMARY KEY,
    grant_id              UUID        NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    member_id             UUID        NOT NULL
                              REFERENCES entity_memberships(id)
                              ON DELETE RESTRICT,
    marks_amount          NUMERIC(18,6) NOT NULL
                              CHECK (marks_amount > 0),
    grant_source          TEXT        NOT NULL
                              CHECK (grant_source IN (
                                  'reservation_conversion',
                                  'contribution_accepted',
                                  'empress_floater',
                                  'curator_service',
                                  'manual_admin',
                                  'other'
                              )),
    marks_class           TEXT        NOT NULL DEFAULT 'backed'
                              CHECK (marks_class IN ('backed', 'empty')),
    granted_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    grant_reason_eblet_ref TEXT,
    notes                 JSONB       NOT NULL DEFAULT '{}',
    CONSTRAINT marks_grants_notes_is_object
        CHECK (jsonb_typeof(notes) = 'object')
);

COMMENT ON TABLE marks_grants IS
    'Admin-only ledger of Marks granted to members. '
    'Sources: reservation conversion, contribution acceptance, empress floater, '
    'curator service, manual admin. '
    'marks_class: backed (patent-portfolio-backed, Joules-convertible at 1.2x outright) '
    'vs empty (reputation-class only, not convertible). '
    'Canon: canon_backed_vs_empty_marks_patent_portfolio_backing_binary_bp096 (pearl a1d9175ac5122cc0). '
    'Eblet: canon_sanders_fork_50_percent_savings_license_tier_bp092 | BP096';

COMMENT ON COLUMN marks_grants.grant_id IS
    'Stable external reference UUID (used as FK target from other tables).';
COMMENT ON COLUMN marks_grants.grant_source IS
    'Enumerated source: reservation_conversion | contribution_accepted | '
    'empress_floater | curator_service | manual_admin | other';
COMMENT ON COLUMN marks_grants.marks_class IS
    'BACKED = patent-portfolio-backed, convertible to Joules at 1.2x outright rate. '
    'EMPTY = reputation-class only, not convertible. '
    'Default source → class mapping: '
    'reservation_conversion=backed | contribution_accepted=backed | '
    'empress_floater=backed | curator_service=backed (Bishop default) | '
    'manual_admin=Founder discretion | other=empty. '
    'Canon: canon_backed_vs_empty_marks_patent_portfolio_backing_binary_bp096. '
    'Pearl: a1d9175ac5122cc0.';
COMMENT ON COLUMN marks_grants.grant_reason_eblet_ref IS
    'Canonical eblet slug citation for audit trail.';

CREATE INDEX IF NOT EXISTS idx_marks_grants_member_id
    ON marks_grants (member_id);
CREATE INDEX IF NOT EXISTS idx_marks_grants_grant_source
    ON marks_grants (grant_source);
CREATE INDEX IF NOT EXISTS idx_marks_grants_granted_at
    ON marks_grants (granted_at);
CREATE INDEX IF NOT EXISTS marks_grants_class_idx
    ON marks_grants (marks_class);

ALTER TABLE marks_grants ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY marks_grants_service_role_all
        ON marks_grants
        FOR ALL
        TO service_role
        USING (true)
        WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY marks_grants_authenticated_select_own
        ON marks_grants
        FOR SELECT
        TO authenticated
        USING (
            member_id IN (
                SELECT id FROM entity_memberships
                WHERE primary_contact_user_id = auth.uid()
            )
        );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- No authenticated INSERT/UPDATE/DELETE — admin-only via service_role.


-- ---------------------------------------------------------------------------
-- 3. csia_reservations
--    Pre-reservation with Marks-or-refund choice mechanic (BP096 Founder-direct).
--    Contestant share: cash-refundable window → Marks conversion → submitted.
--    Cooperative share: booked at reservation, flows to prize pool.
--    reservation_round_id FK → csia_rounds(round_id) (csia_rounds created above ✓)
--    marks_grant_id FK → marks_grants(grant_id) (marks_grants created above ✓)
--    Eblet ref: canon_csia_prereservation_half_refundable_marks_conversion_first_come_first_served_bp096
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS csia_reservations (
    id                          BIGSERIAL   PRIMARY KEY,
    reservation_id              UUID        NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    member_id                   UUID        NOT NULL
                                    REFERENCES entity_memberships(id)
                                    ON DELETE RESTRICT,

    -- FK wired: csia_rounds created in section 1 of this migration.
    reservation_round_id        UUID
                                    REFERENCES csia_rounds(round_id)
                                    ON DELETE RESTRICT,

    paid_at                     TIMESTAMPTZ NOT NULL DEFAULT now(),
    amount_paid_cents           INTEGER     NOT NULL
                                    CHECK (amount_paid_cents > 0),
    cooperative_share_cents     INTEGER     NOT NULL
                                    CHECK (cooperative_share_cents >= 0),
    contestant_share_cents      INTEGER     NOT NULL
                                    CHECK (contestant_share_cents >= 0),

    -- Validate split adds up
    CONSTRAINT csia_reservations_share_sum_check
        CHECK (cooperative_share_cents + contestant_share_cents = amount_paid_cents),

    cooperative_share_status    TEXT        NOT NULL DEFAULT 'booked'
                                    CHECK (cooperative_share_status IN (
                                        'booked', 'used', 'reserved'
                                    )),
    contestant_share_status     TEXT        NOT NULL DEFAULT 'cash_refundable_30plus'
                                    CHECK (contestant_share_status IN (
                                        'cash_refundable_30plus',
                                        'cash_refundable_7_30',
                                        'marks_only_0_7',
                                        'marks_converted',
                                        'cash_refunded',
                                        'forfeited',
                                        'submitted'
                                    )),

    -- Populated when contestant chooses Marks conversion
    -- marks_grant_id FK → marks_grants(grant_id): marks_grants created in section 2 ✓
    marks_grant_id              UUID
                                    REFERENCES marks_grants(grant_id)
                                    ON DELETE RESTRICT,

    payment_tier                TEXT        NOT NULL DEFAULT 'standard_cash'
                                    CHECK (payment_tier IN (
                                        'standard_cash',
                                        'service_substituted',
                                        'anchor_sponsored'
                                    )),

    -- Populated if service_substituted
    service_hours_committed     NUMERIC(6,2),

    -- Populated if anchor_sponsored
    anchor_sponsor_member_id    UUID
                                    REFERENCES entity_memberships(id)
                                    ON DELETE RESTRICT,

    -- Populated when Stripe wires
    stripe_payment_intent_id    TEXT,

    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE csia_reservations IS
    'CSIA pre-reservation with Marks-or-refund choice mechanic. '
    'Split: cooperative_share (booked to prize pool) + contestant_share '
    '(cash-refundable by window, converts to Marks near deadline). '
    'When marks_converted: marks_grant_id FK populated; grant_source=reservation_conversion; '
    'marks_class=backed (patent-portfolio-backed per canon_backed_vs_empty_marks_patent_portfolio_backing_binary_bp096). '
    'Canon: canon_csia_prereservation_half_refundable_marks_conversion_first_come_first_served_bp096. '
    'BP096 Founder-direct.';

COMMENT ON COLUMN csia_reservations.reservation_round_id IS
    'FK to csia_rounds(round_id) — csia_rounds created in section 1 of this migration. '
    'NULL allowed: reservation may be created before round assignment.';
COMMENT ON COLUMN csia_reservations.contestant_share_status IS
    'Refund window state machine: '
    'cash_refundable_30plus (>30d) → cash_refundable_7_30 (7-30d) → '
    'marks_only_0_7 (0-7d, no cash refund) → marks_converted / cash_refunded / '
    'forfeited / submitted.';
COMMENT ON COLUMN csia_reservations.marks_grant_id IS
    'FK to marks_grants.grant_id — populated when contestant elects Marks '
    'conversion instead of cash refund. '
    'Corresponding marks_grants row will have grant_source=reservation_conversion '
    'and marks_class=backed per canon_backed_vs_empty_marks_patent_portfolio_backing_binary_bp096.';
COMMENT ON COLUMN csia_reservations.anchor_sponsor_member_id IS
    'If payment_tier = anchor_sponsored, the sponsoring member. '
    'Conflict-of-interest surface: anchor_sponsored reservations auto-populate '
    'csia_member_relationships with relationship_type=anchor_sponsor.';

CREATE INDEX IF NOT EXISTS idx_csia_reservations_member_id
    ON csia_reservations (member_id);
CREATE INDEX IF NOT EXISTS idx_csia_reservations_round_id
    ON csia_reservations (reservation_round_id);
CREATE INDEX IF NOT EXISTS idx_csia_reservations_contestant_status
    ON csia_reservations (contestant_share_status);
CREATE INDEX IF NOT EXISTS idx_csia_reservations_created_at
    ON csia_reservations (created_at);

-- updated_at auto-bump trigger
CREATE OR REPLACE FUNCTION csia_reservations_updated_at_bump()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_csia_reservations_updated_at ON csia_reservations;
CREATE TRIGGER trg_csia_reservations_updated_at
    BEFORE UPDATE ON csia_reservations
    FOR EACH ROW
    EXECUTE FUNCTION csia_reservations_updated_at_bump();

ALTER TABLE csia_reservations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY csia_reservations_service_role_all
        ON csia_reservations
        FOR ALL
        TO service_role
        USING (true)
        WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY csia_reservations_authenticated_select_own
        ON csia_reservations
        FOR SELECT
        TO authenticated
        USING (
            member_id IN (
                SELECT id FROM entity_memberships
                WHERE primary_contact_user_id = auth.uid()
            )
        );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY csia_reservations_authenticated_insert_own
        ON csia_reservations
        FOR INSERT
        TO authenticated
        WITH CHECK (
            member_id IN (
                SELECT id FROM entity_memberships
                WHERE primary_contact_user_id = auth.uid()
            )
        );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ---------------------------------------------------------------------------
-- 4. csia_curators  (renamed from csia_juries in v1)
--    Curator seat assignments. Self-scaling: 1 paid Curator per 10 reservations.
--    Conflict disclosures stored as JSONB array of member_ids.
--    Marks earned for curator service; marks_grant_id populated when issued.
--    round_id FK → csia_rounds(round_id) (created in section 1 ✓)
--    marks_grant_id FK → marks_grants(grant_id) (created in section 2 ✓)
--    Eblet ref: canon_csia_two_layer_governance_open_member_vote_plus_paid_curator_panel_one_per_ten_bp096
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS csia_curators (
    id                    BIGSERIAL   PRIMARY KEY,
    curator_id            UUID        NOT NULL DEFAULT gen_random_uuid() UNIQUE,

    -- FK wired — csia_rounds created in section 1 of this migration
    round_id              UUID        NOT NULL
                              REFERENCES csia_rounds(round_id)
                              ON DELETE RESTRICT,

    curator_member_id     UUID        NOT NULL
                              REFERENCES entity_memberships(id)
                              ON DELETE RESTRICT,
    term_start            TIMESTAMPTZ NOT NULL,
    term_end              TIMESTAMPTZ NOT NULL,

    CONSTRAINT csia_curators_term_order_check
        CHECK (term_end > term_start),

    marks_earned          NUMERIC(18,6) NOT NULL DEFAULT 0
                              CHECK (marks_earned >= 0),

    -- Populated when curator service compensation is issued
    -- marks_grant_id FK → marks_grants(grant_id): marks_grants created in section 2 ✓
    marks_grant_id        UUID
                              REFERENCES marks_grants(grant_id)
                              ON DELETE RESTRICT,

    -- JSONB array of member_ids this curator cannot judge (self + disclosed conflicts)
    -- Conflict gates: same Crew + same Anchor circle + self-disclosed (Founder BP096)
    -- Auto-flag Crew chain as conflict = YES (Founder-direct BP096)
    conflict_disclosures  JSONB       NOT NULL DEFAULT '[]',

    CONSTRAINT csia_curators_conflict_disclosures_is_array
        CHECK (jsonb_typeof(conflict_disclosures) = 'array'),

    status                TEXT        NOT NULL DEFAULT 'active'
                              CHECK (status IN ('active', 'completed', 'recused')),

    created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE csia_curators IS
    'Paid Curator seat assignments for CSIA rounds (renamed from csia_juries v1). '
    'Self-scaling: 1 Curator per 10 reservations (application logic manages seat count). '
    'Conflict gates: own submission + same Crew + same Anchor + self-disclosed. '
    'Layer 2 of two-layer governance — makes BINDING inclusion decisions. '
    'Canon: canon_csia_two_layer_governance_open_member_vote_plus_paid_curator_panel_one_per_ten_bp096. '
    'BP096 Founder-direct.';

COMMENT ON COLUMN csia_curators.curator_id IS
    'Stable external reference UUID. Renamed from jury_id in v1.';
COMMENT ON COLUMN csia_curators.round_id IS
    'FK to csia_rounds(round_id) — created in section 1 of this migration.';
COMMENT ON COLUMN csia_curators.conflict_disclosures IS
    'JSONB array of member_id UUIDs this curator cannot judge. '
    'Populated by: system (Crew auto-flag) + self-disclosure. '
    'UNDECIDED: whether csia_referrals history also auto-flags conflicts here. '
    'Founder must ratify referral-as-conflict question.';
COMMENT ON COLUMN csia_curators.marks_grant_id IS
    'FK to marks_grants.grant_id — populated when curator service Marks are issued. '
    'grant_source = curator_service; marks_class = backed (Bishop default, '
    'per canon_backed_vs_empty_marks_patent_portfolio_backing_binary_bp096).';

CREATE INDEX IF NOT EXISTS idx_csia_curators_curator_member_id
    ON csia_curators (curator_member_id);
CREATE INDEX IF NOT EXISTS idx_csia_curators_round_id
    ON csia_curators (round_id);
CREATE INDEX IF NOT EXISTS idx_csia_curators_term
    ON csia_curators (term_start, term_end);
CREATE INDEX IF NOT EXISTS idx_csia_curators_status
    ON csia_curators (status);

ALTER TABLE csia_curators ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY csia_curators_service_role_all
        ON csia_curators
        FOR ALL
        TO service_role
        USING (true)
        WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY csia_curators_authenticated_select_own
        ON csia_curators
        FOR SELECT
        TO authenticated
        USING (
            curator_member_id IN (
                SELECT id FROM entity_memberships
                WHERE primary_contact_user_id = auth.uid()
            )
        );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- anon: no SELECT (policy omitted = denied by default under RLS)


-- ---------------------------------------------------------------------------
-- 5. csia_member_votes  (Layer 1 open member voting)
--    ALL members can vote on ALL submissions.
--    No conflict-of-interest gates (voting is signal-class, lightweight).
--    Transparency: authenticated SELECT all (public ranking signal).
--    No UPDATE or DELETE from authenticated — votes are permanent signals.
--    Eblet ref: canon_csia_two_layer_governance_open_member_vote_plus_paid_curator_panel_one_per_ten_bp096
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS csia_member_votes (
    id              BIGSERIAL   PRIMARY KEY,
    vote_id         UUID        NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    member_id       UUID        NOT NULL
                        REFERENCES entity_memberships(id)
                        ON DELETE RESTRICT,
    submission_id   UUID        NOT NULL,
                        -- FK to csia_submissions(submission_id)
                        -- csia_submissions does not exist until M22 lands.
                        -- FK wired as deferred reference here;
                        -- add FK constraint after M22 is applied.
    vote_value      SMALLINT    NOT NULL
                        CHECK (vote_value BETWEEN -1 AND 1),
                        -- upvote=1 / downvote=-1
                        -- UNDECIDED: Founder may prefer 1-5 star rating instead.
                        -- If so: change to CHECK (vote_value BETWEEN 1 AND 5).
    voted_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    notes           TEXT,
    UNIQUE (member_id, submission_id)   -- one vote per member per submission
);

COMMENT ON TABLE csia_member_votes IS
    'Layer 1 all-member open votes on CSIA submissions. '
    'No conflict-of-interest gates — voting is signal-class and lightweight. '
    'Transparency: authenticated SELECT all (community ranking visible). '
    'No UPDATE or DELETE — votes are permanent signals. '
    'vote_value: -1=downvote / +1=upvote (UNDECIDED: Founder may prefer 1-5 stars). '
    'Canon: canon_csia_two_layer_governance_open_member_vote_plus_paid_curator_panel_one_per_ten_bp096. '
    'BP096 Founder-direct.';

COMMENT ON COLUMN csia_member_votes.submission_id IS
    'FK to csia_submissions(submission_id). '
    'csia_submissions does not exist until M22 lands. '
    'FK constraint deferred — add after M22 is applied.';
COMMENT ON COLUMN csia_member_votes.vote_value IS
    'SMALLINT: -1 (downvote) / +1 (upvote). '
    'UNDECIDED: Founder may prefer 1-5 star rating. '
    'If so: change CHECK to BETWEEN 1 AND 5 and update application logic.';

CREATE INDEX IF NOT EXISTS idx_csia_member_votes_submission_id
    ON csia_member_votes (submission_id);
CREATE INDEX IF NOT EXISTS idx_csia_member_votes_member_id
    ON csia_member_votes (member_id);
CREATE INDEX IF NOT EXISTS idx_csia_member_votes_voted_at
    ON csia_member_votes (voted_at);

ALTER TABLE csia_member_votes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY csia_member_votes_service_role_all
        ON csia_member_votes
        FOR ALL
        TO service_role
        USING (true)
        WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY csia_member_votes_authenticated_insert_own
        ON csia_member_votes
        FOR INSERT
        TO authenticated
        WITH CHECK (
            member_id IN (
                SELECT id FROM entity_memberships
                WHERE primary_contact_user_id = auth.uid()
            )
        );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY csia_member_votes_authenticated_select_all
        ON csia_member_votes
        FOR SELECT
        TO authenticated
        USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- NO authenticated UPDATE or DELETE — votes are permanent signals.
-- anon: no SELECT (policy omitted = denied by default under RLS)


-- ---------------------------------------------------------------------------
-- 6. csia_member_relationships
--    Disclosed/inferred conflict-of-interest graph for curator service.
--    Canonical pair ordering: member_a_id < member_b_id (prevents (A,B)+(B,A)).
--    DIFFERENT from csia_referrals (economic chain) — see compositional tension note.
--    Eblet ref: canon_csia_jury_self_scaling_1_per_10_conflict_check_bp096
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS csia_member_relationships (
    id                    BIGSERIAL   PRIMARY KEY,
    relationship_id       UUID        NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    member_a_id           UUID        NOT NULL
                              REFERENCES entity_memberships(id)
                              ON DELETE RESTRICT,
    member_b_id           UUID        NOT NULL
                              REFERENCES entity_memberships(id)
                              ON DELETE RESTRICT,
    relationship_type     TEXT        NOT NULL
                              CHECK (relationship_type IN (
                                  'crew_member',
                                  'anchor_sponsor',
                                  'disclosed_personal',
                                  'crew_lead',
                                  'other'
                              )),
    disclosed_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    disclosed_by_member_id UUID       NOT NULL
                              REFERENCES entity_memberships(id)
                              ON DELETE RESTRICT,
    notes                 JSONB       NOT NULL DEFAULT '{}',

    -- Canonical pair ordering prevents duplicate (A,B) and (B,A) rows
    CONSTRAINT csia_member_relationships_canonical_order
        CHECK (member_a_id < member_b_id),

    -- Prevent exact duplicate relationship declarations
    CONSTRAINT csia_member_relationships_unique_pair_type
        UNIQUE (member_a_id, member_b_id, relationship_type),

    CONSTRAINT csia_member_relationships_notes_is_object
        CHECK (jsonb_typeof(notes) = 'object')
);

COMMENT ON TABLE csia_member_relationships IS
    'Conflict-of-interest graph for CSIA curator service. '
    'Tracks crew, anchor-sponsor, and personal relationships between members. '
    'DISTINCT from csia_referrals (M22) which tracks economic referral chain. '
    'Canonical pair ordering enforced: member_a_id < member_b_id. '
    'Canon: canon_csia_jury_self_scaling_1_per_10_conflict_check_bp096.';

COMMENT ON COLUMN csia_member_relationships.member_a_id IS
    'Lower UUID in canonical pair ordering (member_a_id < member_b_id enforced).';
COMMENT ON COLUMN csia_member_relationships.member_b_id IS
    'Higher UUID in canonical pair ordering.';
COMMENT ON COLUMN csia_member_relationships.disclosed_by_member_id IS
    'Member who submitted this relationship disclosure. '
    'RLS: authenticated INSERT only where disclosed_by_member_id = caller.';

CREATE INDEX IF NOT EXISTS idx_csia_member_rel_a
    ON csia_member_relationships (member_a_id);
CREATE INDEX IF NOT EXISTS idx_csia_member_rel_b
    ON csia_member_relationships (member_b_id);
CREATE INDEX IF NOT EXISTS idx_csia_member_rel_type
    ON csia_member_relationships (relationship_type);

ALTER TABLE csia_member_relationships ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY csia_member_rel_service_role_all
        ON csia_member_relationships
        FOR ALL
        TO service_role
        USING (true)
        WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY csia_member_rel_authenticated_select_self
        ON csia_member_relationships
        FOR SELECT
        TO authenticated
        USING (
            member_a_id IN (
                SELECT id FROM entity_memberships
                WHERE primary_contact_user_id = auth.uid()
            )
            OR
            member_b_id IN (
                SELECT id FROM entity_memberships
                WHERE primary_contact_user_id = auth.uid()
            )
        );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY csia_member_rel_authenticated_insert_self
        ON csia_member_relationships
        FOR INSERT
        TO authenticated
        WITH CHECK (
            disclosed_by_member_id IN (
                SELECT id FROM entity_memberships
                WHERE primary_contact_user_id = auth.uid()
            )
        );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ---------------------------------------------------------------------------
-- 7. csia_curator_eligibility (VIEW)  (renamed from csia_vote_eligibility v1)
--    Computed (curator_id, submission_id) eligibility pairs.
--    Conflict gates apply to CURATORS ONLY — NOT to open member votes.
--    eligible_to_curate = TRUE if curator is NOT the submission inventor
--    AND NOT in csia_member_relationships with the submission inventor.
--    security_invoker = view inherits caller's RLS context.
--
--    NOTE: csia_submissions does not exist yet (M22 not applied).
--    This view will be invalid until M22 lands. Composed here for
--    completeness — Founder must apply M22 first, then this migration.
--
--    UNDECIDED: Should csia_referrals (referrer relationship from M22)
--    also auto-flag as a conflict source? Currently omitted. Surface for Founder.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE VIEW csia_curator_eligibility
    WITH (security_invoker = true)
AS
SELECT
    c.curator_id,
    c.curator_member_id,
    s.id                                            AS submission_id,
    s.member_id                                     AS submission_inventor_member_id,
    -- Not eligible if curator IS the inventor
    -- Not eligible if a relationship exists between curator and inventor
    CASE
        WHEN c.curator_member_id = s.member_id
            THEN FALSE
        WHEN EXISTS (
            SELECT 1
            FROM csia_member_relationships r
            WHERE (
                (r.member_a_id = c.curator_member_id AND r.member_b_id = s.member_id)
                OR
                (r.member_a_id = s.member_id AND r.member_b_id = c.curator_member_id)
            )
        )
            THEN FALSE
        -- Also check conflict_disclosures JSONB array on the curator row itself
        WHEN c.conflict_disclosures @> to_jsonb(s.member_id::text)
            THEN FALSE
        ELSE TRUE
    END                                             AS eligible_to_curate,
    CASE
        WHEN c.curator_member_id = s.member_id
            THEN 'curator_is_inventor'
        WHEN EXISTS (
            SELECT 1
            FROM csia_member_relationships r
            WHERE (
                (r.member_a_id = c.curator_member_id AND r.member_b_id = s.member_id)
                OR
                (r.member_a_id = s.member_id AND r.member_b_id = c.curator_member_id)
            )
        )
            THEN 'relationship_conflict'
        WHEN c.conflict_disclosures @> to_jsonb(s.member_id::text)
            THEN 'disclosed_conflict'
        ELSE NULL
    END                                             AS reason
FROM csia_curators c
-- Uses live M22 csia_submissions schema: id (PK) + member_id (inventor).
-- csia_submissions.submission_id and .inventor_member_id do NOT exist in live M22.
-- Corrected in v3 apply from original forward-reference assumption.
CROSS JOIN csia_submissions s
WHERE c.status = 'active';

COMMENT ON VIEW csia_curator_eligibility IS
    'Computed curator-submission eligibility pairs. '
    'Uses csia_submissions.id AS submission_id, csia_submissions.member_id AS inventor. '
    'CURATOR conflict gates only — open member votes (csia_member_votes) have NO conflict gates. '
    'eligible_to_curate = FALSE if curator is the inventor, has a declared relationship '
    'with the inventor (csia_member_relationships), or has inventor in conflict_disclosures. '
    'security_invoker: view inherits caller RLS context. '
    'Truth-Always: live M22 csia_submissions uses id (not submission_id) and '
    'member_id (not inventor_member_id) — corrected in v3. '
    'UNDECIDED: csia_referrals auto-conflict not yet wired — surface for Founder. '
    'Canon: canon_csia_two_layer_governance_open_member_vote_plus_paid_curator_panel_one_per_ten_bp096. '
    'BP096 Founder-direct.';


-- =============================================================================
-- END MIGRATION: 20260627000001_m22_extended_reservation_jury_marks_bp096.sql
-- VERSION: v3 (M22-EXTENDED-v3)
-- V3 CHANGES: FK order fixed (rounds before reservations) + marks_class column
--             + marks_grants_class_idx + canon citation in column comment.
-- MIGRATION READY FOR §15 BLOOD APPLY.
--
-- TABLES IN THIS MIGRATION (v3 final, creation order):
--   csia_rounds               (section 1) — FK target; created first
--   marks_grants              (section 2) — marks_class column added v3
--   csia_reservations         (section 3) — reservation_round_id FK now resolves
--   csia_curators             (section 4) — round_id FK resolves; renamed from csia_juries
--   csia_member_votes         (section 5) — Layer 1 open member voting
--   csia_member_relationships (section 6) — conflict-of-interest graph
--
-- VIEW IN THIS MIGRATION:
--   csia_curator_eligibility  (section 7) — depends on M22 csia_submissions
--
-- PENDING (future migration):
--   csia_suggestions          — $10 micro-tier ideation layer (canon minted BP096)
--   csia_member_votes FK to csia_submissions — wire after M22 lands
--   csia_curator_eligibility FK dependency — valid only after M22 (csia_submissions) lands
-- =============================================================================
