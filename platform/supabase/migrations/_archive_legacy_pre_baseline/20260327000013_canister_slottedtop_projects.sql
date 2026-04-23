-- B036: Canister System + SlottedTop Production Projects
-- Two separate projects launching together with Kickstarter Campaign 1
-- Canister: 5,000 units target | SlottedTop: 15,000 units target

-- ═══════════════════════════════════════════
-- PROJECT 1: HexIsle SlottedTop (Kickstarter Campaign 1)
-- ═══════════════════════════════════════════
INSERT INTO projects (id, name, description) VALUES (
  'a1b2c3d4-0001-4000-8000-000000000001',
  'HexIsle SlottedTop — Universal Hex Terrain Adapter',
  'Campaign 1 of 13. The universal hex terrain adapter that works with Catan, BattleTech, and any hex game. Snap it in, play on. 15,000 units target. Back more, earn more — don''t break the chain.'
) ;

INSERT INTO products (id, project_id, name, description) VALUES (
  'b2c3d4e5-0001-4000-8000-000000000001',
  'a1b2c3d4-0001-4000-8000-000000000001',
  'SlottedTop Hex Adapter',
  'Universal hex terrain adapter — works with any hex-based game system. PP injection molded, ~60mm hex, ~8-12mm thick. Paintable, durable, lightweight. Ships flat for minimal postage.'
) ;

-- 6 Production Levels for SlottedTop (scaling from prototype to mass)
INSERT INTO production_levels (id, product_id, level_number, level_name, units_count, unit_price) VALUES
  ('c3d4e5f6-0001-4000-8000-000000000001', 'b2c3d4e5-0001-4000-8000-000000000001', 1, 'Prototype Run', 100, 15.00),
  ('c3d4e5f6-0002-4000-8000-000000000001', 'b2c3d4e5-0001-4000-8000-000000000001', 2, 'Early Adopter', 500, 15.00),
  ('c3d4e5f6-0003-4000-8000-000000000001', 'b2c3d4e5-0001-4000-8000-000000000001', 3, 'First Batch', 1000, 12.00),
  ('c3d4e5f6-0004-4000-8000-000000000001', 'b2c3d4e5-0001-4000-8000-000000000001', 4, 'Community Scale', 5000, 10.00),
  ('c3d4e5f6-0005-4000-8000-000000000001', 'b2c3d4e5-0001-4000-8000-000000000001', 5, 'Factory Run', 10000, 8.00),
  ('c3d4e5f6-0006-4000-8000-000000000001', 'b2c3d4e5-0001-4000-8000-000000000001', 6, 'Full Production', 15000, 6.00)
;

-- ═══════════════════════════════════════════
-- PROJECT 2: Canister System (Bounty-Funded Manufacturing)
-- ═══════════════════════════════════════════
INSERT INTO projects (id, name, description) VALUES (
  'a1b2c3d4-0002-4000-8000-000000000001',
  'Canister System — Modular Injection Molding Kit',
  'The world''s first modular stackable injection molding system. 3D-printed molds at 90-98% less than machined aluminum. S piston screw press achieves 5,207 PSI — matching the Morgan Press at 1/4 the cost. 5,000 kits target. Built entirely through bounty-recruited makers. DO THE WORK = GET THE STATUS.'
) ;

-- Two products: Gravity Kit and Thermoplastic Kit
INSERT INTO products (id, project_id, name, description) VALUES
  ('b2c3d4e5-0002-4000-8000-000000000001',
   'a1b2c3d4-0002-4000-8000-000000000001',
   'Gravity Starter Kit (M/L)',
   'Resin, wax, slip, silicone casting. Includes: 2 sleeves (M+L), base vessel, cap, piston + weights, 2 sprue plugs, 4 A/B canister pairs. Everything you need to start casting.'),
  ('b2c3d4e5-0003-4000-8000-000000000001',
   'a1b2c3d4-0002-4000-8000-000000000001',
   'Thermoplastic Kit (S + Screw Press)',
   'PE, PP, ABS injection. Includes: S sleeve, heated base vessel, 8" ACME screw press, PID controller + thermocouple, cap, 2 sprue plugs, 4 S A/B canister pairs. Achieves 5,207 PSI.')
;

-- 6 Production Levels for Gravity Kit
INSERT INTO production_levels (id, product_id, level_number, level_name, units_count, unit_price) VALUES
  ('c3d4e5f6-0001-4000-8000-000000000002', 'b2c3d4e5-0002-4000-8000-000000000001', 1, 'Prototype Run', 50, 249.00),
  ('c3d4e5f6-0002-4000-8000-000000000002', 'b2c3d4e5-0002-4000-8000-000000000001', 2, 'Early Adopter', 200, 219.00),
  ('c3d4e5f6-0003-4000-8000-000000000002', 'b2c3d4e5-0002-4000-8000-000000000001', 3, 'First Batch', 500, 199.00),
  ('c3d4e5f6-0004-4000-8000-000000000002', 'b2c3d4e5-0002-4000-8000-000000000001', 4, 'Community Scale', 1000, 179.00),
  ('c3d4e5f6-0005-4000-8000-000000000002', 'b2c3d4e5-0002-4000-8000-000000000001', 5, 'Factory Run', 2500, 159.00),
  ('c3d4e5f6-0006-4000-8000-000000000002', 'b2c3d4e5-0002-4000-8000-000000000001', 6, 'Full Production', 5000, 149.00)
;

-- 6 Production Levels for Thermoplastic Kit
INSERT INTO production_levels (id, product_id, level_number, level_name, units_count, unit_price) VALUES
  ('c3d4e5f6-0001-4000-8000-000000000003', 'b2c3d4e5-0003-4000-8000-000000000001', 1, 'Prototype Run', 50, 329.00),
  ('c3d4e5f6-0002-4000-8000-000000000003', 'b2c3d4e5-0003-4000-8000-000000000001', 2, 'Early Adopter', 200, 299.00),
  ('c3d4e5f6-0003-4000-8000-000000000003', 'b2c3d4e5-0003-4000-8000-000000000001', 3, 'First Batch', 500, 279.00),
  ('c3d4e5f6-0004-4000-8000-000000000003', 'b2c3d4e5-0003-4000-8000-000000000001', 4, 'Community Scale', 1000, 259.00),
  ('c3d4e5f6-0005-4000-8000-000000000003', 'b2c3d4e5-0003-4000-8000-000000000001', 5, 'Factory Run', 2500, 239.00),
  ('c3d4e5f6-0006-4000-8000-000000000003', 'b2c3d4e5-0003-4000-8000-000000000001', 6, 'Full Production', 5000, 219.00)
;

-- ═══════════════════════════════════════════
-- CREW CALL BOUNTIES for Canister System Manufacturing
-- ═══════════════════════════════════════════
INSERT INTO bounties (title, description, category, priority, difficulty, reward_marks, status) VALUES
  ('Canister System CAD — S Sleeve Final Dimensions',
   'Finalize CAD drawings for the S (Small) canister sleeve in Fusion 360 or FreeCAD. Must include: inner diameter 38mm, outer diameter 50mm, hex-key twist-lock geometry (3 bars, 3 grooves at 60 intervals), sleeve wall thickness for 5,200 PSI containment. Export as STEP and STL.',
   'manufacturing', 'high', 'advanced', 200, 'open'),
  ('Canister System CAD — M/L Sleeve Dimensions',
   'Finalize CAD for Medium (63mm ID, 76mm OD) and Large (100mm ID, 114mm OD) canister sleeves. Same hex-key geometry as S, scaled proportionally. Gravity-mode only.',
   'manufacturing', 'high', 'advanced', 150, 'open'),
  ('Canister System CAD — Screw Press Assembly',
   'Design the S-piston screw press assembly: 1/2 inch ACME thread (10 TPI), 8 inch removable handle, 2.0 inch OD steel piston with PTFE seal ring, bayonet mount to S base.',
   'manufacturing', 'high', 'expert', 300, 'open'),
  ('Canister System CAD — Heated Barrel Module',
   'Design the heated barrel option for S base: silicone heating band mounting, thermocouple port, PID controller bracket, insulating sleeve. Target 180-260C range. 120V/200W.',
   'manufacturing', 'high', 'advanced', 250, 'open'),
  ('3D Print Validation — S Canister Twist-Lock Fit Test',
   'Print 5 S-size A/B canister pairs in SLA resin. Test twist-lock engagement: should lock with 60 degree rotation, hold under 50 PSI, release cleanly. Document tolerances. Photos required.',
   'manufacturing', 'medium', 'intermediate', 75, 'open'),
  ('3D Print Validation — Sprue Chain Seal Test',
   'Print sprue plugs and test material flow through a 2-canister stack. Use casting wax or low-viscosity resin. Document: seal quality, flow rate, any leakage points. Photos + video required.',
   'manufacturing', 'medium', 'intermediate', 100, 'open'),
  ('Materials Sourcing — ACME Screw + Handle',
   'Find 3+ suppliers for 1/2 inch ACME thread screws (10 TPI, 6 inch length, hardened steel) with pricing at 100/500/5000 qty. Also source 8 inch handle options. Domestic USA preferred.',
   'manufacturing', 'high', 'beginner', 100, 'open'),
  ('Materials Sourcing — Heating Band + PID Controller',
   'Find 3+ suppliers for silicone heating bands (fits 50mm OD cylinder, 200W 120V) and PID controllers with thermocouple. Bulk pricing at 100/1000/5000. Include Inkbird and alternatives.',
   'manufacturing', 'high', 'beginner', 100, 'open'),
  ('QA Protocol — Canister System Pressure Test Procedure',
   'Write a complete pressure test procedure for the S canister + screw press. Include: test setup, safety requirements, pass/fail criteria at 1000/3000/5000 PSI, documentation template.',
   'manufacturing', 'high', 'advanced', 150, 'open'),
  ('Assembly Instructions — Canister Gravity Starter Kit',
   'Write step-by-step assembly and first-use instructions for the Gravity Starter Kit. Include: unboxing, component identification, first assembly, first cast (epoxy resin), troubleshooting.',
   'manufacturing', 'medium', 'intermediate', 125, 'open'),
  ('Packaging Design — Canister System Kit Box',
   'Design packaging for the Canister System kits. Must fit all components, include instruction card, LB branding, and be shippable via USPS Priority Mail. Flat-rate box optimization preferred.',
   'design', 'medium', 'intermediate', 100, 'open'),
  ('SlottedTop CAD — Final Production Dimensions',
   'Finalize the SlottedTop hex terrain adapter CAD for injection molding. 60mm hex, 8-12mm thick, snap-fit slot geometry. Must include draft angles for mold release. Export as STEP.',
   'manufacturing', 'high', 'advanced', 175, 'open')
;

-- ═══════════════════════════════════════════
-- Leadership Pedestals for both projects
-- ═══════════════════════════════════════════
INSERT INTO leadership_pedestals (id, seat_title, seat_type, initiative, invited_name, invited_description, status, tier, circle) VALUES
  (gen_random_uuid(), 'Captain — HexIsle SlottedTop', 'captain_regional', 'HexIsle SlottedTop Campaign',
   'Open Seat', 'Lead the SlottedTop Kickstarter campaign. First Captain of the HexIsle product line. Requires: passion for tabletop gaming + willingness to put skin in the game.',
   'open', 'spear', 'initiative_leaders'),
  (gen_random_uuid(), 'Captain — Canister System Manufacturing', 'captain_regional', 'Canister System Production',
   'Open Seat', 'Lead the Canister System bounty-funded manufacturing project. Coordinate CAD designers, 3D printers, materials sourcers, and assembly teams. DO THE WORK = GET THE STATUS.',
   'open', 'spear', 'initiative_leaders')
;

-- Update canonical stats
UPDATE platform_canonical SET value = '2071' WHERE key = 'innovation_count';
UPDATE platform_canonical SET value = '141' WHERE key = 'crown_jewels';
