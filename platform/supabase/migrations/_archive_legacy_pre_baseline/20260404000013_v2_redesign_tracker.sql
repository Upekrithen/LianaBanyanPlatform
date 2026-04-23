CREATE TABLE IF NOT EXISTS v2_redesign_tracker (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_name TEXT NOT NULL UNIQUE,
  page_route TEXT,
  pawn_batch TEXT,
  spec_file TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'review', 'completed', 'blocked')),
  assignee TEXT,
  dependencies TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  session_history TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  screenshot_urls TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  notes TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_v2_redesign_tracker_status
  ON v2_redesign_tracker (status);

CREATE INDEX IF NOT EXISTS idx_v2_redesign_tracker_batch
  ON v2_redesign_tracker (pawn_batch);

ALTER TABLE v2_redesign_tracker ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read v2_redesign_tracker" ON v2_redesign_tracker;
CREATE POLICY "Public read v2_redesign_tracker"
  ON v2_redesign_tracker
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Auth write v2_redesign_tracker" ON v2_redesign_tracker;
CREATE POLICY "Auth write v2_redesign_tracker"
  ON v2_redesign_tracker
  FOR ALL
  USING (true)
  WITH CHECK (true);

INSERT INTO v2_redesign_tracker (page_name, page_route, pawn_batch, spec_file, dependencies, notes)
VALUES
  ('Family Table Hub', '/family', 'B35_3A', 'BISHOP_DROPZONE/PAWN_BATCH_35_V2_PAGE_DESIGN_SPECS_PHASE_3A.md', ARRAY['family_table_compilation'], 'Needs family table compilation before redesign kickoff.'),
  ('Crew Call Board', '/crew-call', 'B35_3A', 'BISHOP_DROPZONE/PAWN_BATCH_35_V2_PAGE_DESIGN_SPECS_PHASE_3A.md', ARRAY[]::TEXT[], ''),
  ('ADAPT Score Profile', '/adapt-score', 'B35_3A', 'BISHOP_DROPZONE/PAWN_BATCH_35_V2_PAGE_DESIGN_SPECS_PHASE_3A.md', ARRAY[]::TEXT[], ''),
  ('Tribe Directory', '/tribes', 'B35_3A', 'BISHOP_DROPZONE/PAWN_BATCH_35_V2_PAGE_DESIGN_SPECS_PHASE_3A.md', ARRAY[]::TEXT[], ''),
  ('Vehicle / Local Wheels', '/local-wheels', 'B35_3A', 'BISHOP_DROPZONE/PAWN_BATCH_35_V2_PAGE_DESIGN_SPECS_PHASE_3A.md', ARRAY['vehicle_domain_sync'], ''),
  ('Design Democracy', '/design-democracy', 'B35_3A', 'BISHOP_DROPZONE/PAWN_BATCH_35_V2_PAGE_DESIGN_SPECS_PHASE_3A.md', ARRAY['design_democracy_seed_data'], ''),
  ('HexIsle Landing', '/hexisle', 'B36_3B', 'BISHOP_DROPZONE/PAWN_BATCH_36_V2_PAGE_DESIGN_SPECS_PHASE_3B.md', ARRAY[]::TEXT[], ''),
  ('Storefront Builder', '/tools/storefront-builder', 'B36_3B', 'BISHOP_DROPZONE/PAWN_BATCH_36_V2_PAGE_DESIGN_SPECS_PHASE_3B.md', ARRAY[]::TEXT[], ''),
  ('Red Carpet Landing', '/red-carpet', 'B36_3B', 'BISHOP_DROPZONE/PAWN_BATCH_36_V2_PAGE_DESIGN_SPECS_PHASE_3B.md', ARRAY[]::TEXT[], ''),
  ('LB Card', '/dashboard/lb-card', 'B36_3B', 'BISHOP_DROPZONE/PAWN_BATCH_36_V2_PAGE_DESIGN_SPECS_PHASE_3B.md', ARRAY[]::TEXT[], ''),
  ('Guided Tour', '/tour', 'B36_3B', 'BISHOP_DROPZONE/PAWN_BATCH_36_V2_PAGE_DESIGN_SPECS_PHASE_3B.md', ARRAY[]::TEXT[], 'Overlay component tracked as page-level redesign item.'),
  ('Pioneer Showcase', '/pioneers', 'B36_3B', 'BISHOP_DROPZONE/PAWN_BATCH_36_V2_PAGE_DESIGN_SPECS_PHASE_3B.md', ARRAY[]::TEXT[], ''),
  ('Backer Election', '/backer-election', 'B37_3C', 'BISHOP_DROPZONE/PAWN_BATCH_37_V2_PAGE_DESIGN_SPECS_PHASE_3C.md', ARRAY[]::TEXT[], ''),
  ('Content Shield', '/content-shield', 'B37_3C', 'BISHOP_DROPZONE/PAWN_BATCH_37_V2_PAGE_DESIGN_SPECS_PHASE_3C.md', ARRAY[]::TEXT[], ''),
  ('Subscription Channels', '/subscription-channels', 'B37_3C', 'BISHOP_DROPZONE/PAWN_BATCH_37_V2_PAGE_DESIGN_SPECS_PHASE_3C.md', ARRAY[]::TEXT[], ''),
  ('Coalition', '/coalitions', 'B37_3C', 'BISHOP_DROPZONE/PAWN_BATCH_37_V2_PAGE_DESIGN_SPECS_PHASE_3C.md', ARRAY[]::TEXT[], ''),
  ('Treasure Map Builder', '/treasure-map/create', 'B37_3C', 'BISHOP_DROPZONE/PAWN_BATCH_37_V2_PAGE_DESIGN_SPECS_PHASE_3C.md', ARRAY[]::TEXT[], ''),
  ('Bounty Photography', '/bounty/photography', 'B37_3C', 'BISHOP_DROPZONE/PAWN_BATCH_37_V2_PAGE_DESIGN_SPECS_PHASE_3C.md', ARRAY[]::TEXT[], '')
ON CONFLICT (page_name) DO NOTHING;
