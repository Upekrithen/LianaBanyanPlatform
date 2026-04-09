-- B054: Seed remaining HexIsle cities (8 of 12 missing) + quests
-- Run via: npx supabase db query --linked -f scripts/b054_hexisle_seed.sql

INSERT INTO hexisle_cities (id, name, subtitle, description, hex_x, hex_y, features, guild_hall, well_type, population, unlock_requirement) VALUES
('harbor-of-first-steps', 'Harbor of First Steps', 'Where every journey begins', 'The starter city where new members learn the basics of the hexagonal terrain system, assemble their first Canister Kit, and earn their first Marks.', 0, 0, ARRAY['starter-quests','tutorial','canister-assembly'], 'Makers Guild', 'stepwell', 50, 'none'),
('the-proving-grounds', 'The Proving Grounds', 'Test your designs', 'A competitive arena where makers submit their parts for quality testing. Winners earn bonus Marks and unlock advanced materials.', 1, -1, ARRAY['quality-testing','competitions','leaderboard'], 'Quality Guild', 'drilled', 30, '100 Marks'),
('coral-reef-foundry', 'Coral Reef Foundry', 'Where water meets fire', 'Underwater-themed manufacturing hub specializing in the SawtoothCoral timing mechanism and water management components.', -1, 1, ARRAY['sawtooth-coral','water-management','channellock'], 'Engineers Guild', 'artesian', 25, '250 Marks'),
('the-canopy', 'The Canopy', 'Build above the trees', 'Elevated production zone for the HollowLog shell components and Clamshell housings. Tree-level workshops with panoramic views.', 2, 0, ARRAY['hollowlog','clamshell','assembly'], 'Woodworkers Guild', 'handdug', 20, '500 Marks'),
('golden-lotus-atelier', 'Golden Lotus Atelier', 'Beauty meets function', 'The aesthetic design center where GoldenLotus crown pieces and decorative elements are crafted. Art meets engineering.', -2, 1, ARRAY['golden-lotus','capstone','slotted-top','aesthetics'], 'Design Guild', 'stepwell', 15, '1000 Marks'),
('gear-works-canyon', 'Gear Works Canyon', 'Precision in the deep', 'Deep canyon workshops where planetary gears, Rotor components, and Ouralis mechanical assemblies are manufactured to micro-tolerances.', 1, 1, ARRAY['planetary-gears','rotor','ouralis','precision'], 'Precision Guild', 'drilled', 12, '1500 Marks'),
('the-cradle', 'The Cradle', 'Where things flip', 'Named after the Cradle piece with its revolutionary flip mechanism. This city specializes in dual-function assemblies that work as both water traps and land traps.', -1, -1, ARRAY['cradle','flip-mechanism','dual-function'], 'Innovation Guild', 'artesian', 10, '2000 Marks'),
('summit-factory', 'Summit Factory', 'The peak of production', 'The highest-tier manufacturing node. Full industrial press, 50K+ parts/year capacity. Only accessible to Factory-level members with 5,000+ Marks.', 0, 2, ARRAY['industrial-press','high-volume','factory-node'], 'Factory Guild', 'artesian', 5, '5000 Marks')
ON CONFLICT (id) DO NOTHING;

INSERT INTO hexisle_quests (title, description, reward_xp, quest_type, city_id, requirements, is_active) VALUES
('Build Your First Canister', 'Assemble the Canister System screw-press and produce your first injection-molded part.', 100, 'story', 'harbor-of-first-steps', '{"marks_required": 0}', true),
('Pass Quality Inspection', 'Submit 5 parts that pass the dimensional tolerance check at The Proving Grounds.', 200, 'daily', 'the-proving-grounds', '{"marks_required": 100, "parts_count": 5}', true),
('Assemble the SawtoothCoral', 'Build and test a working SawtoothCoral timing mechanism from raw hexagonal stock.', 350, 'guild', 'coral-reef-foundry', '{"marks_required": 250}', true),
('Design a GoldenLotus Crown', 'Create an original GoldenLotus aesthetic piece that passes the Design Guild review.', 500, 'guild', 'golden-lotus-atelier', '{"marks_required": 1000}', true),
('Machine a Planetary Gear Set', 'Produce a functioning planetary gear assembly with all components within 0.05mm tolerance.', 750, 'contract', 'gear-works-canyon', '{"marks_required": 1500}', true);
