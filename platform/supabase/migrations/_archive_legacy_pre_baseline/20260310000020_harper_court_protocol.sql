-- ═══════════════════════════════════════════════════════════════════════════════
-- HARPER COURT PROTOCOL — Community Adjudication System
-- ═══════════════════════════════════════════════════════════════════════════════
-- Implements the Harper Court dispute resolution state machine:
--   1. harper_stakes  — Harpers lock MARKS to serve as adjudicators
--   2. harper_cases   — Disputes filed against merchants for violations
--   3. harper_votes   — Individual Harper ballots on open cases
--
-- State Machine:
--   Case: draft → open → voting → resolved | appealed → closed
--   Stake: active → slashed | exited
--
-- Edge Functions (future):
--   - Selection: Randomly pick 5 active Harpers when case → 'open'
--   - Resolution: Tally votes at voting_deadline, execute penalty
--   - Slashing: Minority voters lose 20% stake + reputation hit
--
-- Spec: BISHOP_DROPZONE/SPEC_HARPER_COURT_PROTOCOL.md
-- ═══════════════════════════════════════════════════════════════════════════════


-- ── 1. ENUMS ──────────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE harper_stake_status AS ENUM ('active', 'slashed', 'exited');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE harper_case_type AS ENUM ('pricing_violation', 'ethics_violation', 'fraud');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE harper_case_status AS ENUM ('draft', 'open', 'voting', 'resolved', 'appealed', 'closed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE harper_vote_option AS ENUM ('no_action', 'warning', 'freeze', 'slash', 'derank');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ── 2. HARPER STAKES ─────────────────────────────────────────────────────────
-- Harpers lock MARKS as collateral to serve on the Court.
-- Reputation starts at 100, drops on minority votes / collusion.

CREATE TABLE IF NOT EXISTS harper_stakes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who is staking
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Stake details
  staked_marks     INTEGER NOT NULL CHECK (staked_marks > 0),
  status           harper_stake_status NOT NULL DEFAULT 'active',
  reputation_score INTEGER NOT NULL DEFAULT 100 CHECK (reputation_score >= 0),

  -- Timestamps
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_harper_stakes_user_id
  ON harper_stakes(user_id);

CREATE INDEX IF NOT EXISTS idx_harper_stakes_active
  ON harper_stakes(status) WHERE status = 'active';


-- ── 3. HARPER CASES ──────────────────────────────────────────────────────────
-- A dispute filed by a complainant against a merchant.
-- Moves through the state machine: draft → open → voting → resolved/appealed → closed.

CREATE TABLE IF NOT EXISTS harper_cases (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Parties
  merchant_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  complainant_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Case classification
  case_type        harper_case_type NOT NULL,
  status           harper_case_status NOT NULL DEFAULT 'draft',

  -- Evidence
  evidence_text    TEXT NOT NULL DEFAULT '',

  -- Timing
  voting_deadline  TIMESTAMPTZ,

  -- Timestamps
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_harper_cases_merchant_id
  ON harper_cases(merchant_id);

CREATE INDEX IF NOT EXISTS idx_harper_cases_complainant_id
  ON harper_cases(complainant_id);

CREATE INDEX IF NOT EXISTS idx_harper_cases_status
  ON harper_cases(status);

CREATE INDEX IF NOT EXISTS idx_harper_cases_voting_deadline
  ON harper_cases(voting_deadline) WHERE status = 'voting';


-- ── 4. HARPER VOTES ──────────────────────────────────────────────────────────
-- Each selected Harper casts exactly one vote per case.
-- harper_id references harper_stakes (the staking record, not auth.users directly).

CREATE TABLE IF NOT EXISTS harper_votes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Links
  case_id          UUID NOT NULL REFERENCES harper_cases(id) ON DELETE CASCADE,
  harper_id        UUID NOT NULL REFERENCES harper_stakes(id) ON DELETE CASCADE,

  -- Ballot
  vote_option      harper_vote_option NOT NULL,
  justification    TEXT NOT NULL DEFAULT '',

  -- Timestamp
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One vote per Harper per case
  UNIQUE (case_id, harper_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_harper_votes_case_id
  ON harper_votes(case_id);

CREATE INDEX IF NOT EXISTS idx_harper_votes_harper_id
  ON harper_votes(harper_id);


-- ── 5. ROW LEVEL SECURITY ────────────────────────────────────────────────────

-- ─── harper_stakes ───
ALTER TABLE harper_stakes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active stakes"
  ON harper_stakes FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own stake"
  ON harper_stakes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stake"
  ON harper_stakes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admin can manage all stakes"
  ON harper_stakes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email IN ('upekrithen@gmail.com', 'support@lianabanyan.com')
    )
  );


-- ─── harper_cases ───
ALTER TABLE harper_cases ENABLE ROW LEVEL SECURITY;

-- Anyone can read cases (transparency)
CREATE POLICY "Anyone can view cases"
  ON harper_cases FOR SELECT
  USING (true);

-- Only authenticated users can submit a case
CREATE POLICY "Authenticated users can submit cases"
  ON harper_cases FOR INSERT
  WITH CHECK (auth.uid() = complainant_id);

-- Only the complainant can update their own draft case
CREATE POLICY "Complainant can update own draft case"
  ON harper_cases FOR UPDATE
  USING (auth.uid() = complainant_id AND status = 'draft');

CREATE POLICY "Admin can manage all cases"
  ON harper_cases FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email IN ('upekrithen@gmail.com', 'support@lianabanyan.com')
    )
  );


-- ─── harper_votes ───
ALTER TABLE harper_votes ENABLE ROW LEVEL SECURITY;

-- Anyone can read votes (transparency after resolution)
CREATE POLICY "Anyone can view votes"
  ON harper_votes FOR SELECT
  USING (true);

-- Only the specific Harper can insert their own vote
CREATE POLICY "Harper can insert own vote"
  ON harper_votes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM harper_stakes
      WHERE harper_stakes.id = harper_id
      AND harper_stakes.user_id = auth.uid()
      AND harper_stakes.status = 'active'
    )
  );

CREATE POLICY "Admin can manage all votes"
  ON harper_votes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email IN ('upekrithen@gmail.com', 'support@lianabanyan.com')
    )
  );


-- ── 6. UPDATED_AT TRIGGERS ───────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.harper_court_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS harper_stakes_updated_at ON harper_stakes;
CREATE TRIGGER harper_stakes_updated_at
  BEFORE UPDATE ON harper_stakes
  FOR EACH ROW
  EXECUTE FUNCTION public.harper_court_updated_at();

DROP TRIGGER IF EXISTS harper_cases_updated_at ON harper_cases;
CREATE TRIGGER harper_cases_updated_at
  BEFORE UPDATE ON harper_cases
  FOR EACH ROW
  EXECUTE FUNCTION public.harper_court_updated_at();


-- ── 7. JUDGMENT FUNCTION STUB ────────────────────────────────────────────────
-- Placeholder for the Edge Function / cron job that will:
--   1. Tally votes when voting_deadline passes
--   2. Determine majority sanction
--   3. Execute penalty on merchant (derank, freeze, etc.)
--   4. Slash minority voters (20% stake reduction + reputation hit)
--
-- This will be called by an Edge Function or pg_cron in production.

CREATE OR REPLACE FUNCTION public.execute_harper_judgment(p_case_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_case        harper_cases%ROWTYPE;
  v_total_votes INTEGER;
  v_majority    harper_vote_option;
  v_majority_ct INTEGER;
  v_result      JSONB;
BEGIN
  -- 1. Fetch the case
  SELECT * INTO v_case FROM harper_cases WHERE id = p_case_id;

  IF v_case IS NULL THEN
    RETURN jsonb_build_object('error', 'Case not found');
  END IF;

  IF v_case.status != 'voting' THEN
    RETURN jsonb_build_object('error', 'Case is not in voting status');
  END IF;

  -- 2. Count total votes
  SELECT COUNT(*) INTO v_total_votes FROM harper_votes WHERE case_id = p_case_id;

  IF v_total_votes = 0 THEN
    RETURN jsonb_build_object('error', 'No votes cast');
  END IF;

  -- 3. Find the majority vote option
  SELECT vote_option, COUNT(*) INTO v_majority, v_majority_ct
  FROM harper_votes
  WHERE case_id = p_case_id
  GROUP BY vote_option
  ORDER BY COUNT(*) DESC
  LIMIT 1;

  -- 4. Mark the case as resolved
  UPDATE harper_cases
  SET status = 'resolved', updated_at = NOW()
  WHERE id = p_case_id;

  -- 5. Slash minority voters (20% stake reduction + reputation drop)
  UPDATE harper_stakes
  SET
    staked_marks     = GREATEST(0, staked_marks - (staked_marks / 5)),
    reputation_score = GREATEST(0, reputation_score - 10),
    updated_at       = NOW()
  WHERE id IN (
    SELECT harper_id FROM harper_votes
    WHERE case_id = p_case_id
    AND vote_option != v_majority
  );

  -- 6. Build result summary
  -- TODO: Execute actual merchant penalties (derank, freeze, etc.)
  --       This stub only records the outcome. The Edge Function
  --       will handle profile updates, visibility changes, and
  --       notification dispatch.
  v_result = jsonb_build_object(
    'case_id',       p_case_id,
    'total_votes',   v_total_votes,
    'majority_vote', v_majority,
    'majority_count', v_majority_ct,
    'status',        'resolved',
    'note',          'STUB: Merchant penalty execution not yet wired. See Edge Function spec.'
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ── 8. COMMENTS ──────────────────────────────────────────────────────────────

COMMENT ON TABLE harper_stakes IS 'Harper Court: MARKS staked by adjudicators as collateral for integrity';
COMMENT ON TABLE harper_cases IS 'Harper Court: Disputes filed against merchants for pricing/ethics/fraud violations';
COMMENT ON TABLE harper_votes IS 'Harper Court: Individual Harper ballots on active cases';
COMMENT ON FUNCTION public.execute_harper_judgment IS 'Harper Court: Tallies votes, resolves case, slashes minority voters. STUB — merchant penalty execution pending Edge Function.';
