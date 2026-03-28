-- Congress API fields on tracked_bills + bill_cosponsors table — K90

ALTER TABLE tracked_bills ADD COLUMN IF NOT EXISTS congress INTEGER;
ALTER TABLE tracked_bills ADD COLUMN IF NOT EXISTS bill_type TEXT;
ALTER TABLE tracked_bills ADD COLUMN IF NOT EXISTS congress_url TEXT;
ALTER TABLE tracked_bills ADD COLUMN IF NOT EXISTS sponsor_bioguide TEXT;
ALTER TABLE tracked_bills ADD COLUMN IF NOT EXISTS policy_area TEXT;
ALTER TABLE tracked_bills ADD COLUMN IF NOT EXISTS cosponsors_count INTEGER DEFAULT 0;
ALTER TABLE tracked_bills ADD COLUMN IF NOT EXISTS actions JSONB DEFAULT '[]'::jsonb;
ALTER TABLE tracked_bills ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ;
ALTER TABLE tracked_bills ADD COLUMN IF NOT EXISTS is_live BOOLEAN DEFAULT false;

CREATE TABLE IF NOT EXISTS bill_cosponsors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bill_id UUID REFERENCES tracked_bills(id) ON DELETE CASCADE NOT NULL,
  bioguide_id TEXT NOT NULL,
  cosponsor_date DATE,
  is_original BOOLEAN DEFAULT false,
  UNIQUE(bill_id, bioguide_id)
);

ALTER TABLE bill_cosponsors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view cosponsors" ON bill_cosponsors FOR SELECT USING (true);
CREATE POLICY "Admin manages cosponsors" ON bill_cosponsors FOR ALL USING (public.is_admin());

ALTER TABLE rep_cache ADD COLUMN IF NOT EXISTS terms JSONB DEFAULT '[]'::jsonb;
ALTER TABLE rep_cache ADD COLUMN IF NOT EXISTS leadership JSONB DEFAULT '[]'::jsonb;

UPDATE tracked_bills SET is_live = false WHERE is_live IS NULL;
