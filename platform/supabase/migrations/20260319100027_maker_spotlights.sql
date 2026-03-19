-- Migration: Maker Spotlights — "I'll Make You Famous!" system
-- Bishop 013 / Session 50

CREATE TABLE IF NOT EXISTS maker_spotlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handle TEXT NOT NULL,
  display_name TEXT NOT NULL,
  tier INTEGER NOT NULL DEFAULT 3 CHECK (tier BETWEEN 1 AND 3),
  specialty TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  verified BOOLEAN NOT NULL DEFAULT false,
  best_post_likes TEXT NOT NULL DEFAULT '0',
  sells_on TEXT,
  external_url TEXT,
  lb_project_url TEXT,
  image_url TEXT,
  category TEXT NOT NULL DEFAULT 'maker',
  hexisle_relevant BOOLEAN NOT NULL DEFAULT false,
  slip_casting_pioneer BOOLEAN NOT NULL DEFAULT false,
  rotation_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE maker_spotlights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active spotlights" ON maker_spotlights
  FOR SELECT USING (active = true);

CREATE POLICY "Admins manage spotlights" ON maker_spotlights
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin','owner'))
  );

-- Seed the 47 creators from Instagram Factor-y collection
INSERT INTO maker_spotlights (handle, display_name, tier, specialty, description, verified, best_post_likes, sells_on, category, hexisle_relevant, slip_casting_pioneer, rotation_order) VALUES
-- Tier 1: HIGH-VALUE
('forgecoreco', 'ForgeCore Co', 1, 'Plant accessories, coasters, sports toys', 'High-volume 3D print manufacturer with 514K+ likes. Plant accessories, coasters, and sports toys.', true, '514K', 'Own site', 'maker', false, false, 1),
('nicholepaclibar', 'Nichole Paclibar', 1, 'Product influencer', 'Product influencer with 664K likes reach. Amazon affiliate network.', true, '664K', 'Amazon affiliate', 'influencer', false, false, 2),
('loftedgoods', 'Lofted Goods', 1, 'Wall-mount planters with drip jars', 'Innovative wall-mount planters with integrated drip jar systems. STL file seller.', true, '230K', 'STL files', 'maker', false, false, 3),
('forest.ofcreativity', 'Forest of Creativity', 1, 'Air-dry clay DIY tutorials', 'Air-dry clay tutorial creator with 199K likes. Educational content focus.', false, '199K', 'Tutorial content', 'educator', false, false, 4),
('geekmonkey.in', 'GeekMonkey', 1, 'Creative bookshelves, gift products', 'Creative bookshelves and gift products. India-based maker with 157K likes.', true, '157K', 'India-based store', 'maker', false, false, 5),
('gazzaladradesign', 'Gazzaladra Design', 1, '3D printed notebooks, home products', '3D printed notebooks and home products. Active on Thangs3D with 132K likes.', true, '132K', 'Thangs3D', 'maker', false, false, 6),
('craftykid3d', 'CraftyKid3D', 1, 'Dragon book nooks', 'Dragon book nook specialist with 123K likes. Patreon-based creator.', true, '123K', 'Patreon', 'maker', false, false, 7),
('germy_ballswell', 'Germy Ballswell', 1, 'Engineering projects, potato cannon', 'Engineering projects including the famous potato cannon. 110K likes.', true, '110K', 'Files in bio', 'maker', false, false, 8),
('ghost_doggy_shop', 'Ghost Doggy Shop', 1, 'Finished 3D printed products', 'Taiwan-based finished 3D printed products shop. 103K likes.', false, '103K', 'Direct sales', 'maker', false, false, 9),
('makerspace.online', 'MakerSpace Online', 1, 'Business card embossers', 'Business card embossers and maker tools. Active on MakerWorld.', false, '101K', 'MakerWorld', 'maker', false, false, 10),
('fun.gift.idea', 'Fun Gift Idea', 1, '3D printed gift items', '3D printed gift items with 443K likes. Gift-focused product line.', false, '443K', NULL, 'maker', false, false, 11),
('niotoys1', 'NIO Toys', 1, 'Mechanical toys', 'Mechanical toy designer with 63.8K likes. Intricate mechanisms.', false, '63.8K', NULL, 'maker', false, false, 12),
('tales3dmaker', 'Tales 3D Maker', 1, 'Mesh/mold 3D printing techniques', 'Advanced mesh and mold 3D printing techniques. 56.7K likes.', false, '56.7K', NULL, 'maker', false, false, 13),
('measuredandslow', 'Measured and Slow', 1, '3D printed dragon scale fabric', 'Dragon scale fabric pioneer using 3D printing. 57.5K likes.', false, '57.5K', NULL, 'maker', false, false, 14),
('hammerlyceramics', 'Hammerly Ceramics', 1, 'Slip cast ceramics, lamps, mugs', 'Architecture-inspired slip cast ceramics. Lamps, mugs, and art pieces. 55.4K likes.', true, '55.4K', 'Own shop', 'maker', false, true, 15),
('armas.4am', 'Armas 4AM', 1, 'Robotics, cycloidal gearboxes', 'Robotics and cycloidal gearbox specialist. 46.3K likes.', true, '46.3K', NULL, 'maker', false, false, 16),
('curv.lab', 'Curv Lab', 1, '3D printable RC car chassis', '3D printable RC car chassis designer. Active at curvlab.com. 37.6K likes.', true, '37.6K', 'curvlab.com', 'maker', false, false, 17),
('playconveyor', 'Play Conveyor', 1, 'Modular storage containers', 'Modular storage container system. Active on Thangs3D. 36.3K likes.', true, '36.3K', 'Thangs3D', 'maker', false, false, 18),
('concept_bytes', 'Concept Bytes', 1, 'Smart chess board, engineering', 'Smart chess board and engineering projects. 33.9K likes.', true, '33.9K', NULL, 'maker', false, false, 19),
('seekamaze', 'SeekAmaze', 1, 'DIY craftsmanship/hacks', 'DIY craftsmanship and hacks creator. 32.9K likes.', false, '32.9K', NULL, 'maker', false, false, 20),
('krysplants', 'Krys Plants', 1, 'Novelty plant accessories', 'Novelty plant accessories with dedicated store. 32.6K likes.', true, '32.6K', 'Own store', 'maker', false, false, 21),
('josefprusa', 'Josef Prusa', 1, 'Prusa Research founder', 'Founder of Prusa Research — legendary 3D printer manufacturer. 31.4K likes.', true, '31.4K', 'Printables.com', 'maker', false, false, 22),
('pyahik', 'Pyahik', 1, 'Resin keychains, small business', 'Resin keychain artisan with dedicated shop. 31.8K likes.', true, '31.8K', 'Own shop', 'maker', false, false, 23),
('dinarakasko', 'Dinara Kasko', 1, 'Silicone mold cake design', 'Silicone mold cake/pastry designer. Food + manufacturing crossover. 24.7K likes.', true, '24.7K', 'Own mold shop', 'food', false, true, 24),
-- Tier 2: MID-VALUE
('yird_ceramics', 'Yird Ceramics', 2, 'Slip cast cups with plaster molds', 'Traditional slip casting with plaster molds. 25.6K likes.', false, '25.6K', NULL, 'maker', false, true, 25),
('turn.studio', 'Turn Studio', 2, 'Full slip casting pipeline', 'Full 3D to silicone to plaster to porcelain pipeline. 23.1K likes.', false, '23.1K', NULL, 'maker', false, true, 26),
('bloblab3d', 'BlobLab 3D', 2, 'Character design (Blob Beetles)', 'Character designer specializing in Blob Beetles. 22.1K likes.', false, '22.1K', NULL, 'maker', false, false, 27),
('elle.stvdio', 'Elle Studio', 2, 'Beehive designs, flying butterflies', 'Beehive designs and flying butterfly mechanisms. 20.7K likes.', true, '20.7K', NULL, 'maker', false, false, 28),
('volex3d', 'Volex 3D', 2, '3D printed workshop tools', 'Workshop tool curator and creator. Credits other makers. 18.7K likes.', false, '18.7K', NULL, 'maker', false, false, 29),
('theworkspacehero', 'The Workspace Hero', 2, '3D printable notebook system', '3D printable notebook system designer. 15.9K likes.', false, '15.9K', NULL, 'maker', false, false, 30),
('frankmontano', 'Frank Montano', 2, 'Mold making with silicone/resin', 'Silicone and resin mold making specialist. 12K likes.', false, '12K', NULL, 'maker', false, false, 31),
('pathofseb', 'Path of Seb', 2, 'Engineering/robotics projects', 'Engineering and robotics project creator. 11.4K likes.', false, '11.4K', NULL, 'maker', false, false, 32),
('wigglitz.zb', 'Wigglitz', 2, 'Print farm operation', 'Print farm operator scaling 3D production. 8.1K likes.', true, '8.1K', NULL, 'maker', false, false, 33),
('3d_printer_academy', '3D Printer Academy', 2, '3D printing education', '3D printing education platform. ~5K likes.', false, '5K', NULL, 'educator', false, false, 34),
('nibblecommunity', 'Nibble Community', 2, 'Engineering education platform', 'Engineering education community. 6.7K likes.', false, '6.7K', NULL, 'educator', false, false, 35),
('nvkv.makes', 'NVKV Makes', 2, 'Mechanical coupling demos', 'Mechanical coupling demonstration creator. 6.4K likes.', false, '6.4K', NULL, 'maker', false, false, 36),
('printsculptors', 'Print Sculptors', 2, 'Fidget toys, clickers', 'Fidget toy and clicker specialist. 40.6K likes.', true, '40.6K', NULL, 'maker', false, false, 37),
('krakdrag3d', 'KrakDrag 3D', 2, 'Cyber Cat headphone holder', 'Cyber Cat headphone holder designer. 63.3K likes.', false, '63.3K', NULL, 'maker', false, false, 38),
('elden_designs', 'Elden Designs', 2, '3D printed lamp designs', 'Lamp designer using 3D printing. 5.3K likes.', false, '5.3K', NULL, 'maker', false, false, 39),
-- Tier 3: EMERGING/NICHE
('fusefoxdesign', 'FuseFox Design (Tactocrat)', 3, 'Magnetic spring mechanisms', 'Magnetic spring mechanism specialist. HexIsle partner candidate. ~2K likes.', false, '2K', NULL, 'maker', true, false, 40),
('greg.dean.mann', 'Greg Dean Mann', 3, 'Lamp design', 'Lamp designer. ~1K likes.', false, '1K', NULL, 'maker', false, false, 41),
('moritz__walter', 'Moritz Walter', 3, 'Tool design', 'Tool designer and maker. ~1K likes.', false, '1K', NULL, 'maker', false, false, 42),
('elega.yyc', 'Elega YYC', 3, 'Clip design', 'Clip designer. ~500 likes.', false, '500', NULL, 'maker', false, false, 43),
('emgi3d', 'EMGI 3D', 3, 'Mechanism design', 'Mechanism designer. HexIsle-relevant compliant mechanisms. ~2K likes.', false, '2K', NULL, 'maker', true, false, 44),
('abyssalcactus', 'Abyssal Cactus', 3, 'Print-in-place hinge design', 'Print-in-place hinge specialist. Compliant mechanism expertise. 2.5K likes.', false, '2.5K', NULL, 'maker', true, false, 45),
('tabletopstamps', 'Tabletop Stamps', 3, 'Modular dungeon stamps for D&D', 'Modular dungeon stamps. Commenters requesting hex stamps. 675 likes.', false, '675', NULL, 'maker', true, false, 46),
('theupgradefactory', 'The Upgrade Factory', 3, 'Tabletop terrain (BattleTech/D&D)', 'Tabletop terrain for BattleTech and D&D. Kickstarter funded. HexIsle-relevant.', true, '13', NULL, 'maker', true, false, 47);
