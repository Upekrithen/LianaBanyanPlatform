-- K202: Red Carpet Dynamic Registry (B053)
-- Replaces hardcoded recipient lookup with DB-driven system.
-- Anyone added here is recognized at /RedCarpet without a code deploy.
-- NOTE: red_carpet_access already exists as a visit-logging table.
--       This is the RECIPIENT REGISTRY — different purpose.

CREATE TABLE IF NOT EXISTS red_carpet_registry (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  title TEXT,
  organization TEXT,
  bio TEXT,
  purpose TEXT,
  why_you TEXT,
  categories TEXT[] DEFAULT '{}',
  known_emails TEXT[] DEFAULT '{}',
  email_domains TEXT[] DEFAULT '{}',
  walkthrough_config JSONB DEFAULT '{}',
  initiatives TEXT[] DEFAULT '{}',
  source TEXT DEFAULT 'manual',
  launch_flag TEXT DEFAULT 'DB',
  icon TEXT DEFAULT '🎪',
  category_label TEXT,
  cover_note TEXT,
  cover_note_cta JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rcr_known_emails ON red_carpet_registry USING GIN (known_emails);
CREATE INDEX IF NOT EXISTS idx_rcr_email_domains ON red_carpet_registry USING GIN (email_domains);
CREATE INDEX IF NOT EXISTS idx_rcr_slug ON red_carpet_registry (slug);
CREATE INDEX IF NOT EXISTS idx_rcr_active ON red_carpet_registry (is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_rcr_categories ON red_carpet_registry USING GIN (categories);

ALTER TABLE red_carpet_registry ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'red_carpet_registry' AND policyname = 'Red carpet registry is publicly readable') THEN
    CREATE POLICY "Red carpet registry is publicly readable" ON red_carpet_registry FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'red_carpet_registry' AND policyname = 'Service role can insert red carpet registry') THEN
    CREATE POLICY "Service role can insert red carpet registry" ON red_carpet_registry FOR INSERT WITH CHECK (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'red_carpet_registry' AND policyname = 'Service role can update red carpet registry') THEN
    CREATE POLICY "Service role can update red carpet registry" ON red_carpet_registry FOR UPDATE USING (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'red_carpet_registry' AND policyname = 'Authenticated can insert red carpet registry') THEN
    CREATE POLICY "Authenticated can insert red carpet registry" ON red_carpet_registry FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
END $$;

-- Innovation log
UPDATE platform_canonical SET value = '2126', updated_at = now()
WHERE key = 'innovation_count' AND value::int < 2126;

INSERT INTO innovation_log (innovation_number, title, description, category, status)
VALUES (2126, 'Dynamic Red Carpet Access Registry',
  'Database-driven recipient lookup replacing hardcoded TypeScript array. New recipients added via Cue Cards, admin, or API are recognized immediately without code deploys.',
  'infrastructure', 'implemented')
ON CONFLICT (innovation_number) DO NOTHING;
