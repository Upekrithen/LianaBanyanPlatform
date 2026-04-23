-- Crews — 12-person micro-cooperatives (Session 2 Cold Start)
-- ==========================================================
-- Shareable invite page, progress bar, formation wizard.

-- Crews (12-person micro-cooperatives)
CREATE TABLE IF NOT EXISTS crews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  focus text NOT NULL,
  city text,
  state text,
  zip text,
  status text NOT NULL DEFAULT 'forming'
    CHECK (status IN ('forming', 'active', 'completed', 'paused')),
  min_members integer NOT NULL DEFAULT 8,
  max_members integer NOT NULL DEFAULT 12,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Crew Members
CREATE TABLE IF NOT EXISTS crew_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_id uuid NOT NULL REFERENCES crews(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  offer_title text NOT NULL,
  offer_description text,
  offer_price numeric(10,2),
  role text DEFAULT 'member',
  status text NOT NULL DEFAULT 'joined'
    CHECK (status IN ('joined', 'backed', 'fulfilled', 'dropped')),
  backed_by uuid REFERENCES crew_members(id),
  backed_amount numeric(10,2),
  fulfilled_at timestamptz,
  joined_at timestamptz DEFAULT now()
);

-- Crew Invites (track who shared what)
CREATE TABLE IF NOT EXISTS crew_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_id uuid NOT NULL REFERENCES crews(id) ON DELETE CASCADE,
  invite_code text NOT NULL UNIQUE,
  created_by uuid REFERENCES auth.users(id),
  views integer NOT NULL DEFAULT 0,
  joins integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE crews ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_invites ENABLE ROW LEVEL SECURITY;

-- Public can view crew invite pages (for shareable links)
CREATE POLICY "crews_public_read" ON crews FOR SELECT USING (true);
CREATE POLICY "crews_insert" ON crews FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "crews_update_own" ON crews FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "crew_members_read_crew" ON crew_members FOR SELECT USING (true);
CREATE POLICY "crew_members_insert" ON crew_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "crew_members_update_own" ON crew_members FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "crew_invites_public_read" ON crew_invites FOR SELECT USING (true);
CREATE POLICY "crew_invites_insert" ON crew_invites FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_crew_members_crew ON crew_members(crew_id);
CREATE INDEX IF NOT EXISTS idx_crew_members_user ON crew_members(user_id);
CREATE INDEX IF NOT EXISTS idx_crew_invites_code ON crew_invites(invite_code);
CREATE INDEX IF NOT EXISTS idx_crew_invites_crew ON crew_invites(crew_id);
CREATE INDEX IF NOT EXISTS idx_crews_status ON crews(status);
CREATE INDEX IF NOT EXISTS idx_crews_city ON crews(city);
