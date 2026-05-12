-- BP038 v2 — Initiative Crowns: Stacy Mitchell lock + #15 Power-to-the-People Council expansion
-- Author: Knight (Cursor) — PROMPT_KNIGHT_B_INITIATIVE_CROWNS_DRIFT_RECONCILIATION_BP038 v2
-- Purpose: (1) Write Stacy Mitchell to #2 Let's Get Groceries (Founder BP038 direct)
--          (2) Expand #15 Power-to-the-People Council: 22 new candidate rows (orders 5–28)
--              + Dolly Parton (order 5) flagged as canon-intent (no Cephas letter on disk yet)
-- After this migration: 15/16 Initiatives have Crown rows. Only #6 (TRIBUTE-class) without.
-- Date: 2026-05-11

-- ===========================================================================
-- SECTION A1: #2 Let's Get Groceries ← Stacy Mitchell
-- Source: Founder direct BP038 — "Stacy Mitchell. Hands down."
-- Institute for Local Self-Reliance co-director; Big-Box Swindle author;
-- canonical movement leader for local-grocery-cooperative advocacy.
-- ===========================================================================
INSERT INTO public.initiative_crowns (initiative_id, crown_name, crown_title, crown_status, crown_order)
SELECT i.id, 'Stacy Mitchell', 'Crown', 'pending', 1
FROM public.initiatives i WHERE i.initiative_number = 2
ON CONFLICT (initiative_id, crown_name) DO UPDATE SET crown_status = EXCLUDED.crown_status;

-- ===========================================================================
-- SECTION B: #15 Power-to-the-People Council expansion (24 new rows, orders 5–28)
-- Tagline (BP028 canon): "Not Left. Not Right. Forward."
-- Mechanic: members ELECT the Council from this candidate slate.
-- Existing rows (orders 1–4): Schwarzenegger, Bullock, Reeves, AOC — untouched.
-- Letter source verified: Cephas Hugo disk bp028 frontmatter (recipient field).
-- ===========================================================================

-- B1: Dolly Parton — Crown (Cross-Coded Apex) | order 5
-- NOTE: No Cephas Hugo letter file on disk (no dolly-parton-power-to-the-people dir).
-- Canon intent confirmed via BP028 eblet S7. Flagged in LANDED receipt.
INSERT INTO public.initiative_crowns (initiative_id, crown_name, crown_title, crown_status, crown_order)
SELECT i.id, 'Dolly Parton', 'Crown (Cross-Coded Apex)', 'pending', 5
FROM public.initiatives i WHERE i.initiative_number = 15
ON CONFLICT (initiative_id, crown_name) DO UPDATE SET crown_status = EXCLUDED.crown_status, crown_title = EXCLUDED.crown_title;

-- B2: Robert De Niro — Crown (Explicit-Left Flag) | order 6
-- Verified: deniro-power-to-the-people/iterations/deniro_power_to_the_people_letsmakehistory_bp028.md recipient: Robert De Niro
INSERT INTO public.initiative_crowns (initiative_id, crown_name, crown_title, crown_status, crown_order)
SELECT i.id, 'Robert De Niro', 'Crown (Explicit-Left Flag)', 'pending', 6
FROM public.initiatives i WHERE i.initiative_number = 15
ON CONFLICT (initiative_id, crown_name) DO UPDATE SET crown_status = EXCLUDED.crown_status, crown_title = EXCLUDED.crown_title;

-- B3: Sylvester Stallone — Crown (Explicit-Right Flag) | order 7
-- Verified: stallone-power-to-the-people recipient: Sylvester Stallone
INSERT INTO public.initiative_crowns (initiative_id, crown_name, crown_title, crown_status, crown_order)
SELECT i.id, 'Sylvester Stallone', 'Crown (Explicit-Right Flag)', 'pending', 7
FROM public.initiatives i WHERE i.initiative_number = 15
ON CONFLICT (initiative_id, crown_name) DO UPDATE SET crown_status = EXCLUDED.crown_status, crown_title = EXCLUDED.crown_title;

-- B4: Aziz Ansari — Crown (Civic Voice) | order 8
-- Verified: ansari-power-to-the-people recipient: Aziz Ansari
INSERT INTO public.initiative_crowns (initiative_id, crown_name, crown_title, crown_status, crown_order)
SELECT i.id, 'Aziz Ansari', 'Crown (Civic Voice)', 'pending', 8
FROM public.initiatives i WHERE i.initiative_number = 15
ON CONFLICT (initiative_id, crown_name) DO UPDATE SET crown_status = EXCLUDED.crown_status, crown_title = EXCLUDED.crown_title;

-- B5: Seth Rogen — Crown (HELD per BP028 Option C) | order 9
-- HELD: political-balance Founder direction; awaiting member-vote signal + Founder ratification
-- Verified: rogen-power-to-the-people recipient: Seth Rogen
INSERT INTO public.initiative_crowns (initiative_id, crown_name, crown_title, crown_status, crown_order, notes)
SELECT i.id, 'Seth Rogen', 'Crown (HELD per BP028 Option C)', 'pending', 9,
  'HELD per BP028 Option C — political-balance Founder direction; awaiting member-vote signal + Founder ratification'
FROM public.initiatives i WHERE i.initiative_number = 15
ON CONFLICT (initiative_id, crown_name) DO UPDATE SET
  crown_status = EXCLUDED.crown_status,
  crown_title = EXCLUDED.crown_title,
  notes = EXCLUDED.notes;

-- B6: Keke Palmer — Crown (HELD per BP028 Option C) | order 10
-- HELD: political-balance Founder direction; awaiting member-vote signal + Founder ratification
-- Verified: palmer-power-to-the-people recipient: Keke Palmer
INSERT INTO public.initiative_crowns (initiative_id, crown_name, crown_title, crown_status, crown_order, notes)
SELECT i.id, 'Keke Palmer', 'Crown (HELD per BP028 Option C)', 'pending', 10,
  'HELD per BP028 Option C — political-balance Founder direction; awaiting member-vote signal + Founder ratification'
FROM public.initiatives i WHERE i.initiative_number = 15
ON CONFLICT (initiative_id, crown_name) DO UPDATE SET
  crown_status = EXCLUDED.crown_status,
  crown_title = EXCLUDED.crown_title,
  notes = EXCLUDED.notes;

-- B7: Matthew McConaughey — Crown (Civic Voice) | order 11
-- Verified: mcconaughey-power-to-the-people recipient: Matthew McConaughey
INSERT INTO public.initiative_crowns (initiative_id, crown_name, crown_title, crown_status, crown_order)
SELECT i.id, 'Matthew McConaughey', 'Crown (Civic Voice)', 'pending', 11
FROM public.initiatives i WHERE i.initiative_number = 15
ON CONFLICT (initiative_id, crown_name) DO UPDATE SET crown_status = EXCLUDED.crown_status, crown_title = EXCLUDED.crown_title;

-- B8: Mike Rowe — Crown (Civic Voice) | order 12
-- Verified: rowe-power-to-the-people recipient: Mike Rowe
INSERT INTO public.initiative_crowns (initiative_id, crown_name, crown_title, crown_status, crown_order)
SELECT i.id, 'Mike Rowe', 'Crown (Civic Voice)', 'pending', 12
FROM public.initiatives i WHERE i.initiative_number = 15
ON CONFLICT (initiative_id, crown_name) DO UPDATE SET crown_status = EXCLUDED.crown_status, crown_title = EXCLUDED.crown_title;

-- B9: Denzel Washington — Crown (Civic Voice) | order 13
-- Verified: washington-power-to-the-people recipient: Denzel Washington
INSERT INTO public.initiative_crowns (initiative_id, crown_name, crown_title, crown_status, crown_order)
SELECT i.id, 'Denzel Washington', 'Crown (Civic Voice)', 'pending', 13
FROM public.initiatives i WHERE i.initiative_number = 15
ON CONFLICT (initiative_id, crown_name) DO UPDATE SET crown_status = EXCLUDED.crown_status, crown_title = EXCLUDED.crown_title;

-- B10: Dwayne "The Rock" Johnson — Crown (Civic Voice) | order 14
-- Verified: johnson-power-to-the-people recipient: Dwayne Johnson
INSERT INTO public.initiative_crowns (initiative_id, crown_name, crown_title, crown_status, crown_order)
SELECT i.id, 'Dwayne "The Rock" Johnson', 'Crown (Civic Voice)', 'pending', 14
FROM public.initiatives i WHERE i.initiative_number = 15
ON CONFLICT (initiative_id, crown_name) DO UPDATE SET crown_status = EXCLUDED.crown_status, crown_title = EXCLUDED.crown_title;

-- B11: Sam Elliott — Crown (Civic Voice) | order 15
-- Verified: elliott-power-to-the-people recipient: Sam Elliott
INSERT INTO public.initiative_crowns (initiative_id, crown_name, crown_title, crown_status, crown_order)
SELECT i.id, 'Sam Elliott', 'Crown (Civic Voice)', 'pending', 15
FROM public.initiatives i WHERE i.initiative_number = 15
ON CONFLICT (initiative_id, crown_name) DO UPDATE SET crown_status = EXCLUDED.crown_status, crown_title = EXCLUDED.crown_title;

-- B12: Gary Sinise — Crown (Civic Voice) | order 16
-- Verified: sinise-power-to-the-people recipient: Gary Sinise
INSERT INTO public.initiative_crowns (initiative_id, crown_name, crown_title, crown_status, crown_order)
SELECT i.id, 'Gary Sinise', 'Crown (Civic Voice)', 'pending', 16
FROM public.initiatives i WHERE i.initiative_number = 15
ON CONFLICT (initiative_id, crown_name) DO UPDATE SET crown_status = EXCLUDED.crown_status, crown_title = EXCLUDED.crown_title;

-- B13: Tom Hanks — Crown (Civic Voice) | order 17
-- Verified: hanks-power-to-the-people recipient: Tom Hanks
INSERT INTO public.initiative_crowns (initiative_id, crown_name, crown_title, crown_status, crown_order)
SELECT i.id, 'Tom Hanks', 'Crown (Civic Voice)', 'pending', 17
FROM public.initiatives i WHERE i.initiative_number = 15
ON CONFLICT (initiative_id, crown_name) DO UPDATE SET crown_status = EXCLUDED.crown_status, crown_title = EXCLUDED.crown_title;

-- B14: Rita Wilson — Crown (Civic Voice) | order 18
-- DISAMBIGUATION RESOLVED: wilson slug = Rita Wilson (Actress/Singer-Songwriter/Cancer-Disclosure Advocate)
-- Verified: wilson-power-to-the-people recipient: Rita Wilson (paired_with: Hanks-spousal-companion)
-- NOT Owen Wilson / NOT Luke Wilson
INSERT INTO public.initiative_crowns (initiative_id, crown_name, crown_title, crown_status, crown_order, notes)
SELECT i.id, 'Rita Wilson', 'Crown (Civic Voice)', 'pending', 18,
  'Disambiguation: wilson slug = Rita Wilson (NOT Owen/Luke); paired with Tom Hanks (BP028 spousal-companion cohort)'
FROM public.initiatives i WHERE i.initiative_number = 15
ON CONFLICT (initiative_id, crown_name) DO UPDATE SET
  crown_status = EXCLUDED.crown_status,
  crown_title = EXCLUDED.crown_title,
  notes = EXCLUDED.notes;

-- B15: Anne Hathaway — Crown (Civic Voice) | order 19
-- Verified: hathaway-power-to-the-people recipient: Anne Hathaway
INSERT INTO public.initiative_crowns (initiative_id, crown_name, crown_title, crown_status, crown_order)
SELECT i.id, 'Anne Hathaway', 'Crown (Civic Voice)', 'pending', 19
FROM public.initiatives i WHERE i.initiative_number = 15
ON CONFLICT (initiative_id, crown_name) DO UPDATE SET crown_status = EXCLUDED.crown_status, crown_title = EXCLUDED.crown_title;

-- B16: Morgan Freeman — Crown (Civic Voice) | order 20
-- Verified: freeman-power-to-the-people recipient: Morgan Freeman
INSERT INTO public.initiative_crowns (initiative_id, crown_name, crown_title, crown_status, crown_order)
SELECT i.id, 'Morgan Freeman', 'Crown (Civic Voice)', 'pending', 20
FROM public.initiatives i WHERE i.initiative_number = 15
ON CONFLICT (initiative_id, crown_name) DO UPDATE SET crown_status = EXCLUDED.crown_status, crown_title = EXCLUDED.crown_title;

-- B17: Jamie Lee Curtis — Crown (Civic Voice) | order 21
-- Verified: curtis-power-to-the-people recipient: JamieLeeCurtis (frontmatter typo — no space; canonical = Jamie Lee Curtis)
INSERT INTO public.initiative_crowns (initiative_id, crown_name, crown_title, crown_status, crown_order)
SELECT i.id, 'Jamie Lee Curtis', 'Crown (Civic Voice)', 'pending', 21
FROM public.initiatives i WHERE i.initiative_number = 15
ON CONFLICT (initiative_id, crown_name) DO UPDATE SET crown_status = EXCLUDED.crown_status, crown_title = EXCLUDED.crown_title;

-- B18: Julia Roberts — Crown (Civic Voice) | order 22
-- Verified: roberts-power-to-the-people recipient: Julia Roberts
INSERT INTO public.initiative_crowns (initiative_id, crown_name, crown_title, crown_status, crown_order)
SELECT i.id, 'Julia Roberts', 'Crown (Civic Voice)', 'pending', 22
FROM public.initiatives i WHERE i.initiative_number = 15
ON CONFLICT (initiative_id, crown_name) DO UPDATE SET crown_status = EXCLUDED.crown_status, crown_title = EXCLUDED.crown_title;

-- B19: Jennifer Aniston — Crown (Civic Voice) | order 23
-- Verified: aniston-power-to-the-people recipient: Jennifer Aniston
INSERT INTO public.initiative_crowns (initiative_id, crown_name, crown_title, crown_status, crown_order)
SELECT i.id, 'Jennifer Aniston', 'Crown (Civic Voice)', 'pending', 23
FROM public.initiatives i WHERE i.initiative_number = 15
ON CONFLICT (initiative_id, crown_name) DO UPDATE SET crown_status = EXCLUDED.crown_status, crown_title = EXCLUDED.crown_title;

-- B20: Woody Harrelson — Crown (Civic Voice) | order 24
-- Verified: harrelson-power-to-the-people recipient: Woody Harrelson
INSERT INTO public.initiative_crowns (initiative_id, crown_name, crown_title, crown_status, crown_order)
SELECT i.id, 'Woody Harrelson', 'Crown (Civic Voice)', 'pending', 24
FROM public.initiatives i WHERE i.initiative_number = 15
ON CONFLICT (initiative_id, crown_name) DO UPDATE SET crown_status = EXCLUDED.crown_status, crown_title = EXCLUDED.crown_title;

-- B21: Claire Danes — Crown (Civic Voice) | order 25
-- Verified: danes-power-to-the-people recipient: Claire Danes
INSERT INTO public.initiative_crowns (initiative_id, crown_name, crown_title, crown_status, crown_order)
SELECT i.id, 'Claire Danes', 'Crown (Civic Voice)', 'pending', 25
FROM public.initiatives i WHERE i.initiative_number = 15
ON CONFLICT (initiative_id, crown_name) DO UPDATE SET crown_status = EXCLUDED.crown_status, crown_title = EXCLUDED.crown_title;

-- B22: Kurt Russell — Crown (Civic Voice) | order 26
-- Verified: russell-power-to-the-people recipient: KurtRussell (frontmatter typo — no space; canonical = Kurt Russell)
INSERT INTO public.initiative_crowns (initiative_id, crown_name, crown_title, crown_status, crown_order)
SELECT i.id, 'Kurt Russell', 'Crown (Civic Voice)', 'pending', 26
FROM public.initiatives i WHERE i.initiative_number = 15
ON CONFLICT (initiative_id, crown_name) DO UPDATE SET crown_status = EXCLUDED.crown_status, crown_title = EXCLUDED.crown_title;

-- B23: Michelle Pfeiffer — Crown (Civic Voice) | order 27
-- Verified: pfeiffer-power-to-the-people recipient: Michelle Pfeiffer
INSERT INTO public.initiative_crowns (initiative_id, crown_name, crown_title, crown_status, crown_order)
SELECT i.id, 'Michelle Pfeiffer', 'Crown (Civic Voice)', 'pending', 27
FROM public.initiatives i WHERE i.initiative_number = 15
ON CONFLICT (initiative_id, crown_name) DO UPDATE SET crown_status = EXCLUDED.crown_status, crown_title = EXCLUDED.crown_title;

-- B24: Henry Cavill — Crown (Civic Voice) | order 28
-- Verified: cavill-power-to-the-people recipient: Henry Cavill
INSERT INTO public.initiative_crowns (initiative_id, crown_name, crown_title, crown_status, crown_order)
SELECT i.id, 'Henry Cavill', 'Crown (Civic Voice)', 'pending', 28
FROM public.initiatives i WHERE i.initiative_number = 15
ON CONFLICT (initiative_id, crown_name) DO UPDATE SET crown_status = EXCLUDED.crown_status, crown_title = EXCLUDED.crown_title;
