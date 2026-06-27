-- =============================================================================
-- M22 · Phoenix Phase A Foundation
-- Session: BP096 · Bishop SEG-BL · Sonnet 4.6 · 2026-06-26
-- Authorization: BP096 Master Plan §3 DB Schema Spec — Founder ratification
--                required before Knight applies this migration (§10 checklist)
--
-- Pearl anchor: b87d4cbbba13d2b8
-- Canon refs:
--   canon_csia_contributor_20_80_royalty_split_cla_assignment_provisional_filing_pathway_bp096
--   canon_dev_recruitment_funnel_social_letter_fork_bounty_ip_ledger_attribute_loop_bp092
--   canon_patent_floater_300_pool_revised_math_165_country_60_empress_75_puzzle_bp092
--   canon_knight_sql_target_postgres_syntax_only_no_sqlite_primitives_bp089
--
-- DO NOT APPLY until Founder ratifies §10 checklist in
--   BISHOP_DROPZONE/00_FOUNDER_REVIEW/_BP096_MASTER_PLAN_PHOENIX_FLIGHT_M21.md
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- §1  ENUM: tier_eligibility
--     Controls which patent-floater allocation pool a member is eligible for.
--     Ref: canon_patent_floater_300_pool_revised_math_165_country_60_empress_75_puzzle_bp092
--     Values: Cooperative (baseline ~165 country), Empress (60 campaign winners),
--             Puzzle (75 golden-key dev slots), Country (reserved for ISO lock)
-- ---------------------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE tier_eligibility AS ENUM (
    'Cooperative',
    'Empress',
    'Puzzle',
    'Country'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON TYPE tier_eligibility IS
  'Patent floater allocation pool — BP096 M22. '
  '165-country baseline + 60 Empress Campaign + 75 Puzzle/Golden Keys = 300 total. '
  'Ref: canon_patent_floater_300_pool_revised_math_165_country_60_empress_75_puzzle_bp092';

-- ---------------------------------------------------------------------------
-- §2  ALTER entity_memberships
--     Add signup_order (sequential member number for card-flip UI),
--     category_firsts (JSONB ledger of per-member firsts claimed),
--     tier_eligibility (patent-floater tier).
-- ---------------------------------------------------------------------------

-- Sequence for signup_order: monotonically increasing, never gaps on reuse.
CREATE SEQUENCE IF NOT EXISTS entity_memberships_signup_order_seq
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

COMMENT ON SEQUENCE entity_memberships_signup_order_seq IS
  'Signup order sequence for entity_memberships. '
  'Drives member number card-flip UI. BP096 M22 §2.';

DO $$ BEGIN
  ALTER TABLE entity_memberships
    ADD COLUMN signup_order BIGINT DEFAULT nextval('entity_memberships_signup_order_seq');
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE entity_memberships
    ADD COLUMN category_firsts JSONB NOT NULL DEFAULT '{}';
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE entity_memberships
    ADD COLUMN tier_eligibility tier_eligibility;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

COMMENT ON COLUMN entity_memberships.signup_order IS
  'Sequential member number (1-based). Drives Founding Foundation card-flip UI. '
  'First 10,000 = named in Founding Foundation per canon. BP096 M22.';

COMMENT ON COLUMN entity_memberships.category_firsts IS
  'JSONB ledger of category-first achievements claimed by this member. '
  'Keys: e.g. "first_member_city_LA", "first_csia_submission_phase_1". '
  'Canonical record lives in category_firsts table — this is a denormalized cache. BP096 M22.';

COMMENT ON COLUMN entity_memberships.tier_eligibility IS
  'Patent-floater allocation pool eligibility. '
  'NULL = unassigned (pre-determination). '
  'Ref: canon_patent_floater_300_pool_revised_math_165_country_60_empress_75_puzzle_bp092. BP096 M22.';

CREATE INDEX IF NOT EXISTS idx_entity_memberships_signup_order
  ON entity_memberships (signup_order);

CREATE INDEX IF NOT EXISTS idx_entity_memberships_tier_eligibility
  ON entity_memberships (tier_eligibility)
  WHERE tier_eligibility IS NOT NULL;

-- ---------------------------------------------------------------------------
-- §3  TABLE: csia_referrals
--     Join-My-Crew referral tracking for CSIA/Captain page.
--     Named csia_referrals to avoid collision with existing public.referrals
--     table (different schema — Empress/general referral tracking).
--     Ref: canon_dev_recruitment_funnel_social_letter_fork_bounty_ip_ledger_attribute_loop_bp092
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS csia_referrals (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_member_id    UUID NOT NULL
                         REFERENCES entity_memberships(id) ON DELETE CASCADE,
  invitee_email        TEXT NOT NULL,
  invitee_member_id    UUID
                         REFERENCES entity_memberships(id) ON DELETE SET NULL,
  referral_code        TEXT NOT NULL,
  soccer_hash          TEXT,
  status               TEXT NOT NULL DEFAULT 'pending',
  marks_awarded        NUMERIC(12,4) NOT NULL DEFAULT 0,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  converted_at         TIMESTAMPTZ
);

COMMENT ON TABLE csia_referrals IS
  'Join-My-Crew referral tracking for CSIA Project and Captain crew formation. '
  'Separate from public.referrals (Empress/general). '
  'Ref: canon_dev_recruitment_funnel_social_letter_fork_bounty_ip_ledger_attribute_loop_bp092. BP096 M22.';

COMMENT ON COLUMN csia_referrals.inviter_member_id IS
  'entity_memberships.id of the member who sent the referral.';

COMMENT ON COLUMN csia_referrals.invitee_email IS
  'Email address of the invited party. May not yet be a member.';

COMMENT ON COLUMN csia_referrals.invitee_member_id IS
  'Populated on conversion — entity_memberships.id of the new member who joined via this referral.';

COMMENT ON COLUMN csia_referrals.referral_code IS
  'Short referral code (Join My Crew token) generated per-inviter. '
  'Distinct from referral_codes.code (Empress campaign influencer codes).';

COMMENT ON COLUMN csia_referrals.soccer_hash IS
  'Soccerball hash for cross-session referral identity verification. '
  'Ref: soccerball_emit / soccerball_decode substrate primitives.';

COMMENT ON COLUMN csia_referrals.status IS
  'pending | converted | expired. Pending = invite sent, not yet joined.';

COMMENT ON COLUMN csia_referrals.marks_awarded IS
  'Marks credited to inviter_member_id on successful conversion.';

ALTER TABLE csia_referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY csia_referrals_service_role_bypass ON csia_referrals
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY csia_referrals_member_select_own ON csia_referrals
  FOR SELECT TO authenticated
  USING (
    inviter_member_id IN (
      SELECT id FROM entity_memberships
      WHERE primary_contact_user_id = auth.uid()
    )
    OR
    invitee_member_id IN (
      SELECT id FROM entity_memberships
      WHERE primary_contact_user_id = auth.uid()
    )
  );

CREATE POLICY csia_referrals_member_insert_own ON csia_referrals
  FOR INSERT TO authenticated
  WITH CHECK (
    inviter_member_id IN (
      SELECT id FROM entity_memberships
      WHERE primary_contact_user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_csia_referrals_inviter
  ON csia_referrals (inviter_member_id);

CREATE INDEX IF NOT EXISTS idx_csia_referrals_invitee
  ON csia_referrals (invitee_member_id)
  WHERE invitee_member_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_csia_referrals_referral_code
  ON csia_referrals (referral_code);

CREATE INDEX IF NOT EXISTS idx_csia_referrals_status
  ON csia_referrals (status);

-- ---------------------------------------------------------------------------
-- §4  TABLE: csia_submissions
--     CSIA Project Phase 1 submissions. $250 fee (cash / light-at-end / sponsor).
--     Named csia_submissions to be unambiguous — no collision with arena_submissions
--     or other submission tables.
--     Ref: BP096 M21 §2 $250 Submission Fee Mechanic
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS csia_submissions (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id                 UUID NOT NULL
                              REFERENCES entity_memberships(id) ON DELETE CASCADE,
  phase                     TEXT NOT NULL DEFAULT 'Phase_1',
  category                  TEXT NOT NULL,
  submission_title          TEXT NOT NULL,
  submission_description    TEXT NOT NULL,
  ip_ledger_entry_id        UUID
                              REFERENCES ip_ledger_entries(entry_id) ON DELETE SET NULL,
  cla_agreement_id          UUID,
  assignment_agreement_id   UUID,
  fee_path                  TEXT NOT NULL DEFAULT 'cash',
  stripe_payment_intent_id  TEXT,
  fee_paid_usd              NUMERIC(10,2) NOT NULL DEFAULT 250.00,
  payment_status            TEXT NOT NULL DEFAULT 'pending',
  service_hours_documented  NUMERIC(5,1) NOT NULL DEFAULT 0,
  status                    TEXT NOT NULL DEFAULT 'submitted',
  winner                    BOOLEAN NOT NULL DEFAULT FALSE,
  prize_paid_at             TIMESTAMPTZ,
  submitted_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE csia_submissions IS
  'CSIA Project Phase submissions. $250 standard / $50+10hrs light-at-end / sponsor-covered. '
  '50% submission pool → winner prize · 50% → cooperative bills (bylaws-locked). '
  'Ref: BP096 M21 §2 / canon_csia_contributor_20_80_royalty_split_cla_assignment_provisional_filing_pathway_bp096.';

COMMENT ON COLUMN csia_submissions.member_id IS
  'entity_memberships.id of submitting contributor.';

COMMENT ON COLUMN csia_submissions.phase IS
  'CSIA Project phase — e.g. "Phase_1". Multiple winners per phase.';

COMMENT ON COLUMN csia_submissions.category IS
  'Submission category: UI_build | Scribes_suite | Mechanic_improvement | Tooling | Other.';

COMMENT ON COLUMN csia_submissions.ip_ledger_entry_id IS
  'Link to ip_ledger_entries Ed25519 timestamp for this contribution. '
  'Required for CLA/Assignment signing flow.';

COMMENT ON COLUMN csia_submissions.cla_agreement_id IS
  'FK to contributor_agreements.id where agreement_type = CLA. '
  'FK constraint added post-create to avoid circular dependency.';

COMMENT ON COLUMN csia_submissions.assignment_agreement_id IS
  'FK to contributor_agreements.id where agreement_type = Assignment. '
  'NULL until provisional filed + assignment signed (within 30 days).';

COMMENT ON COLUMN csia_submissions.fee_path IS
  'cash | light_at_end | sponsor_covered. '
  'light_at_end = $50 + 10hrs Stewards Guild service.';

COMMENT ON COLUMN csia_submissions.stripe_payment_intent_id IS
  'Stripe PaymentIntent ID for cash/light-at-end paths. NULL for sponsor-covered.';

COMMENT ON COLUMN csia_submissions.fee_paid_usd IS
  'Actual USD collected. $250 standard · $50 light-at-end · $0 sponsor-covered.';

COMMENT ON COLUMN csia_submissions.payment_status IS
  'pending | paid | waived (sponsor). Drives CSIA open gate.';

COMMENT ON COLUMN csia_submissions.service_hours_documented IS
  'Hours logged in IP Ledger for light-at-end path. Must reach 10 before submission confirms.';

COMMENT ON COLUMN csia_submissions.status IS
  'submitted | under_review | accepted | rejected.';

COMMENT ON COLUMN csia_submissions.winner IS
  'TRUE once cooperative admin ratifies winner. Triggers payout-csia-winner edge fn.';

COMMENT ON COLUMN csia_submissions.prize_paid_at IS
  'Timestamp of Stripe Connect transfer to contributor. NULL until paid.';

ALTER TABLE csia_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY csia_submissions_service_role_bypass ON csia_submissions
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY csia_submissions_member_insert_own ON csia_submissions
  FOR INSERT TO authenticated
  WITH CHECK (
    member_id IN (
      SELECT id FROM entity_memberships
      WHERE primary_contact_user_id = auth.uid()
    )
  );

CREATE POLICY csia_submissions_member_select_own ON csia_submissions
  FOR SELECT TO authenticated
  USING (
    member_id IN (
      SELECT id FROM entity_memberships
      WHERE primary_contact_user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_csia_submissions_member_id
  ON csia_submissions (member_id);

CREATE INDEX IF NOT EXISTS idx_csia_submissions_phase_status
  ON csia_submissions (phase, status);

CREATE INDEX IF NOT EXISTS idx_csia_submissions_winner
  ON csia_submissions (winner)
  WHERE winner = TRUE;

CREATE INDEX IF NOT EXISTS idx_csia_submissions_ip_ledger_entry
  ON csia_submissions (ip_ledger_entry_id)
  WHERE ip_ledger_entry_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_csia_submissions_payment_status
  ON csia_submissions (payment_status);

-- ---------------------------------------------------------------------------
-- §5  TABLE: csia_votes
--     Voting on CSIA submissions by cooperative members.
--     Named csia_votes to avoid collision with public.votes (credits/production
--     voting table with completely different schema).
--     -1 = reject · 0 = abstain · 1 = accept
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS csia_votes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voter_member_id   UUID NOT NULL
                      REFERENCES entity_memberships(id) ON DELETE CASCADE,
  submission_id     UUID NOT NULL
                      REFERENCES csia_submissions(id) ON DELETE CASCADE,
  vote_value        SMALLINT NOT NULL CHECK (vote_value IN (-1, 0, 1)),
  voted_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (voter_member_id, submission_id)
);

COMMENT ON TABLE csia_votes IS
  'Member votes on CSIA Project submissions. '
  '-1 = reject · 0 = abstain · 1 = accept. '
  'One vote per member per submission (UNIQUE constraint). '
  'Ref: BP096 M21 §4 submit-csia-entry / council_vote_tallies pattern. BP096 M22.';

COMMENT ON COLUMN csia_votes.voter_member_id IS
  'entity_memberships.id of voting member.';

COMMENT ON COLUMN csia_votes.submission_id IS
  'csia_submissions.id being voted on.';

COMMENT ON COLUMN csia_votes.vote_value IS
  '-1 = reject · 0 = abstain · 1 = accept. '
  'Mirrors Star Chamber verdict pattern — explicit abstain not silence.';

ALTER TABLE csia_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY csia_votes_service_role_bypass ON csia_votes
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY csia_votes_member_insert_own ON csia_votes
  FOR INSERT TO authenticated
  WITH CHECK (
    voter_member_id IN (
      SELECT id FROM entity_memberships
      WHERE primary_contact_user_id = auth.uid()
    )
  );

-- Votes are publicly visible — cooperative transparency
CREATE POLICY csia_votes_authenticated_select_all ON csia_votes
  FOR SELECT TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_csia_votes_submission_id
  ON csia_votes (submission_id);

CREATE INDEX IF NOT EXISTS idx_csia_votes_voter_member_id
  ON csia_votes (voter_member_id);

CREATE INDEX IF NOT EXISTS idx_csia_votes_vote_value
  ON csia_votes (submission_id, vote_value);

-- ---------------------------------------------------------------------------
-- §6  TABLE: bounty_posters
--     Poster registry for /bounty-posters/ landing page.
--     5 initial posters: Empress, CSIA, Cities, BetterSite, DevCrew.
--     status: staged → live → closed
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS bounty_posters (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poster_slug      TEXT NOT NULL UNIQUE,
  poster_title     TEXT NOT NULL,
  category         TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'staged',
  bp_origin        TEXT NOT NULL,
  goes_live_at     TIMESTAMPTZ,
  closed_at        TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE bounty_posters IS
  'Bounty poster registry for /bounty-posters/ landing page. '
  'Drives flip-card display per BP093 spec. '
  'categories: Empress | CSIA | Cities | BetterSite | DevCrew. '
  'Ref: canon_generate_dev_contribution_bounty_poster_gadget_spec_three_tier_marks_plus_floater_eligibility_bp092. '
  'BP096 M22.';

COMMENT ON COLUMN bounty_posters.poster_slug IS
  'URL-safe slug — unique identifier for Hugo page references.';

COMMENT ON COLUMN bounty_posters.poster_title IS
  'Display title shown on poster card.';

COMMENT ON COLUMN bounty_posters.category IS
  'Empress | CSIA | Cities | BetterSite | DevCrew.';

COMMENT ON COLUMN bounty_posters.status IS
  'staged = in vault, not displayed · live = public on /bounty-posters/ · closed = campaign ended.';

COMMENT ON COLUMN bounty_posters.bp_origin IS
  'Bishop session that created this poster row (e.g. BP096).';

COMMENT ON COLUMN bounty_posters.goes_live_at IS
  'Scheduled go-live timestamp. NULL = admin-manual flip to live.';

ALTER TABLE bounty_posters ENABLE ROW LEVEL SECURITY;

CREATE POLICY bounty_posters_service_role_bypass ON bounty_posters
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Members can SELECT live posters only; staged/closed = service_role only
CREATE POLICY bounty_posters_authenticated_select_live ON bounty_posters
  FOR SELECT TO authenticated
  USING (status = 'live');

-- Anon (not logged in) can also see live posters for /bounty-posters/ public page
CREATE POLICY bounty_posters_anon_select_live ON bounty_posters
  FOR SELECT TO anon
  USING (status = 'live');

CREATE INDEX IF NOT EXISTS idx_bounty_posters_status
  ON bounty_posters (status);

CREATE INDEX IF NOT EXISTS idx_bounty_posters_category
  ON bounty_posters (category);

CREATE INDEX IF NOT EXISTS idx_bounty_posters_goes_live_at
  ON bounty_posters (goes_live_at)
  WHERE goes_live_at IS NOT NULL;

-- ---------------------------------------------------------------------------
-- §7  ALTER ip_ledger_entries — ADD MISSING COLUMNS
--     Existing schema (9 cols): id, entry_id, ring_bearer_peer_id,
--     contribution_type, payload_hash, payload_url, stamped_at,
--     signature_ed25519, mesh_replicated
--     Add all M21 §3 legal/IP columns. All idempotent DO $$ blocks.
-- ---------------------------------------------------------------------------

DO $$ BEGIN
  ALTER TABLE ip_ledger_entries
    ADD COLUMN inventor_name TEXT;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE ip_ledger_entries
    ADD COLUMN royalty_share_pct NUMERIC(5,2) NOT NULL DEFAULT 20;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE ip_ledger_entries
    ADD COLUMN cooperative_share_pct NUMERIC(5,2) NOT NULL DEFAULT 80;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE ip_ledger_entries
    ADD COLUMN patent_application_number TEXT;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE ip_ledger_entries
    ADD COLUMN filing_status TEXT NOT NULL DEFAULT 'pending';
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE ip_ledger_entries
    ADD COLUMN assignment_signed_at TIMESTAMPTZ;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE ip_ledger_entries
    ADD COLUMN cla_signed_at TIMESTAMPTZ;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE ip_ledger_entries
    ADD COLUMN marks_awarded NUMERIC(12,4) NOT NULL DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE ip_ledger_entries
    ADD COLUMN csia_phase TEXT;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE ip_ledger_entries
    ADD COLUMN submission_fee_paid BOOLEAN NOT NULL DEFAULT FALSE;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE ip_ledger_entries
    ADD COLUMN submission_fee_path TEXT;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

COMMENT ON COLUMN ip_ledger_entries.inventor_name IS
  'Human-readable name of the named inventor. '
  'Preserved in IP Ledger for USPTO patent application. BP096 M22.';

COMMENT ON COLUMN ip_ledger_entries.royalty_share_pct IS
  '20% NET licensing revenue → named inventor(s). '
  'Locked in Cooperative Bylaws schedule. No clawback. '
  'Ref: canon_csia_contributor_20_80_royalty_split_cla_assignment_provisional_filing_pathway_bp096.';

COMMENT ON COLUMN ip_ledger_entries.cooperative_share_pct IS
  '80% NET licensing revenue → Liana Banyan Cooperative (infrastructure + 50-yr charter). '
  'Ref: canon_csia_contributor_20_80_royalty_split_cla_assignment_provisional_filing_pathway_bp096.';

COMMENT ON COLUMN ip_ledger_entries.patent_application_number IS
  'USPTO provisional or nonprovisional application number. '
  'NULL until provisional filed. Assignment signed within 30 days of filing.';

COMMENT ON COLUMN ip_ledger_entries.filing_status IS
  'Provisional filing lifecycle: '
  'pending | provisional_filed | assignment_signed | nonprovisional_filed | granted | licensed. '
  'Drives sign-assignment edge fn validation (30-day window).';

COMMENT ON COLUMN ip_ledger_entries.assignment_signed_at IS
  'Timestamp of contributor Assignment signing. '
  'Must occur within 30 days of provisional filing. '
  'Ref: 35 U.S.C. § 116 + Wyoming governing law.';

COMMENT ON COLUMN ip_ledger_entries.cla_signed_at IS
  'Timestamp of contributor CLA signing. '
  'CLA must precede submission. Set by sign-cla edge function.';

COMMENT ON COLUMN ip_ledger_entries.marks_awarded IS
  'Cooperative Marks credited to contributor for this IP Ledger entry. '
  '0.05 Marks per cleared code contribution per code contribution pipeline canon.';

COMMENT ON COLUMN ip_ledger_entries.csia_phase IS
  'CSIA Project phase this entry is attributed to (e.g. "Phase_1").';

COMMENT ON COLUMN ip_ledger_entries.submission_fee_paid IS
  'TRUE once $250 / $50 / sponsor payment confirmed. '
  'Required gate for submit-csia-entry edge fn.';

COMMENT ON COLUMN ip_ledger_entries.submission_fee_path IS
  'cash | light_at_end | sponsor_covered. '
  'Drives payment UI branch on /csia-project/.';

-- New indexes for M21 §3 required indexes on ip_ledger_entries
CREATE INDEX IF NOT EXISTS idx_ip_ledger_entries_inventor_name
  ON ip_ledger_entries (inventor_name)
  WHERE inventor_name IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ip_ledger_entries_filing_status
  ON ip_ledger_entries (filing_status);

CREATE INDEX IF NOT EXISTS idx_ip_ledger_entries_csia_phase
  ON ip_ledger_entries (csia_phase)
  WHERE csia_phase IS NOT NULL;

-- ---------------------------------------------------------------------------
-- §8  TABLE: contributor_agreements
--     Immutable CLA + Assignment e-signature records.
--     Two-document structure per Wyoming governing law.
--     Attorney review required before /contribute/ page launches.
--     Ref: BP096 M21 §2 CLA + Assignment Two-Document Structure
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS contributor_agreements (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agreement_type            TEXT NOT NULL,
  cla_text_version          TEXT,
  assignment_text_version   TEXT,
  ip_ledger_entry_id        UUID REFERENCES ip_ledger_entries(entry_id) ON DELETE SET NULL,
  signed_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sig_method                TEXT NOT NULL DEFAULT 'e-signature-inline',
  sig_data                  BYTEA,
  wyoming_law_acknowledged  BOOLEAN NOT NULL DEFAULT FALSE,
  attorney_review_waived    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE contributor_agreements IS
  'Immutable CLA + Assignment e-signature records. '
  'Two-document mandatory structure per BP096 §2. No UPDATE/DELETE — append-only. '
  'TRUTH-ALWAYS: Attorney review required before /contribute/ page launches. '
  'Wyoming governing law. 35 U.S.C. § 116 joint inventor default context. '
  'Ref: canon_csia_contributor_20_80_royalty_split_cla_assignment_provisional_filing_pathway_bp096.';

COMMENT ON COLUMN contributor_agreements.user_id IS
  'auth.users.id of the signing contributor.';

COMMENT ON COLUMN contributor_agreements.agreement_type IS
  'CLA | Assignment. CLA must precede Assignment for same ip_ledger_entry_id.';

COMMENT ON COLUMN contributor_agreements.cla_text_version IS
  'Version identifier of CLA template text (e.g. "v1.0"). '
  'Enables future text upgrades while preserving what was signed.';

COMMENT ON COLUMN contributor_agreements.assignment_text_version IS
  'Version identifier of Assignment template text. '
  'NULL for rows where agreement_type = CLA.';

COMMENT ON COLUMN contributor_agreements.ip_ledger_entry_id IS
  'ip_ledger_entries.id this agreement is bound to. '
  'sign-cla edge fn validates no prior CLA exists for this entry.';

COMMENT ON COLUMN contributor_agreements.sig_method IS
  'e-signature-inline | wet-ink-scan. '
  'Inline = checkbox + timestamp. Wet-ink = scanned PDF upload path.';

COMMENT ON COLUMN contributor_agreements.sig_data IS
  'Stored BYTEA hash of signed payload for integrity verification. '
  'NEVER stores PII — hash only.';

COMMENT ON COLUMN contributor_agreements.wyoming_law_acknowledged IS
  'Contributor confirmed Wyoming governing law disclosure at signing time.';

COMMENT ON COLUMN contributor_agreements.attorney_review_waived IS
  'Contributor acknowledged they were advised to seek attorney review '
  'and elected to proceed without. Required disclosure per BP096 §2.';

ALTER TABLE contributor_agreements ENABLE ROW LEVEL SECURITY;

CREATE POLICY contributor_agreements_service_role_bypass ON contributor_agreements
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Members can SELECT their own agreements
CREATE POLICY contributor_agreements_authenticated_select_own ON contributor_agreements
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Members can INSERT their own (sign-cla / sign-assignment edge fns write via service_role,
-- but this policy permits direct authenticated insert as fallback)
CREATE POLICY contributor_agreements_authenticated_insert_own ON contributor_agreements
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- No UPDATE or DELETE policies — immutable once signed

CREATE INDEX IF NOT EXISTS idx_contributor_agreements_user_id
  ON contributor_agreements (user_id);

CREATE INDEX IF NOT EXISTS idx_contributor_agreements_user_type
  ON contributor_agreements (user_id, agreement_type);

CREATE INDEX IF NOT EXISTS idx_contributor_agreements_ip_ledger_entry
  ON contributor_agreements (ip_ledger_entry_id)
  WHERE ip_ledger_entry_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- §9  FK wiring: csia_submissions → contributor_agreements
--     Added after contributor_agreements table exists.
--     Deferred because submissions table references agreements and
--     agreements references ip_ledger_entries.
-- ---------------------------------------------------------------------------

DO $$ BEGIN
  ALTER TABLE csia_submissions
    ADD CONSTRAINT csia_submissions_cla_agreement_fk
    FOREIGN KEY (cla_agreement_id)
    REFERENCES contributor_agreements(id)
    ON DELETE SET NULL;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE csia_submissions
    ADD CONSTRAINT csia_submissions_assignment_agreement_fk
    FOREIGN KEY (assignment_agreement_id)
    REFERENCES contributor_agreements(id)
    ON DELETE SET NULL;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_column THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- §10  TABLE: category_firsts
--      First-member-per-category achievement ledger.
--      Drives /cities/ leaderboard and other first-claimed badges.
--      INSERT restricted to admin / edge functions only (service_role).
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS category_firsts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category      TEXT NOT NULL,
  claimed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  marks_awarded NUMERIC(12,4) NOT NULL DEFAULT 0,
  UNIQUE (category, user_id)
);

COMMENT ON TABLE category_firsts IS
  'First-member-per-category achievement ledger. '
  'Drives /cities/ leaderboard ("first member in LA", etc.) and CSIA firsts. '
  'Public leaderboard visibility — SELECT all. '
  'INSERT = service_role / edge functions only (no member self-insert). BP096 M22.';

COMMENT ON COLUMN category_firsts.user_id IS
  'auth.users.id of the member who claimed this first.';

COMMENT ON COLUMN category_firsts.category IS
  'Category key e.g. "first_member_city_LA" | "first_csia_submission_phase_1". '
  'UNIQUE with user_id — one first per category per user.';

COMMENT ON COLUMN category_firsts.marks_awarded IS
  'Cooperative Marks credited to this member for claiming this first.';

ALTER TABLE category_firsts ENABLE ROW LEVEL SECURITY;

CREATE POLICY category_firsts_service_role_bypass ON category_firsts
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Public leaderboard: all authenticated can SELECT all
CREATE POLICY category_firsts_authenticated_select_all ON category_firsts
  FOR SELECT TO authenticated
  USING (true);

-- Anon can also read (public /cities/ leaderboard)
CREATE POLICY category_firsts_anon_select_all ON category_firsts
  FOR SELECT TO anon
  USING (true);

-- No member INSERT — service_role / edge functions only

CREATE INDEX IF NOT EXISTS idx_category_firsts_user_id
  ON category_firsts (user_id);

CREATE INDEX IF NOT EXISTS idx_category_firsts_category
  ON category_firsts (category);

CREATE INDEX IF NOT EXISTS idx_category_firsts_claimed_at
  ON category_firsts (claimed_at DESC);

-- ---------------------------------------------------------------------------
-- §11  EXISTING TABLE AUDIT NOTE (RLS on ip_ledger_entries)
--      ip_ledger_entries was created in I12_stamp_certified_ip_ledger.sql
--      with anon SELECT/INSERT + service_role ALL policies.
--      M22 does NOT alter those policies — they serve the ring-bearer mesh.
--      CSIA/CLA reading of own rows is handled via service_role edge functions.
--      If Founder wants direct member SELECT of own ip_ledger_entries,
--      add policy here. Staged as comment per BP096 M21 §3 RLS spec:
--      "SELECT own rows always; SELECT all rows for cooperative admin role;
--       INSERT own with CLA signed check"
--
--      Uncomment the block below ONLY after Founder ratifies member-direct
--      ip_ledger_entries access (current spec defers to edge fn reads):
--
-- CREATE POLICY ip_ledger_entries_member_select_own ON ip_ledger_entries
--   FOR SELECT TO authenticated
--   USING (
--     entry_id IN (
--       SELECT ip_ledger_entry_id FROM contributor_agreements
--       WHERE user_id = auth.uid()
--     )
--   );
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- §12  TRUTH-ALWAYS NOTES (applied at migration composition time)
--      These are operational flags, not schema. Staged as SQL comment block.
-- ---------------------------------------------------------------------------

/*
TRUTH-ALWAYS CARRY-FORWARD — BP096 M22 · DO NOT DELETE

1.  FOUNDER RATIFICATION REQUIRED before Knight applies this migration.
    §10 checklist in _BP096_MASTER_PLAN_PHOENIX_FLIGHT_M21.md must be
    confirmed. Migration file written but NOT applied.

2.  M15 BASELINE CONSOLIDATION — M21 §9 flags potential migration collision
    from M15 un-consolidated state. Knight must confirm prior to applying.
    Check: supabase migrations list --local and compare with production.

3.  ATTORNEY REVIEW — contributor_agreements and csia_submissions tables
    are schema only. CLA and Assignment text templates are Bishop-composed
    doctrine. Attorney review required before /contribute/ or /csia-project/
    pages go live. DO NOT launch signing flow without attorney-reviewed text.

4.  STRIPE_WEBHOOK_SECRET ROTATION — Must confirm current webhook secret
    is valid in production before wiring new CSIA $250 Stripe events.

5.  STRIPE CONNECT — Required for inventor royalty payouts (20% NET).
    Not currently wired. Stripe Connect account creation = M22 Knight scope.

6.  referrals TABLE COLLISION — public.referrals EXISTS with different schema
    (referrer_id UUID, referred_email TEXT, status, source_pool_id, etc.).
    M22 creates csia_referrals as a distinct table. Do NOT alter existing
    public.referrals — it serves Empress/general referral tracking separately.

7.  votes TABLE COLLISION — public.votes EXISTS with different schema
    (user_id, target_type, target_id, credits_pledged, production_level_at_vote).
    M22 creates csia_votes as a distinct table.

8.  submissions TABLE — public.submissions returned 0 rows from information_schema
    (table name exists in schema but has no columns defined). The spec-named
    table csia_submissions is created fresh to avoid ambiguity.

9.  ip_ledger_entries FK NOTE — ip_ledger_entries.id is BIGINT (not UUID).
    ip_ledger_entry_id columns in contributor_agreements and csia_submissions
    are typed as UUID which will fail FK constraint at apply time IF
    ip_ledger_entries.id is BIGINT. Knight must verify actual PK type and
    adjust FK column types if needed before applying.
    GADGET RECEIPT: ip_ledger_entries.id = bigint, entry_id = uuid.
    Using entry_id (UUID) as the FK target where referenced. The FK in
    contributor_agreements references ip_ledger_entries(id) — Knight must
    confirm whether id or entry_id is the intended join key and adjust.

10. PROV_23 PRIORITY — No CSIA paper publication until USPTO provisional
    receipt in hand. Wave 2 AI Licensing letters hold until PROV_23 receipt.

11. 59.5% vs 61.9% MESH ACCURACY — Do NOT publish either figure without
    Founder confirm (BP092 gadget receipt).

12. category_firsts vs entity_memberships.category_firsts — entity_memberships
    has a JSONB column added as denormalized cache. The canonical source of
    truth is the category_firsts table. Edge functions should write to both.
*/

COMMIT;
