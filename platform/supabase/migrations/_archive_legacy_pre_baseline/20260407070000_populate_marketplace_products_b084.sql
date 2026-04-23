-- B084: Add real storefronts to marketplace
INSERT INTO storefronts (user_id, name, slug, description, category, owner_name, is_open, status, tagline)
VALUES
  ((SELECT id FROM auth.users LIMIT 1), 'HexIsle Terrain Shop', 'hexisle-terrain-shop', 'Download 3D-printable hex terrain. Active mechanics.', 'digital', 'Liana Banyan Corporation', true, 'active', 'Your hex terrain. One snap.'),
  ((SELECT id FROM auth.users LIMIT 1), 'The 2nd Second Factory', 'the-2nd-second-factory', 'Canister System. Pre-order $149.', 'crafts_making', 'Liana Banyan Corporation', true, 'active', 'Manufacturing from the ground up.'),
  ((SELECT id FROM auth.users LIMIT 1), 'Cooperative Classroom', 'cooperative-classroom', 'Teachers keep 83.3%. Classes over Zoom.', 'education', 'Liana Banyan Community', true, 'active', 'Real teachers. Real skills.'),
  ((SELECT id FROM auth.users LIMIT 1), 'Cephas Academic Library', 'cephas-academic-library', '38 papers. Free to read and cite.', 'digital', 'Liana Banyan Corporation', true, 'active', 'The research. All free.'),
  ((SELECT id FROM auth.users LIMIT 1), 'Bounty Photography', 'bounty-photography', 'Post a bounty. Get your shot.', 'services', 'Liana Banyan Community', true, 'active', 'Post a bounty. Get your shot.')
ON CONFLICT (slug) DO UPDATE SET description = EXCLUDED.description, tagline = EXCLUDED.tagline, status = EXCLUDED.status;
