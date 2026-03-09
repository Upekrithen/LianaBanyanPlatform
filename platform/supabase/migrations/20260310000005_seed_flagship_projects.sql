-- ================================================================
-- SEED FLAGSHIP PROJECTS — Coaster Medallion + Let's Make Dinner
-- ================================================================
-- Innovation #1549: Flagship Project Seeding (Session 8B)
--
-- Seeds two backable projects into the projects table with full
-- product + production level hierarchies. These are the first
-- projects visible on the platform for backing with Credits.
--
-- Dependencies: 20260310000001_project_pledges.sql (adds funding columns)
-- ================================================================

-- Use deterministic UUIDs so we can reference them across tables
-- and across environments without collision.

-- ─────────────────────────────────────────────────────────────────
-- PROJECT 1: COASTER MEDALLION (Brass Tacks #16)
-- ─────────────────────────────────────────────────────────────────

INSERT INTO public.projects (
  id, name, description, status,
  owner_id, user_id,
  funding_goal, tagline, category, medallion_eligible
) VALUES (
  'a1b2c3d4-e5f6-7890-abcd-100000000001',
  'Coaster Medallion',
  'Every project on the platform gets a physical medallion. When you back a project, support an initiative, or join a guild — you earn a Coaster Medallion for that connection. A hexagonal proof that you showed up and put skin in the game. QR code. Compliant mechanism counter. DaisyChainLinked to every project on the platform.',
  'active',
  NULL,  -- Owner claimed when Founder signs up
  NULL,
  5000,     -- 5,000 Credits goal (seed round for first SLA prototypes)
  'The physical proof of everything you back',
  'manufacturing',
  TRUE
) ON CONFLICT (id) DO NOTHING;

-- Product: The Medallion itself
INSERT INTO public.products (
  id, project_id, name, description, product_sku, base_price, status
) VALUES (
  'b1b2c3d4-e5f6-7890-abcd-200000000001',
  'a1b2c3d4-e5f6-7890-abcd-100000000001',
  'Coaster Medallion',
  'Hexagonal physical token with embedded QR code, compliant mechanism counter, project-specific design on face, and universal LB logo on reverse. Blockchain serial number. 60mm flat-to-flat.',
  'LB-BRASS-MEDALLION-001',
  50.00,
  'active'
) ON CONFLICT (id) DO NOTHING;

-- Production Levels (6 tiers matching daisyChainLink.ts)
INSERT INTO public.production_levels (id, product_id, level_number, level_name, units_count, unit_price, votes_needed, status) VALUES
  ('c1000001-0001-4000-a000-000000000001', 'b1b2c3d4-e5f6-7890-abcd-200000000001', 1, 'SLA Prototype',       10,      50.00,  10,    'active'),
  ('c1000001-0001-4000-a000-000000000002', 'b1b2c3d4-e5f6-7890-abcd-200000000001', 2, 'Small Batch',          100,     30.00,  50,    'active'),
  ('c1000001-0001-4000-a000-000000000003', 'b1b2c3d4-e5f6-7890-abcd-200000000001', 3, 'Medium Run',           1000,    20.00,  200,   'active'),
  ('c1000001-0001-4000-a000-000000000004', 'b1b2c3d4-e5f6-7890-abcd-200000000001', 4, 'Desktop Injection',    10000,   15.00,  500,   'active'),
  ('c1000001-0001-4000-a000-000000000005', 'b1b2c3d4-e5f6-7890-abcd-200000000001', 5, 'Factory Tooling',      100000,  12.00,  2000,  'active'),
  ('c1000001-0001-4000-a000-000000000006', 'b1b2c3d4-e5f6-7890-abcd-200000000001', 6, 'Mass Production',      1000000, 10.00,  10000, 'active')
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────
-- PROJECT 2: LET'S MAKE DINNER (Initiative #1)
-- ─────────────────────────────────────────────────────────────────

INSERT INTO public.projects (
  id, name, description, status,
  owner_id, user_id,
  funding_goal, tagline, category, medallion_eligible
) VALUES (
  'a1b2c3d4-e5f6-7890-abcd-100000000002',
  'Let''s Make Dinner',
  'A neighborhood meal network where home cooks, local chefs, and community kitchens feed families at fair prices. Dynamic pricing rewards planning: $5 preorder (48+ hours), $10 day-before, $15 rush. Chefs keep 83.3% of every transaction — locked forever in constitutional bylaws. DIY Grocery Boxes, Group Cook sessions, and chef-prepared meals delivered hot.',
  'active',
  NULL,  -- Owner claimed when Founder signs up
  NULL,
  10000,    -- 10,000 Credits goal (pilot funding for first neighborhood)
  'Neighbors feeding neighbors',
  'food',
  TRUE
) ON CONFLICT (id) DO NOTHING;

-- Product: Meal Subscription (backing the network)
INSERT INTO public.products (
  id, project_id, name, description, product_sku, base_price, status
) VALUES (
  'b1b2c3d4-e5f6-7890-abcd-200000000002',
  'a1b2c3d4-e5f6-7890-abcd-100000000002',
  'Neighborhood Pilot Sponsorship',
  'Back the first Let''s Make Dinner neighborhood pilot. Your Credits fund kitchen certifications, initial ingredient inventory, delivery logistics setup, and chef onboarding for the launch neighborhood. Each pilot serves 50-100 households.',
  'LB-LMD-PILOT-001',
  25.00,
  'active'
) ON CONFLICT (id) DO NOTHING;

-- Production Levels for LMD Pilot
INSERT INTO public.production_levels (id, product_id, level_number, level_name, units_count, unit_price, votes_needed, status) VALUES
  ('c1000002-0001-4000-a000-000000000001', 'b1b2c3d4-e5f6-7890-abcd-200000000002', 1, 'Seed Kitchen',        1,    500.00,   10,   'active'),
  ('c1000002-0001-4000-a000-000000000002', 'b1b2c3d4-e5f6-7890-abcd-200000000002', 2, 'Neighborhood Pilot',   5,    200.00,   50,   'active'),
  ('c1000002-0001-4000-a000-000000000003', 'b1b2c3d4-e5f6-7890-abcd-200000000002', 3, 'City District',        25,   100.00,   200,  'active'),
  ('c1000002-0001-4000-a000-000000000004', 'b1b2c3d4-e5f6-7890-abcd-200000000002', 4, 'Metro Network',        100,  50.00,    500,  'active'),
  ('c1000002-0001-4000-a000-000000000005', 'b1b2c3d4-e5f6-7890-abcd-200000000002', 5, 'Regional Hub',         500,  25.00,    2000, 'active'),
  ('c1000002-0001-4000-a000-000000000006', 'b1b2c3d4-e5f6-7890-abcd-200000000002', 6, 'National Platform',    5000, 10.00,    10000,'active')
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────
-- PRODUCT: MEDALLION variant for Let's Make Dinner
-- (separate physical medallion with LMD-specific design)
-- ─────────────────────────────────────────────────────────────────

INSERT INTO public.products (
  id, project_id, name, description, product_sku, base_price, status
) VALUES (
  'b1b2c3d4-e5f6-7890-abcd-200000000003',
  'a1b2c3d4-e5f6-7890-abcd-100000000002',
  'Medallion',
  'Let''s Make Dinner commemorative Coaster Medallion with chef''s hat design on face and universal LB reverse. DaisyChainLinked to the Coaster Medallion project.',
  'LB-LMD-MEDALLION-001',
  50.00,
  'active'
) ON CONFLICT (id) DO NOTHING;

-- Production levels for LMD Medallion (same tier structure as main medallion)
INSERT INTO public.production_levels (id, product_id, level_number, level_name, units_count, unit_price, votes_needed, status) VALUES
  ('c1000003-0001-4000-a000-000000000001', 'b1b2c3d4-e5f6-7890-abcd-200000000003', 1, 'SLA Prototype',    10,     50.00, 10,   'active'),
  ('c1000003-0001-4000-a000-000000000002', 'b1b2c3d4-e5f6-7890-abcd-200000000003', 2, 'Small Batch',       100,    30.00, 50,   'active'),
  ('c1000003-0001-4000-a000-000000000003', 'b1b2c3d4-e5f6-7890-abcd-200000000003', 3, 'Medium Run',        1000,   20.00, 200,  'active'),
  ('c1000003-0001-4000-a000-000000000004', 'b1b2c3d4-e5f6-7890-abcd-200000000003', 4, 'Desktop Injection',  10000,  15.00, 500,  'active'),
  ('c1000003-0001-4000-a000-000000000005', 'b1b2c3d4-e5f6-7890-abcd-200000000003', 5, 'Factory Tooling',    100000, 12.00, 2000, 'active'),
  ('c1000003-0001-4000-a000-000000000006', 'b1b2c3d4-e5f6-7890-abcd-200000000003', 6, 'Mass Production',    1000000,10.00, 10000,'active')
ON CONFLICT (id) DO NOTHING;
