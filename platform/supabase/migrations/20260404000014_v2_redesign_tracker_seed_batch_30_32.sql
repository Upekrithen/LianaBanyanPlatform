-- Seed verified V2 redesign pages from Pawn batches 30-32.
-- Note: no seed entries for B33/B34 are included here because no matching
-- Pawn v2 spec files were found in the current workspace.
INSERT INTO v2_redesign_tracker (page_name, page_route, pawn_batch, spec_file, dependencies, notes)
VALUES
  ('Membership Page', '/membership', 'B30', 'BISHOP_DROPZONE/PAWN_BATCH_30_V2_PAGE_DESIGN_SPECS.md', ARRAY[]::TEXT[], ''),
  ('Welcome Gate Page', '/welcome', 'B30', 'BISHOP_DROPZONE/PAWN_BATCH_30_V2_PAGE_DESIGN_SPECS.md', ARRAY[]::TEXT[], ''),
  ('Cold Start Page', '/cold-start', 'B30', 'BISHOP_DROPZONE/PAWN_BATCH_30_V2_PAGE_DESIGN_SPECS.md', ARRAY[]::TEXT[], ''),
  ('Ghost Browse Page', '/ghost-world', 'B30', 'BISHOP_DROPZONE/PAWN_BATCH_30_V2_PAGE_DESIGN_SPECS.md', ARRAY[]::TEXT[], ''),
  ('Wallet Page', '/wallet', 'B30', 'BISHOP_DROPZONE/PAWN_BATCH_30_V2_PAGE_DESIGN_SPECS.md', ARRAY[]::TEXT[], ''),
  ('Captain Dashboard', '/captain/dashboard', 'B30', 'BISHOP_DROPZONE/PAWN_BATCH_30_V2_PAGE_DESIGN_SPECS.md', ARRAY[]::TEXT[], ''),
  ('Cephas Gateway Page', '/cephas', 'B31', 'BISHOP_DROPZONE/PAWN_BATCH_31_V2_PAGE_DESIGN_SPECS.md', ARRAY[]::TEXT[], ''),
  ('Cue Card Creator Page', '/dashboard/cue-cards/create', 'B31', 'BISHOP_DROPZONE/PAWN_BATCH_31_V2_PAGE_DESIGN_SPECS.md', ARRAY[]::TEXT[], ''),
  ('Marketplace Page', '/marketplace', 'B31', 'BISHOP_DROPZONE/PAWN_BATCH_31_V2_PAGE_DESIGN_SPECS.md', ARRAY[]::TEXT[], ''),
  ('Transparency Ledger Page', '/transparent-ledger', 'B31', 'BISHOP_DROPZONE/PAWN_BATCH_31_V2_PAGE_DESIGN_SPECS.md', ARRAY[]::TEXT[], ''),
  ('Star Chamber Page', '/star-chamber', 'B31', 'BISHOP_DROPZONE/PAWN_BATCH_31_V2_PAGE_DESIGN_SPECS.md', ARRAY[]::TEXT[], ''),
  ('Guild Directory Page', '/guilds', 'B31', 'BISHOP_DROPZONE/PAWN_BATCH_31_V2_PAGE_DESIGN_SPECS.md', ARRAY[]::TEXT[], ''),
  ('Housing Hub Page', '/housing', 'B32', 'BISHOP_DROPZONE/PAWN_BATCH_32_V2_PAGE_DESIGN_SPECS.md', ARRAY[]::TEXT[], ''),
  ('Canister Configurator Page', '/factory/canister', 'B32', 'BISHOP_DROPZONE/PAWN_BATCH_32_V2_PAGE_DESIGN_SPECS.md', ARRAY[]::TEXT[], ''),
  ('Beacon Run Creator Page', '/beacon-run/create', 'B32', 'BISHOP_DROPZONE/PAWN_BATCH_32_V2_PAGE_DESIGN_SPECS.md', ARRAY[]::TEXT[], ''),
  ('Dispatch Compose Page', '/dashboard/dispatch', 'B32', 'BISHOP_DROPZONE/PAWN_BATCH_32_V2_PAGE_DESIGN_SPECS.md', ARRAY[]::TEXT[], ''),
  ('Political Expedition Page', '/political-expedition', 'B32', 'BISHOP_DROPZONE/PAWN_BATCH_32_V2_PAGE_DESIGN_SPECS.md', ARRAY[]::TEXT[], ''),
  ('Calendar Page', '/calendar', 'B32', 'BISHOP_DROPZONE/PAWN_BATCH_32_V2_PAGE_DESIGN_SPECS.md', ARRAY[]::TEXT[], '')
ON CONFLICT (page_name) DO NOTHING;
