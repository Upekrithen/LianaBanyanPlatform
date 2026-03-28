-- ============================================================================
-- K133: Guild & Tribe System — Treasury, Design Contests, Visual Identity
-- Innovations: #2014-#2020
-- ============================================================================

-- ── 1. GUILDS — Add K133 columns ────────────────────────────────────────────
ALTER TABLE guilds ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE guilds ADD COLUMN IF NOT EXISTS icon_url TEXT;
ALTER TABLE guilds ADD COLUMN IF NOT EXISTS mascot_url TEXT;
ALTER TABLE guilds ADD COLUMN IF NOT EXISTS color_primary TEXT DEFAULT '#7c3aed';
ALTER TABLE guilds ADD COLUMN IF NOT EXISTS color_secondary TEXT;
ALTER TABLE guilds ADD COLUMN IF NOT EXISTS theme_css TEXT;
ALTER TABLE guilds ADD COLUMN IF NOT EXISTS treasury_credits INTEGER NOT NULL DEFAULT 0;
ALTER TABLE guilds ADD COLUMN IF NOT EXISTS treasury_reserve_pct NUMERIC NOT NULL DEFAULT 0.10;
ALTER TABLE guilds ADD COLUMN IF NOT EXISTS spending_threshold INTEGER NOT NULL DEFAULT 50;
ALTER TABLE guilds ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE guilds ADD COLUMN IF NOT EXISTS activated_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS idx_guilds_slug ON guilds(slug) WHERE slug IS NOT NULL;

DO $$ BEGIN
  UPDATE guilds SET slug = LOWER(REPLACE(REPLACE(name, ' ', '-'), '''', ''))
    WHERE slug IS NULL AND name IS NOT NULL;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ── 2. TRIBES — Make independent, add K133 columns ─────────────────────────
ALTER TABLE tribes ALTER COLUMN guild_id DROP NOT NULL;
ALTER TABLE tribes ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE tribes ADD COLUMN IF NOT EXISTS tribe_type TEXT;
ALTER TABLE tribes ADD COLUMN IF NOT EXISTS elder_id UUID REFERENCES auth.users(id);
ALTER TABLE tribes ADD COLUMN IF NOT EXISTS banner_url TEXT;
ALTER TABLE tribes ADD COLUMN IF NOT EXISTS icon_url TEXT;
ALTER TABLE tribes ADD COLUMN IF NOT EXISTS mascot_url TEXT;
ALTER TABLE tribes ADD COLUMN IF NOT EXISTS color_primary TEXT DEFAULT '#d97706';
ALTER TABLE tribes ADD COLUMN IF NOT EXISTS color_secondary TEXT;
ALTER TABLE tribes ADD COLUMN IF NOT EXISTS theme_css TEXT;
ALTER TABLE tribes ADD COLUMN IF NOT EXISTS treasury_credits INTEGER NOT NULL DEFAULT 0;
ALTER TABLE tribes ADD COLUMN IF NOT EXISTS treasury_reserve_pct NUMERIC NOT NULL DEFAULT 0.10;
ALTER TABLE tribes ADD COLUMN IF NOT EXISTS spending_threshold INTEGER NOT NULL DEFAULT 50;
ALTER TABLE tribes ADD COLUMN IF NOT EXISTS family_table_id UUID;
ALTER TABLE tribes ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

CREATE UNIQUE INDEX IF NOT EXISTS idx_tribes_slug ON tribes(slug) WHERE slug IS NOT NULL;

-- Backfill elder_id from leader_id where null
DO $$ BEGIN
  UPDATE tribes SET elder_id = leader_id WHERE elder_id IS NULL AND leader_id IS NOT NULL;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Make tribe_memberships.guild_id nullable (tribes are now independent)
DO $$ BEGIN
  ALTER TABLE tribe_memberships ALTER COLUMN guild_id DROP NOT NULL;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ── 3. GROUP TREASURY TRANSACTIONS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS group_treasury_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_type TEXT NOT NULL CHECK (group_type IN ('guild', 'tribe')),
  group_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN (
    'contribution', 'contest_prize', 'purchase', 'bounty', 'event', 'reserve_access'
  )),
  amount INTEGER NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('in', 'out')),
  description TEXT,
  approved_by UUID REFERENCES auth.users(id),
  vote_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE group_treasury_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can read group treasury" ON group_treasury_transactions;
CREATE POLICY "Authenticated can read group treasury"
  ON group_treasury_transactions FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Members can insert treasury transactions" ON group_treasury_transactions;
CREATE POLICY "Members can insert treasury transactions"
  ON group_treasury_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_treasury_tx_group ON group_treasury_transactions(group_type, group_id);
CREATE INDEX IF NOT EXISTS idx_treasury_tx_user ON group_treasury_transactions(user_id);

-- ── 4. DESIGN CONTESTS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS design_contests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_type TEXT NOT NULL CHECK (group_type IN ('guild', 'tribe')),
  group_id UUID NOT NULL,
  contest_type TEXT NOT NULL CHECK (contest_type IN (
    'banner', 'theme', 'mascot', 'icon', 'color_palette', 'seasonal'
  )),
  title TEXT NOT NULL,
  description TEXT,
  prize_credits INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'voting', 'decided', 'cancelled')),
  submissions_close_at TIMESTAMPTZ,
  voting_close_at TIMESTAMPTZ,
  winner_submission_id UUID,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE design_contests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can read design contests" ON design_contests;
CREATE POLICY "Authenticated can read design contests"
  ON design_contests FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Creators can insert design contests" ON design_contests;
CREATE POLICY "Creators can insert design contests"
  ON design_contests FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Creators can update design contests" ON design_contests;
CREATE POLICY "Creators can update design contests"
  ON design_contests FOR UPDATE USING (auth.uid() = created_by);

CREATE INDEX IF NOT EXISTS idx_design_contests_group ON design_contests(group_type, group_id);
CREATE INDEX IF NOT EXISTS idx_design_contests_status ON design_contests(status);

-- ── 5. DESIGN CONTEST SUBMISSIONS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS design_contest_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id UUID REFERENCES design_contests(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  asset_url TEXT NOT NULL,
  preview_url TEXT,
  vote_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(contest_id, user_id)
);

ALTER TABLE design_contest_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can read contest submissions" ON design_contest_submissions;
CREATE POLICY "Authenticated can read contest submissions"
  ON design_contest_submissions FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can submit to contests" ON design_contest_submissions;
CREATE POLICY "Users can submit to contests"
  ON design_contest_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_contest_submissions_contest ON design_contest_submissions(contest_id);

-- ── 6. DESIGN CONTEST VOTES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS design_contest_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES design_contest_submissions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(submission_id, user_id)
);

ALTER TABLE design_contest_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can read contest votes" ON design_contest_votes;
CREATE POLICY "Authenticated can read contest votes"
  ON design_contest_votes FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can vote on submissions" ON design_contest_votes;
CREATE POLICY "Users can vote on submissions"
  ON design_contest_votes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_contest_votes_submission ON design_contest_votes(submission_id);
CREATE INDEX IF NOT EXISTS idx_contest_votes_user ON design_contest_votes(user_id);
