-- KN105 / BP016 — Excalibur Class Commercial Subscription Tables
-- ================================================================
-- Excalibur Class: per-topic/per-category curated-tested Scribe slices
-- Commercial path: Upekrithen LLC (Apache 2.0, NOT AGPL)
-- Pricing: Member-data-licensing-share-back-pay × Cost+20%
-- Anti-extraction: per-user data stamping + public dashboard + Marked Exception

-- ── Excalibur Slices ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS excalibur_slices (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  TEXT NOT NULL,
  granularity           TEXT NOT NULL CHECK (granularity IN ('topic', 'category')),
  topics_included       TEXT[] NOT NULL DEFAULT '{}',
  excalibur_tag_assigned BOOLEAN NOT NULL DEFAULT false,
  tag_assignment_at     TIMESTAMPTZ,
  status                TEXT NOT NULL DEFAULT 'proposed'
                         CHECK (status IN ('proposed', 'under_review', 'excalibur_class', 'raw_federation_library', 'rejected')),
  -- Pricing (Cost+20% per Structural Bylaw)
  one_time_payment_usd  NUMERIC(10, 2) NOT NULL DEFAULT 0,
  subscription_annual_usd NUMERIC(10, 2) NOT NULL DEFAULT 0,
  m_share_usd           NUMERIC(10, 4) NOT NULL DEFAULT 1.00,
  n_opted_in_contributors INT NOT NULL DEFAULT 0,
  -- Gate status (JSON blob for flexibility; individual gates tracked in excalibur_slice_gates)
  gate_results          JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE excalibur_slices IS
  'KN105/BP016 — Excalibur Class Scribe slice registry. '
  '"Only the worthy wield Excalibur." '
  'Status: proposed → under_review → excalibur_class | raw_federation_library | rejected.';

-- ── Gate Results ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS excalibur_slice_gates (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slice_id              UUID NOT NULL REFERENCES excalibur_slices(id) ON DELETE CASCADE,
  gate_name             TEXT NOT NULL
                         CHECK (gate_name IN (
                           'cathedral_effect_verification',
                           'furnace_gate',
                           'adversarial_fence_testing',
                           'federation_member_vote'
                         )),
  passed                BOOLEAN NOT NULL DEFAULT false,
  gate_metadata         JSONB NOT NULL DEFAULT '{}'::jsonb,
  evaluated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (slice_id, gate_name)
);

COMMENT ON TABLE excalibur_slice_gates IS
  'KN105/BP016 — 4-gate Excalibur tag-assignment gate results per slice. '
  'BRIDLE Rule 4: ambiguous/borderline → NOT assigning tag.';

-- ── Member Contributions ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS excalibur_member_contributions (
  id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slice_id                        UUID NOT NULL REFERENCES excalibur_slices(id) ON DELETE CASCADE,
  member_id                       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  contribution_share_proportion   NUMERIC(8, 6) NOT NULL DEFAULT 0 CHECK (contribution_share_proportion >= 0 AND contribution_share_proportion <= 1),
  opt_in_status                   TEXT NOT NULL DEFAULT 'unknown_default_out'
                                   CHECK (opt_in_status IN ('opted_in', 'opted_out', 'unknown_default_out')),
  opted_in_at                     TIMESTAMPTZ,
  opted_out_at                    TIMESTAMPTZ,
  created_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (slice_id, member_id)
);

COMMENT ON TABLE excalibur_member_contributions IS
  'KN105/BP016 — Member data-contribution opt-in registry. '
  'Members who opt in allow their data into Excalibur Class and earn share-back-pay. '
  'Opt-out preserves AGPL-baseline Federation participation but excludes from share-back.';

-- ── Federation Member Votes ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS excalibur_member_votes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slice_id    UUID NOT NULL REFERENCES excalibur_slices(id) ON DELETE CASCADE,
  voter_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vote        TEXT NOT NULL CHECK (vote IN ('yes', 'no')),
  voted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (slice_id, voter_id)  -- one vote per member per slice
);

COMMENT ON TABLE excalibur_member_votes IS
  'KN105/BP016 — Federation member votes on Excalibur tag-assignment. '
  'Gate 4 requires quorum (default 50%) + approval threshold (default 60% yes). '
  'Community governance — NOT LB Corp gatekeeping.';

-- ── Subscriptions ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS excalibur_subscriptions (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  slice_id                  UUID NOT NULL REFERENCES excalibur_slices(id) ON DELETE CASCADE,
  granularity               TEXT NOT NULL CHECK (granularity IN ('topic', 'category')),
  state                     TEXT NOT NULL DEFAULT 'inactive'
                             CHECK (state IN ('inactive', 'active_one_time', 'active_subscription', 'cancelled', 'lapsed')),
  stripe_session_id         TEXT,
  stripe_subscription_id    TEXT,
  activated_at              TIMESTAMPTZ,
  expires_at                TIMESTAMPTZ,
  cancelled_at              TIMESTAMPTZ,
  lapsed_at                 TIMESTAMPTZ,
  -- Auto-grants cohort_class=excalibur_class_subscriber on activation (KN102 composition)
  cohort_class_granted      TEXT NOT NULL DEFAULT 'excalibur_class_subscriber',
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE excalibur_subscriptions IS
  'KN105/BP016 — Excalibur Class subscription state machine. '
  'Upekrithen LLC seller-of-record (Apache 2.0 license layer). '
  'Auto-grants cohort_class=excalibur_class_subscriber on activation. '
  'State: inactive → active_subscription | active_one_time → cancelled | lapsed.';

-- ── Share-Back Ledger ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS excalibur_share_back_ledger (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slice_id             UUID NOT NULL REFERENCES excalibur_slices(id) ON DELETE CASCADE,
  member_id            UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subscription_revenue NUMERIC(10, 2) NOT NULL,
  cost_portion         NUMERIC(10, 2) NOT NULL,   -- subscription_revenue / 1.20
  member_share         NUMERIC(10, 4) NOT NULL,   -- cost_portion × contribution_share_proportion
  period_start         TIMESTAMPTZ NOT NULL,
  period_end           TIMESTAMPTZ NOT NULL,
  paid_out             BOOLEAN NOT NULL DEFAULT false,
  paid_out_at          TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE excalibur_share_back_ledger IS
  'KN105/BP016 — Per-member share-back-pay ledger. '
  'Radical transparency per Meta-Law (CANONICAL_LAWS Section I 3.7). '
  'Pricing formula: member_share = (subscription_revenue / 1.20) × contribution_share_proportion.';

-- ── Subscriber Conduct Reviews ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS excalibur_subscriber_conduct_reviews (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id  UUID NOT NULL REFERENCES excalibur_subscriptions(id) ON DELETE CASCADE,
  review_year      INT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved_no_action', 'resolved_suspended')),
  misuse_pattern   TEXT,
  federation_vote_yes  INT NOT NULL DEFAULT 0,
  federation_vote_no   INT NOT NULL DEFAULT 0,
  resolved_at      TIMESTAMPTZ,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE excalibur_subscriber_conduct_reviews IS
  'KN105/BP016 — Annual Federation member subscriber-conduct review. '
  'Community enforcement (NOT LB Corp gatekeeping). '
  'Marked Exception in Cooperative Defensive Patent Pledge (#2260) enforcement.';

-- ── Indexes ───────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_excalibur_slices_status ON excalibur_slices(status);
CREATE INDEX IF NOT EXISTS idx_excalibur_slices_tag_assigned ON excalibur_slices(excalibur_tag_assigned);
CREATE INDEX IF NOT EXISTS idx_excalibur_subscriptions_subscriber ON excalibur_subscriptions(subscriber_id, state);
CREATE INDEX IF NOT EXISTS idx_excalibur_subscriptions_slice ON excalibur_subscriptions(slice_id, state);
CREATE INDEX IF NOT EXISTS idx_excalibur_share_back_member ON excalibur_share_back_ledger(member_id, paid_out);
CREATE INDEX IF NOT EXISTS idx_excalibur_share_back_slice ON excalibur_share_back_ledger(slice_id);
CREATE INDEX IF NOT EXISTS idx_excalibur_member_contributions_member ON excalibur_member_contributions(member_id, opt_in_status);
CREATE INDEX IF NOT EXISTS idx_excalibur_votes_slice ON excalibur_member_votes(slice_id);

-- ── Updated_at Triggers ───────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_excalibur_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER excalibur_slices_updated_at
  BEFORE UPDATE ON excalibur_slices
  FOR EACH ROW EXECUTE FUNCTION update_excalibur_updated_at();

CREATE TRIGGER excalibur_member_contributions_updated_at
  BEFORE UPDATE ON excalibur_member_contributions
  FOR EACH ROW EXECUTE FUNCTION update_excalibur_updated_at();

CREATE TRIGGER excalibur_subscriptions_updated_at
  BEFORE UPDATE ON excalibur_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_excalibur_updated_at();

-- ── RLS Policies ─────────────────────────────────────────────────────────

ALTER TABLE excalibur_slices ENABLE ROW LEVEL SECURITY;
ALTER TABLE excalibur_slice_gates ENABLE ROW LEVEL SECURITY;
ALTER TABLE excalibur_member_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE excalibur_member_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE excalibur_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE excalibur_share_back_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE excalibur_subscriber_conduct_reviews ENABLE ROW LEVEL SECURITY;

-- Slices: public read for excalibur_class status (radical transparency)
CREATE POLICY "excalibur_slices_public_read" ON excalibur_slices
  FOR SELECT USING (status = 'excalibur_class');

-- Slices: service role full access
CREATE POLICY "excalibur_slices_service_full" ON excalibur_slices
  FOR ALL USING (auth.role() = 'service_role');

-- Subscriptions: users can see their own subscriptions
CREATE POLICY "excalibur_subscriptions_own_read" ON excalibur_subscriptions
  FOR SELECT USING (subscriber_id = auth.uid());

CREATE POLICY "excalibur_subscriptions_service_full" ON excalibur_subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- Member contributions: users can see/update their own opt-in status
CREATE POLICY "excalibur_contributions_own_read" ON excalibur_member_contributions
  FOR SELECT USING (member_id = auth.uid());

CREATE POLICY "excalibur_contributions_own_update" ON excalibur_member_contributions
  FOR UPDATE USING (member_id = auth.uid());

CREATE POLICY "excalibur_contributions_service_full" ON excalibur_member_contributions
  FOR ALL USING (auth.role() = 'service_role');

-- Share-back ledger: members can see their own entries
CREATE POLICY "excalibur_share_back_own_read" ON excalibur_share_back_ledger
  FOR SELECT USING (member_id = auth.uid());

CREATE POLICY "excalibur_share_back_service_full" ON excalibur_share_back_ledger
  FOR ALL USING (auth.role() = 'service_role');

-- Votes: members can vote and see their own votes; all can see aggregate counts
CREATE POLICY "excalibur_votes_own_read" ON excalibur_member_votes
  FOR SELECT USING (voter_id = auth.uid());

CREATE POLICY "excalibur_votes_own_insert" ON excalibur_member_votes
  FOR INSERT WITH CHECK (voter_id = auth.uid());

CREATE POLICY "excalibur_votes_service_full" ON excalibur_member_votes
  FOR ALL USING (auth.role() = 'service_role');

-- Gates: service role only (gate evaluation is system-mediated)
CREATE POLICY "excalibur_gates_service_full" ON excalibur_slice_gates
  FOR ALL USING (auth.role() = 'service_role');

-- Conduct reviews: service role only
CREATE POLICY "excalibur_conduct_service_full" ON excalibur_subscriber_conduct_reviews
  FOR ALL USING (auth.role() = 'service_role');
