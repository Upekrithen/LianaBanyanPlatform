-- Universal Crowdfunding Integration Tables

-- Universal crowdfunding pledges table (consolidates all platforms)
CREATE TABLE IF NOT EXISTS crowdfunding_pledges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL CHECK (platform IN ('kickstarter', 'indiegogo', 'gofundme', 'patreon', 'backerkit')),
  platform_pledge_id text NOT NULL,

  -- Backer info
  backer_email text NOT NULL,
  backer_name text,
  user_id uuid REFERENCES auth.users(id),

  -- Pledge details
  pledge_amount numeric NOT NULL DEFAULT 0,
  pledge_currency text DEFAULT 'USD',
  pledge_date timestamptz NOT NULL DEFAULT now(),
  reward_tier text,

  -- LB integration
  product_id uuid REFERENCES products(id),
  is_processed boolean DEFAULT false,
  processed_at timestamptz,
  credits_allocated numeric DEFAULT 0,

  -- Sync tracking
  synced_at timestamptz DEFAULT now(),
  last_updated timestamptz DEFAULT now(),

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(platform, platform_pledge_id)
);

-- Platform connection credentials
CREATE TABLE IF NOT EXISTS crowdfunding_platform_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id),

  platform text NOT NULL CHECK (platform IN ('kickstarter', 'indiegogo', 'gofundme', 'patreon', 'backerkit')),

  -- Credentials (store in Supabase secrets for production)
  api_key text,
  oauth_token text,
  oauth_refresh_token text,

  webhook_url text,
  webhook_secret text,

  is_active boolean DEFAULT true,
  last_sync_at timestamptz,

  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(project_id, platform)
);

-- Sync log for all platforms
CREATE TABLE IF NOT EXISTS crowdfunding_sync_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  project_id uuid REFERENCES projects(id),

  sync_type text DEFAULT 'scheduled', -- 'webhook', 'scheduled', 'manual'
  status text DEFAULT 'success', -- 'success', 'partial', 'failed'

  pledges_synced integer DEFAULT 0,
  errors_count integer DEFAULT 0,
  error_details jsonb,

  started_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_crowdfunding_pledges_platform ON crowdfunding_pledges(platform);
CREATE INDEX IF NOT EXISTS idx_crowdfunding_pledges_user ON crowdfunding_pledges(user_id);
CREATE INDEX IF NOT EXISTS idx_crowdfunding_pledges_processed ON crowdfunding_pledges(is_processed);
CREATE INDEX IF NOT EXISTS idx_crowdfunding_connections_project ON crowdfunding_platform_connections(project_id);
CREATE INDEX IF NOT EXISTS idx_crowdfunding_sync_log_platform ON crowdfunding_sync_log(platform);

-- Add updated_at trigger
CREATE TRIGGER update_crowdfunding_pledges_updated_at
  BEFORE UPDATE ON crowdfunding_pledges
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crowdfunding_connections_updated_at
  BEFORE UPDATE ON crowdfunding_platform_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE crowdfunding_pledges ENABLE ROW LEVEL SECURITY;
ALTER TABLE crowdfunding_platform_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE crowdfunding_sync_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for crowdfunding_pledges
CREATE POLICY "Users can view own pledges"
  ON crowdfunding_pledges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all pledges"
  ON crowdfunding_pledges FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "System can insert pledges"
  ON crowdfunding_pledges FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update pledges"
  ON crowdfunding_pledges FOR UPDATE
  USING (true);

-- RLS Policies for crowdfunding_platform_connections
CREATE POLICY "Project owners can manage connections"
  ON crowdfunding_platform_connections FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = crowdfunding_platform_connections.project_id
      AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all connections"
  ON crowdfunding_platform_connections FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- RLS Policies for crowdfunding_sync_log
CREATE POLICY "Anyone can view sync logs"
  ON crowdfunding_sync_log FOR SELECT
  USING (true);

CREATE POLICY "System can insert sync logs"
  ON crowdfunding_sync_log FOR INSERT
  WITH CHECK (true);
