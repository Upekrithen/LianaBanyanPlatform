-- K405 Ripple Mechanics: SAA Cascade, Four Backing Types, $10M Cap
-- Innovation #2241 (Crown Jewel). Bishop B097.
-- Three new tables: ripple_contributions, saa_cap_tracking, ripple_cascade_ledger
-- Depends on K404 Open Water Core (patron_engagements, saa_ledger)

-- ══════════════════════════════════════════════════════════════
-- 1. ripple_contributions — each Ripple backing on an engagement
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS ripple_contributions (
  ripple_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id UUID NOT NULL REFERENCES patron_engagements(engagement_id) ON DELETE CASCADE,
  backer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ripple_type TEXT NOT NULL
    CHECK (ripple_type IN ('resources', 'reputation', 'network', 'skills')),
  ripple_data JSONB NOT NULL,
  committed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'withdrawn', 'resolved'))
);

CREATE INDEX idx_ripple_engagement ON ripple_contributions(engagement_id, committed_at DESC);
CREATE INDEX idx_ripple_backer ON ripple_contributions(backer_user_id);
CREATE INDEX idx_ripple_type ON ripple_contributions(ripple_type);

-- ══════════════════════════════════════════════════════════════
-- 2. saa_cap_tracking — per-user $10M cap state + reseeding cascade
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS saa_cap_tracking (
  tracking_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  cumulative_saa NUMERIC NOT NULL DEFAULT 0,
  cap_reached BOOLEAN NOT NULL DEFAULT false,
  cap_reached_at TIMESTAMPTZ,
  overflow_cascaded NUMERIC NOT NULL DEFAULT 0,
  last_cascade_at TIMESTAMPTZ
);

CREATE INDEX idx_saa_cap_user ON saa_cap_tracking(user_id);

-- ══════════════════════════════════════════════════════════════
-- 3. ripple_cascade_ledger — append-only reseed events
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS ripple_cascade_ledger (
  cascade_event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  cascaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  source_ripple_id UUID REFERENCES ripple_contributions(ripple_id)
);

CREATE INDEX idx_cascade_from ON ripple_cascade_ledger(from_user_id, cascaded_at DESC);
CREATE INDEX idx_cascade_to ON ripple_cascade_ledger(to_user_id, cascaded_at DESC);

-- ══════════════════════════════════════════════════════════════
-- 4. RLS policies
-- ══════════════════════════════════════════════════════════════

-- ripple_contributions: participants (member, patron, backer) can read
ALTER TABLE ripple_contributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ripple_backer_read" ON ripple_contributions FOR SELECT
  USING (auth.uid() = backer_user_id);

CREATE POLICY "ripple_engagement_participant_read" ON ripple_contributions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM patron_engagements pe
    WHERE pe.engagement_id = ripple_contributions.engagement_id
      AND (pe.member_id = auth.uid() OR EXISTS (
        SELECT 1 FROM patron_registrations pr
        WHERE pr.patron_id = pe.patron_id AND pr.user_id = auth.uid()
      ))
  ));

CREATE POLICY "ripple_backer_insert" ON ripple_contributions FOR INSERT
  WITH CHECK (auth.uid() = backer_user_id);

-- saa_cap_tracking: users read own
ALTER TABLE saa_cap_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "saa_cap_owner_read" ON saa_cap_tracking FOR SELECT
  USING (auth.uid() = user_id);

-- ripple_cascade_ledger: from/to users can read
ALTER TABLE ripple_cascade_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cascade_from_read" ON ripple_cascade_ledger FOR SELECT
  USING (auth.uid() = from_user_id);

CREATE POLICY "cascade_to_read" ON ripple_cascade_ledger FOR SELECT
  USING (auth.uid() = to_user_id);
