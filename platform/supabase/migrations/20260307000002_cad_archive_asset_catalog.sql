-- ============================================================================
-- CAD ARCHIVE — ASSET LIBRARY CATALOG ENTRIES
-- ============================================================================
-- Innovation #1497: Wire 146 CAD files from hexisleProjectSpec ARCHIVE
--
-- DIAGNOSTIC CONFIRMED live schema (from 20260209000004):
--   name TEXT, description TEXT, file_url TEXT, file_type TEXT,
--   category TEXT, tags TEXT[], download_cost NUMERIC,
--   download_count INTEGER, uploaded_by UUID, is_public BOOLEAN
--
-- Created: 2026-03-07 (Session 6i, corrected after column diagnostic)
-- ============================================================================

INSERT INTO lb_asset_library (
  id, name, description, category, file_type, tags,
  download_cost, download_count, is_public
)
VALUES
  -- Main Assembly
  (gen_random_uuid(),
   'pGear12DD — Main HexIsle Assembly',
   'Master Fusion 360 assembly file (157 MB). Complete HexIsle water table with all 146 sub-components. 40+ years of engineering. Patent 63/938,216.',
   'prototype', 'f3d',
   ARRAY['hexisle', 'cad', 'main-assembly', 'fusion360', 'tereno'],
   50, 0, true),

  -- Core Mechanisms
  (gen_random_uuid(),
   'ChannelLock — Base Connector',
   'Hexagonal base that locks Hexels together and channels water between them. Foundation of the snap-fit assembly system.',
   'prototype', 'f3d',
   ARRAY['hexisle', 'cad', 'mechanism', 'channellock'],
   5, 0, true),

  (gen_random_uuid(),
   'HollowLog — Central Column (15.50mm)',
   'Central water column in each Hexel. Conducts hydraulic pressure between tiles. 15.50mm diameter precision fit.',
   'prototype', 'f3d',
   ARRAY['hexisle', 'cad', 'mechanism', 'hollowlog'],
   5, 0, true),

  (gen_random_uuid(),
   'Golden Lotus — Flow-to-Rotation Converter',
   'Tesla valve-shaped 6-cup mechanism. Converts hydraulic push/pull into rotational motion. THE key breakthrough.',
   'prototype', 'f3d',
   ARRAY['hexisle', 'cad', 'mechanism', 'golden-lotus', 'tesla-valve'],
   10, 0, true),

  (gen_random_uuid(),
   'Ouralis — Tidal Clock Mechanism',
   '12-rotation tide cycle creates the game clock. One full tide = one game turn. Diceless combat resolution.',
   'prototype', 'f3d',
   ARRAY['hexisle', 'cad', 'mechanism', 'ouralis', 'tidal-clock'],
   10, 0, true),

  (gen_random_uuid(),
   'Sawtooth60 — Directional Current System',
   'Sawtooth-pattern current framework (36mm depth, 18mm grooves). Creates directional water flow in channels.',
   'prototype', 'f3d',
   ARRAY['hexisle', 'cad', 'mechanism', 'sawtooth60'],
   5, 0, true),

  (gen_random_uuid(),
   'Rotor — Motion Output Module',
   'Converts Golden Lotus rotation into visible game-state changes. The mechanical feedback system.',
   'prototype', 'f3d',
   ARRAY['hexisle', 'cad', 'mechanism', 'rotor'],
   5, 0, true),

  -- Characters (28mm scale)
  (gen_random_uuid(),
   'Kai — The Navigator (28mm)',
   'Character miniature: Master of currents and tides. 28mm scale, POCF design. By Caleb Jones, Creative Director.',
   'prototype', 'f3d',
   ARRAY['hexisle', 'cad', 'character', 'kai', '28mm', 'pocf'],
   3, 0, true),

  (gen_random_uuid(),
   'Mira — The Engineer (28mm)',
   'Character miniature: Builder of bridges and dams. 28mm scale, POCF design with modular accessories. By Caleb Jones.',
   'prototype', 'f3d',
   ARRAY['hexisle', 'cad', 'character', 'mira', '28mm', 'pocf'],
   3, 0, true),

  (gen_random_uuid(),
   'Zephyr — The Wind Rider (28mm)',
   'Character miniature: Scout of the upper currents. 28mm scale, POCF design. By Caleb Jones.',
   'prototype', 'f3d',
   ARRAY['hexisle', 'cad', 'character', 'zephyr', '28mm', 'pocf'],
   3, 0, true),

  -- Manufacturing Components
  (gen_random_uuid(),
   'Hexel — Complete 12-Part Tile Assembly',
   'Full Hexel tile: 12 modular parts that snap together, connect to other Hexels, contain working mechanisms. POCF — no supports, no glue.',
   'prototype', 'f3d',
   ARRAY['hexisle', 'cad', 'hexel', 'tile', 'pocf', '12-part'],
   15, 0, true),

  (gen_random_uuid(),
   'Universal Scale Adapter Set',
   'Adapter rings for 25mm/28mm/32mm scale compatibility. Allows any miniature to work with the hex system.',
   'prototype', 'f3d',
   ARRAY['hexisle', 'cad', 'adapter', 'scale', '25mm', '28mm', '32mm'],
   3, 0, true),

  (gen_random_uuid(),
   'POCF Snap-Fit Connector Library',
   'Complete library of POCF (Print Once Connect Forever) snap-fit connectors. Every undercut designed as a separate piece with precision pegs.',
   'prototype', 'f3d',
   ARRAY['hexisle', 'cad', 'pocf', 'snap-fit', 'connector'],
   5, 0, true),

  (gen_random_uuid(),
   'Compliant Mechanism Terrain Caps',
   'Capstone system: flexible snap-on terrain covers. 4 terrain types included. Patented compliant mechanism design.',
   'prototype', 'f3d',
   ARRAY['hexisle', 'cad', 'terrain', 'capstone', 'compliant-mechanism'],
   5, 0, true),

  (gen_random_uuid(),
   'Lithographic Dual-Process Mold Set',
   'CAD files designed for both 3D printing AND injection molding from the SAME geometry. Zero overhang constraint system.',
   'prototype', 'f3d',
   ARRAY['hexisle', 'cad', 'dual-process', 'injection-mold', '3d-print'],
   20, 0, true),

  -- Water Table Components
  (gen_random_uuid(),
   'Water Table Perimeter Frame',
   'Outer frame of the Tereno water table. Flat-pack design with zip-tie release and telescoping legs. Ships in standard box.',
   'prototype', 'f3d',
   ARRAY['hexisle', 'cad', 'tereno', 'water-table', 'frame'],
   10, 0, true),

  (gen_random_uuid(),
   'Banyan Tree Distribution Manifold',
   'Water distributes like a banyan tree root system. Manifold connects reservoir to all 420 Hexels.',
   'prototype', 'f3d',
   ARRAY['hexisle', 'cad', 'manifold', 'banyan-tree', 'hydraulic'],
   10, 0, true),

  (gen_random_uuid(),
   'Ship Hull — Canoe-to-Viking Transform',
   'Modular ship system: starts as canoe, grows by snapping additional hull segments. Physics-based rudder/keel. By Caleb Jones.',
   'prototype', 'f3d',
   ARRAY['hexisle', 'cad', 'ship', 'modular', 'canoe', 'viking'],
   5, 0, true),

  -- Complete Archive Bundle
  (gen_random_uuid(),
   'HexIsle Complete CAD Archive (146 Files)',
   'Complete Fusion 360 archive: all 146 CAD files. Main assembly (pGear12DD.f3d, 157MB), all sub-assemblies, characters, mechanisms, terrain, manufacturing fixtures. 40+ years of engineering. Patent 63/938,216.',
   'prototype', 'f3d',
   ARRAY['hexisle', 'cad', 'complete-archive', 'all-files', 'patent'],
   100, 0, true)

ON CONFLICT DO NOTHING;
