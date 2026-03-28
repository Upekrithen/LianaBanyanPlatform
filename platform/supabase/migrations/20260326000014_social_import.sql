-- K119: One-Click Social Import + Bridge-to-Local

-- Source imports
CREATE TABLE IF NOT EXISTS social_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  source_platform TEXT NOT NULL CHECK (source_platform IN ('reddit', 'discord', 'instagram', 'etsy', 'twitter', 'tiktok', 'website', 'manual')),
  source_url TEXT NOT NULL,
  source_title TEXT,
  source_description TEXT,
  source_images JSONB DEFAULT '[]',
  
  status TEXT DEFAULT 'imported' CHECK (status IN ('imported', 'draft', 'converted')),
  
  project_id UUID REFERENCES turnkey_projects(id),
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Bridge-to-Local: External service connections
CREATE TABLE IF NOT EXISTS creator_bridges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  service_type TEXT NOT NULL CHECK (service_type IN ('etsy', 'shopify', 'square', 'stripe', 'paypal', 'website', 'instagram_shop', 'facebook_marketplace')),
  service_url TEXT NOT NULL,
  display_name TEXT,
  is_primary BOOLEAN DEFAULT false,
  verified BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, service_type)
);

ALTER TABLE social_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_bridges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own imports" ON social_imports FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own bridges" ON creator_bridges FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view bridges" ON creator_bridges FOR SELECT USING (true);
