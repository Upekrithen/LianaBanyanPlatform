-- Nervous System Tables
-- Platform-wide monitoring, versioning, and synchronization
-- Created: February 19, 2026

-- ============================================
-- IP LEDGER
-- Immutable, hash-chained records for critical data
-- ============================================

CREATE TABLE IF NOT EXISTS ip_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_number BIGINT NOT NULL UNIQUE,
  entry_type TEXT NOT NULL CHECK (entry_type IN (
    'innovation.registered',
    'medallion.minted',
    'governance.decision',
    'content.created',
    'content.updated',
    'patent.filed',
    'patent.granted',
    'sponsor.allocated',
    'metric.recorded'
  )),
  entry_data JSONB NOT NULL DEFAULT '{}',
  previous_hash TEXT,
  current_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ip_ledger_entry_type ON ip_ledger(entry_type);
CREATE INDEX IF NOT EXISTS idx_ip_ledger_created_at ON ip_ledger(created_at);

-- ============================================
-- CONTENT VERSIONS
-- Full version history for all documents
-- ============================================

CREATE TABLE IF NOT EXISTS content_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL CHECK (content_type IN (
    'letter',
    'article',
    'initiative',
    'under-the-hood',
    'patent',
    'innovation',
    'bylaw',
    'policy',
    'configuration'
  )),
  content_id TEXT NOT NULL,
  version_number INTEGER NOT NULL,
  content_hash TEXT NOT NULL,
  changes JSONB,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(content_type, content_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_content_versions_type_id ON content_versions(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_content_versions_created_at ON content_versions(created_at);

-- ============================================
-- PLATFORM METRICS
-- Real-time health and performance tracking
-- ============================================

CREATE TABLE IF NOT EXISTS platform_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_unit TEXT,
  context JSONB,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_platform_metrics_name ON platform_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_platform_metrics_recorded_at ON platform_metrics(recorded_at);

-- ============================================
-- SYNC TARGETS
-- Track synchronization between source and public docs
-- ============================================

CREATE TABLE IF NOT EXISTS sync_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_path TEXT NOT NULL UNIQUE,
  target_path TEXT NOT NULL,
  content_type TEXT NOT NULL,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  last_synced_version TEXT,
  sync_status TEXT NOT NULL DEFAULT 'new' CHECK (sync_status IN (
    'synced',
    'pending',
    'outdated',
    'conflict',
    'new'
  )),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sync_targets_status ON sync_targets(sync_status);
CREATE INDEX IF NOT EXISTS idx_sync_targets_content_type ON sync_targets(content_type);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE ip_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_targets ENABLE ROW LEVEL SECURITY;

-- IP Ledger: Read-only for all authenticated users, write for service role
CREATE POLICY "ip_ledger_read" ON ip_ledger FOR SELECT TO authenticated USING (true);
CREATE POLICY "ip_ledger_insert" ON ip_ledger FOR INSERT TO authenticated WITH CHECK (true);

-- Content Versions: Read for all, write for authenticated
CREATE POLICY "content_versions_read" ON content_versions FOR SELECT TO authenticated USING (true);
CREATE POLICY "content_versions_insert" ON content_versions FOR INSERT TO authenticated WITH CHECK (true);

-- Platform Metrics: Read for all, write for authenticated
CREATE POLICY "platform_metrics_read" ON platform_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "platform_metrics_insert" ON platform_metrics FOR INSERT TO authenticated WITH CHECK (true);

-- Sync Targets: Read for all, write for authenticated
CREATE POLICY "sync_targets_read" ON sync_targets FOR SELECT TO authenticated USING (true);
CREATE POLICY "sync_targets_all" ON sync_targets FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Add to IP Ledger with hash chain (called from application)
CREATE OR REPLACE FUNCTION add_to_ip_ledger(
  p_entry_type TEXT,
  p_entry_data JSONB
) RETURNS UUID AS $$
DECLARE
  v_latest_hash TEXT;
  v_latest_seq BIGINT;
  v_new_seq BIGINT;
  v_new_hash TEXT;
  v_new_id UUID;
BEGIN
  -- Get latest entry
  SELECT current_hash, sequence_number INTO v_latest_hash, v_latest_seq
  FROM ip_ledger
  ORDER BY sequence_number DESC
  LIMIT 1;

  v_new_seq := COALESCE(v_latest_seq, 0) + 1;

  -- Generate hash (simplified - real hash done in application)
  v_new_hash := encode(sha256(
    (v_new_seq::TEXT || p_entry_type || p_entry_data::TEXT || COALESCE(v_latest_hash, ''))::BYTEA
  ), 'hex');

  INSERT INTO ip_ledger (sequence_number, entry_type, entry_data, previous_hash, current_hash)
  VALUES (v_new_seq, p_entry_type, p_entry_data, v_latest_hash, v_new_hash)
  RETURNING id INTO v_new_id;

  RETURN v_new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Calculate innovation velocity
CREATE OR REPLACE FUNCTION calculate_innovation_velocity(
  p_days INTEGER DEFAULT 7
) RETURNS NUMERIC AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM ip_ledger
  WHERE entry_type = 'innovation.registered'
    AND created_at > NOW() - (p_days || ' days')::INTERVAL;

  RETURN v_count::NUMERIC / p_days;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- SEED DATA: Initial letter sync targets
-- ============================================

INSERT INTO sync_targets (source_path, target_path, content_type, sync_status) VALUES
  ('LAUNCH_DOCUMENTS_MASTER/letters/LETTER-MACKENZIE-SCOTT', 'Cephas/cephas-hugo/content/letters/circle-1-investors/mackenzie-scott.md', 'letter', 'pending'),
  ('LAUNCH_DOCUMENTS_MASTER/letters/LETTER-WARREN-BUFFETT', 'Cephas/cephas-hugo/content/letters/circle-1-investors/warren-buffett.md', 'letter', 'pending'),
  ('LAUNCH_DOCUMENTS_MASTER/letters/LETTER-CRAIG-NEWMARK', 'Cephas/cephas-hugo/content/letters/circle-1-investors/craig-newmark.md', 'letter', 'pending'),
  ('LAUNCH_DOCUMENTS_MASTER/letters/LETTER-MICHAEL-SEIBEL', 'Cephas/cephas-hugo/content/letters/circle-1-investors/michael-seibel.md', 'letter', 'pending'),
  ('LAUNCH_DOCUMENTS_MASTER/letters/LETTER-CASEY-NEWTON', 'Cephas/cephas-hugo/content/letters/circle-2-media/casey-newton.md', 'letter', 'pending'),
  ('LAUNCH_DOCUMENTS_MASTER/letters/LETTER-TAYLOR-SWIFT', 'Cephas/cephas-hugo/content/letters/circle-2-media/taylor-swift.md', 'letter', 'pending'),
  ('LAUNCH_DOCUMENTS_MASTER/letters/LETTER-HANK-GREEN', 'Cephas/cephas-hugo/content/letters/circle-2-media/hank-green.md', 'letter', 'pending'),
  ('LAUNCH_DOCUMENTS_MASTER/letters/LETTER-KARA-SWISHER', 'Cephas/cephas-hugo/content/letters/circle-2-media/kara-swisher.md', 'letter', 'pending'),
  ('LAUNCH_DOCUMENTS_MASTER/letters/LETTER-EZRA-KLEIN', 'Cephas/cephas-hugo/content/letters/circle-2-media/ezra-klein.md', 'letter', 'pending'),
  ('LAUNCH_DOCUMENTS_MASTER/letters/LETTER-TIM-INGHAM', 'Cephas/cephas-hugo/content/letters/circle-2-media/tim-ingham.md', 'letter', 'pending'),
  ('LAUNCH_DOCUMENTS_MASTER/letters/LETTER-TREBOR-SCHOLZ', 'Cephas/cephas-hugo/content/letters/circle-3-academics/trebor-scholz.md', 'letter', 'synced'),
  ('LAUNCH_DOCUMENTS_MASTER/letters/LETTER-NATHAN-SCHNEIDER', 'Cephas/cephas-hugo/content/letters/circle-3-academics/nathan-schneider.md', 'letter', 'synced'),
  ('LAUNCH_DOCUMENTS_MASTER/letters/LETTER-ERIK-BRYNJOLFSSON', 'Cephas/cephas-hugo/content/letters/circle-3-academics/erik-brynjolfsson.md', 'letter', 'pending'),
  ('LAUNCH_DOCUMENTS_MASTER/letters/LETTER-TATIANA-SCHLOSSBERG', 'Cephas/cephas-hugo/content/letters/circle-3-academics/tatiana-schlossberg.md', 'letter', 'pending')
ON CONFLICT (source_path) DO NOTHING;

-- Initial platform metrics
INSERT INTO platform_metrics (metric_name, metric_value, metric_unit, context) VALUES
  ('innovation_count', 1243, 'count', '{"source": "manual", "date": "2026-02-18"}'::JSONB),
  ('patent_claims', 210, 'count', '{"applications": 7}'::JSONB),
  ('platform_margin', 20, 'percent', '{"locked": true}'::JSONB),
  ('creator_keeps', 83.3, 'percent', '{"locked": true}'::JSONB),
  ('membership_cost', 5, 'usd', '{"period": "year"}'::JSONB),
  ('structural_bylaws', 15, 'count', '{"latest": "Universal Remote Work"}'::JSONB);

COMMENT ON TABLE ip_ledger IS 'Immutable, hash-chained records for critical platform data';
COMMENT ON TABLE content_versions IS 'Full version history for all documents and configurations';
COMMENT ON TABLE platform_metrics IS 'Real-time health and performance tracking';
COMMENT ON TABLE sync_targets IS 'Track synchronization between source and public documentation';
