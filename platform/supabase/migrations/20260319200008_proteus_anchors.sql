-- Proteus Anchor System — Innovation #1553
-- A "Proteus" is a product/system that can transform and adapt.
-- The Anchor ties it to the cooperative's manufacturing backbone.
-- HexIsle is the inaugural Proteus.

CREATE TABLE IF NOT EXISTS proteus_anchors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  product_type TEXT NOT NULL,
  manufacturing_processes TEXT[] DEFAULT '{}',
  tereno_tier INTEGER CHECK (tereno_tier BETWEEN 1 AND 6),
  anchor_status TEXT NOT NULL DEFAULT 'draft' CHECK (anchor_status IN ('draft', 'active', 'legacy')),
  hexisle_compatible BOOLEAN DEFAULT FALSE,
  innovation_number INTEGER,
  ip_ledger_hash TEXT,
  image_url TEXT,
  external_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  activated_at TIMESTAMPTZ,
  legacy_at TIMESTAMPTZ
);

CREATE INDEX idx_proteus_anchors_status ON proteus_anchors (anchor_status);
CREATE INDEX idx_proteus_anchors_slug ON proteus_anchors (slug);

-- Compatibility matrix: which manufacturing modules can produce which Proteus
CREATE TABLE IF NOT EXISTS proteus_manufacturing_compat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proteus_id UUID NOT NULL REFERENCES proteus_anchors(id) ON DELETE CASCADE,
  module_type TEXT NOT NULL,
  compatibility_level TEXT NOT NULL DEFAULT 'full' CHECK (compatibility_level IN ('full', 'partial', 'experimental')),
  notes TEXT,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_proteus_compat_proteus ON proteus_manufacturing_compat (proteus_id);

-- Proteus transformation log: tracks how a Proteus adapts over time
CREATE TABLE IF NOT EXISTS proteus_transformations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proteus_id UUID NOT NULL REFERENCES proteus_anchors(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  transformation_type TEXT NOT NULL CHECK (transformation_type IN ('design_revision', 'material_change', 'process_upgrade', 'scale_shift', 'market_pivot')),
  before_state JSONB DEFAULT '{}'::jsonb,
  after_state JSONB DEFAULT '{}'::jsonb,
  initiated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_proteus_transforms_proteus ON proteus_transformations (proteus_id, created_at DESC);

-- RLS
ALTER TABLE proteus_anchors ENABLE ROW LEVEL SECURITY;
ALTER TABLE proteus_manufacturing_compat ENABLE ROW LEVEL SECURITY;
ALTER TABLE proteus_transformations ENABLE ROW LEVEL SECURITY;

-- Public read on anchors
CREATE POLICY "Anyone can read active anchors"
  ON proteus_anchors FOR SELECT
  USING (anchor_status = 'active' OR auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin'));

-- Admin write on anchors
CREATE POLICY "Admins manage anchors"
  ON proteus_anchors FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin'));

-- Public read on compat
CREATE POLICY "Anyone can read compat matrix"
  ON proteus_manufacturing_compat FOR SELECT
  USING (TRUE);

-- Admin write on compat
CREATE POLICY "Admins manage compat"
  ON proteus_manufacturing_compat FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin'));

-- Authenticated read on transformations
CREATE POLICY "Authenticated read transformations"
  ON proteus_transformations FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Admin write on transformations
CREATE POLICY "Admins manage transformations"
  ON proteus_transformations FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin'));

-- Seed: HexIsle as the inaugural Proteus
INSERT INTO proteus_anchors (
  name, slug, description, product_type, manufacturing_processes,
  tereno_tier, anchor_status, hexisle_compatible, innovation_number,
  activated_at
) VALUES (
  'HexIsle',
  'hexisle',
  'The inaugural Proteus. A modular hexagonal tile system that transforms from tabletop game piece to cooperative manufacturing product. Slip-cast ceramics, 3D-printed prototypes, desktop-extruded variants — all interchangeable within the HexIsle ecosystem.',
  'modular_tile_system',
  ARRAY['slip_casting', 'sla', 'sls', 'desktop_extrusion'],
  3,
  'active',
  TRUE,
  1553,
  now()
);

-- Seed compat entries for HexIsle
INSERT INTO proteus_manufacturing_compat (proteus_id, module_type, compatibility_level, notes, verified_at) VALUES
  ((SELECT id FROM proteus_anchors WHERE slug = 'hexisle'), 'slip_casting', 'full', 'Primary production method. Proven at scale with Boise Business Cards pilot.', now()),
  ((SELECT id FROM proteus_anchors WHERE slug = 'hexisle'), 'sla', 'full', 'High-detail prototyping. Excellent for master molds.', now()),
  ((SELECT id FROM proteus_anchors WHERE slug = 'hexisle'), 'sls', 'full', 'Nylon variants for outdoor/travel sets.', now()),
  ((SELECT id FROM proteus_anchors WHERE slug = 'hexisle'), 'desktop_extrusion', 'partial', 'PLA/PETG variants. Layer lines visible but functional. Good for test-pilots.', now()),
  ((SELECT id FROM proteus_anchors WHERE slug = 'hexisle'), 'injection_mold', 'experimental', 'High-volume future path. Requires tooling investment.', now()),
  ((SELECT id FROM proteus_anchors WHERE slug = 'hexisle'), 'cnc', 'experimental', 'Wood/metal variants for luxury editions. Not yet prototyped.', now());

-- Seed transformation log
INSERT INTO proteus_transformations (proteus_id, title, description, transformation_type, before_state, after_state) VALUES
  ((SELECT id FROM proteus_anchors WHERE slug = 'hexisle'), 'Genesis: From Chess Variant to Cooperative Product', 'HexIsle began as a chess variant designed in 1989. Transformed into a cooperative manufacturing showcase: every tile is a job, every set is a community.', 'market_pivot', '{"form": "board game concept", "year": 1989}'::jsonb, '{"form": "cooperative manufacturing product", "year": 2026}'::jsonb),
  ((SELECT id FROM proteus_anchors WHERE slug = 'hexisle'), 'Material Expansion: Ceramic + Polymer', 'Added SLA and desktop extrusion compatibility alongside the original slip-casting process. Now producible in 4 manufacturing methods.', 'process_upgrade', '{"processes": ["slip_casting"]}'::jsonb, '{"processes": ["slip_casting", "sla", "sls", "desktop_extrusion"]}'::jsonb),
  ((SELECT id FROM proteus_anchors WHERE slug = 'hexisle'), 'Slotted Top Innovation', 'The Slotted Top hex design enables snap-fit accessories, stackable terrain, and modular game scenarios.', 'design_revision', '{"features": ["flat_top"]}'::jsonb, '{"features": ["flat_top", "slotted_top", "snap_fit", "stackable"]}'::jsonb);
