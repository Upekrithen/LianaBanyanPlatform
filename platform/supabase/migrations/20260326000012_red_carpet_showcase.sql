-- K117: Red Carpet Showcase — demand signal system for pre-populated creator projects

-- Add 'showcased' to turnkey_projects status check
ALTER TABLE turnkey_projects DROP CONSTRAINT IF EXISTS turnkey_projects_status_check;
ALTER TABLE turnkey_projects ADD CONSTRAINT turnkey_projects_status_check
  CHECK (status IN ('draft', 'showcased', 'active', 'funded', 'producing', 'complete', 'paused'));

-- Add showcase-specific fields
ALTER TABLE turnkey_projects ADD COLUMN IF NOT EXISTS is_showcased BOOLEAN DEFAULT false;
ALTER TABLE turnkey_projects ADD COLUMN IF NOT EXISTS showcase_source_url TEXT;
ALTER TABLE turnkey_projects ADD COLUMN IF NOT EXISTS showcase_source_platform TEXT
  CHECK (showcase_source_platform IN ('reddit', 'etsy', 'instagram', 'discord', 'twitter', 'tiktok', 'website', 'manual'));
ALTER TABLE turnkey_projects ADD COLUMN IF NOT EXISTS showcase_created_by UUID REFERENCES auth.users(id);
ALTER TABLE turnkey_projects ADD COLUMN IF NOT EXISTS showcase_expires_at TIMESTAMPTZ;
ALTER TABLE turnkey_projects ADD COLUMN IF NOT EXISTS claimed_by UUID REFERENCES auth.users(id);
ALTER TABLE turnkey_projects ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ;

-- Demand signals table
CREATE TABLE IF NOT EXISTS showcase_demand_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES turnkey_projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  signal_type TEXT NOT NULL CHECK (signal_type IN ('want', 'pledge', 'comment')),
  credits_pledged INT DEFAULT 0,
  comment_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, user_id, signal_type)
);

-- Pledge escrow tracking
CREATE TABLE IF NOT EXISTS showcase_pledge_escrow (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES turnkey_projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  credits_amount INT NOT NULL,
  status TEXT DEFAULT 'held' CHECK (status IN ('held', 'converted', 'refunded')),
  escrowed_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

ALTER TABLE showcase_demand_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE showcase_pledge_escrow ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view demand signals" ON showcase_demand_signals FOR SELECT USING (true);
CREATE POLICY "Users manage own signals" ON showcase_demand_signals FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view escrow counts" ON showcase_pledge_escrow FOR SELECT USING (true);
CREATE POLICY "Users manage own escrow" ON showcase_pledge_escrow FOR ALL USING (auth.uid() = user_id);

-- Update RLS on turnkey_projects to allow viewing showcased projects
DROP POLICY IF EXISTS "Anyone can view active projects" ON turnkey_projects;
CREATE POLICY "Anyone can view published projects" ON turnkey_projects
  FOR SELECT USING (status IN ('showcased', 'active', 'funded', 'producing', 'complete') OR auth.uid() = creator_id);
