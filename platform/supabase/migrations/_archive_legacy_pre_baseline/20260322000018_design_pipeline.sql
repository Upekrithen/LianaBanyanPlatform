-- Design Pipeline: Arena Submissions + Crew Tables
-- K87 — March 22, 2026
-- Idempotent: safe to re-run

-- Arena Submissions (may already exist from prior session)
CREATE TABLE IF NOT EXISTS arena_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  price DECIMAL(10,2),
  status TEXT DEFAULT 'pending_review',
  stamp_reviewer_id UUID REFERENCES auth.users(id),
  stamp_rating DECIMAL(3,1),
  stamp_date TIMESTAMPTZ,
  battle_id UUID,
  royalty_uses INT DEFAULT 0,
  royalty_earnings DECIMAL(10,2) DEFAULT 0,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE arena_submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view approved submissions" ON arena_submissions;
CREATE POLICY "Anyone can view approved submissions" ON arena_submissions
  FOR SELECT USING (status IN ('approved', 'in_battle', 'in_emporium') OR auth.uid() = creator_id);
DROP POLICY IF EXISTS "Creators manage own submissions" ON arena_submissions;
CREATE POLICY "Creators manage own submissions" ON arena_submissions
  FOR ALL USING (auth.uid() = creator_id);
DROP POLICY IF EXISTS "Admin manages all submissions" ON arena_submissions;
CREATE POLICY "Admin manages all submissions" ON arena_submissions
  FOR ALL USING (public.is_admin());

-- Crew Tables
CREATE TABLE IF NOT EXISTS crew_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  template_type TEXT DEFAULT 'custom',
  treasure_map_ref TEXT,
  stage_current INT DEFAULT 1,
  stage_1_items JSONB DEFAULT '[]',
  stage_2_items JSONB DEFAULT '[]',
  stage_3_items JSONB DEFAULT '[]',
  min_seats_to_activate INT DEFAULT 3,
  is_active BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS crew_table_seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID NOT NULL REFERENCES crew_tables(id) ON DELETE CASCADE,
  role_name TEXT NOT NULL,
  slot_type TEXT NOT NULL DEFAULT 'primary',
  member_id UUID REFERENCES auth.users(id),
  seated_at TIMESTAMPTZ,
  payment_amount DECIMAL(10,2),
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE crew_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_table_seats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view tables" ON crew_tables;
CREATE POLICY "Anyone can view tables" ON crew_tables FOR SELECT USING (true);
DROP POLICY IF EXISTS "Creators manage own tables" ON crew_tables;
CREATE POLICY "Creators manage own tables" ON crew_tables FOR ALL USING (auth.uid() = creator_id);
DROP POLICY IF EXISTS "Admin manages tables" ON crew_tables;
CREATE POLICY "Admin manages tables" ON crew_tables FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Anyone can view seats" ON crew_table_seats;
CREATE POLICY "Anyone can view seats" ON crew_table_seats FOR SELECT USING (true);
DROP POLICY IF EXISTS "Members can claim open seats" ON crew_table_seats;
CREATE POLICY "Members can claim open seats" ON crew_table_seats
  FOR UPDATE USING (member_id IS NULL OR auth.uid() = member_id);
DROP POLICY IF EXISTS "Admin manages seats" ON crew_table_seats;
CREATE POLICY "Admin manages seats" ON crew_table_seats FOR ALL USING (public.is_admin());
