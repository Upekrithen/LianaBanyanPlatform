-- ============================================================================
-- Migration: 20260330000019_seed_creators_and_red_carpet.sql
-- Bishop 050: Seed all Instagram creators into creator_draft_picks
--             + expand Red Carpet for all outbound recipients
-- ============================================================================

-- =====================
-- PART A: Seed Instagram creators from productionRunDraft.ts Factor-y Collection
-- Uses first available user as recruiter (same pattern as K43 seed migration)
-- =====================
DO $$
DECLARE seed_uid uuid;
BEGIN
  SELECT id INTO seed_uid FROM auth.users LIMIT 1;
  IF seed_uid IS NULL THEN RETURN; END IF;

  INSERT INTO creator_draft_picks
    (recruiter_user_id, creator_name, creator_handle, platform, specialty, status)
  VALUES
    -- TIER 1: HIGH-VALUE
    (seed_uid, 'ForgeCore Co',          '@forgecoreco',        'instagram', 'Plant accessories, coasters, sports toys',  'undrafted'),
    (seed_uid, 'Lofted Goods',          '@loftedgoods',        'instagram', 'Wall-mount planters with drip jars',        'undrafted'),
    (seed_uid, 'Gazzaladra Design',     '@gazzaladradesign',   'instagram', '3D printed notebooks, home products',       'undrafted'),
    (seed_uid, 'CraftyKid3D',           '@craftykid3d',        'instagram', 'Dragon book nooks',                         'undrafted'),
    (seed_uid, 'Hammerly Ceramics',     '@hammerlyceramics',   'instagram', 'Slip cast ceramics, lamps, mugs',           'undrafted'),
    (seed_uid, 'Armas 4AM',             '@armas.4am',          'instagram', 'Robotics, cycloidal gearboxes',             'undrafted'),
    (seed_uid, 'Curv Lab',              '@curv.lab',           'instagram', '3D printable RC car chassis',               'undrafted'),
    (seed_uid, 'Play Conveyor',         '@playconveyor',       'instagram', 'Modular storage containers',                'undrafted'),
    (seed_uid, 'Concept Bytes',         '@concept_bytes',      'instagram', 'Smart chess board, engineering',             'undrafted'),
    (seed_uid, 'Krys Plants',           '@krysplants',         'instagram', 'Novelty plant accessories',                 'undrafted'),
    (seed_uid, 'Pyahik',                '@pyahik',             'instagram', 'Resin keychains, small business',           'undrafted'),
    (seed_uid, 'Dinara Kasko',          '@dinarakasko',        'instagram', 'Silicone mold cake design',                 'undrafted'),
    (seed_uid, 'NioToys',               '@niotoys1',           'instagram', 'Mechanical toys',                           'undrafted'),
    (seed_uid, 'Print Sculptors',       '@printsculptors',     'instagram', 'Fidget toys, clickers',                     'undrafted'),
    -- TIER 2: MID-VALUE
    (seed_uid, 'Yird Ceramics',         '@yird_ceramics',      'instagram', 'Slip cast cups with plaster molds',         'undrafted'),
    (seed_uid, 'Turn Studio',           '@turn.studio',        'instagram', 'Full slip casting pipeline',                'undrafted'),
    (seed_uid, 'BlobLab 3D',            '@bloblab3d',          'instagram', 'Character design (Blob Beetles)',           'undrafted'),
    (seed_uid, 'Elle Studio',           '@elle.stvdio',        'instagram', 'Beehive designs, flying butterflies',       'undrafted'),
    (seed_uid, 'KrakDrag 3D',           '@krakdrag3d',         'instagram', 'Cyber Cat headphone holder',                'undrafted'),
    (seed_uid, 'Elden Designs',         '@elden_designs',      'instagram', '3D printed lamp designs',                   'undrafted'),
    -- TIER 3: EMERGING + HEXISLE
    (seed_uid, 'FuseFox Design',        '@fusefoxdesign',      'instagram', 'Magnetic spring mechanisms',                'undrafted'),
    (seed_uid, 'Tabletop Stamps',       '@tabletopstamps',     'instagram', 'Modular dungeon stamps for D&D',            'undrafted'),
    (seed_uid, 'The Upgrade Factory',   '@theupgradefactory',  'instagram', 'Tabletop terrain (BattleTech/D&D)',         'undrafted'),
    (seed_uid, 'Abyssal Cactus',        '@abyssalcactus',      'instagram', 'Print-in-place hinge design',               'undrafted'),
    (seed_uid, 'EMGI 3D',               '@emgi3d',             'instagram', 'Mechanism design',                          'undrafted'),
    (seed_uid, 'Greg Dean Mann',        '@greg.dean.mann',     'instagram', 'Lamp design',                               'undrafted'),
    (seed_uid, 'Moritz Walter',         '@moritz__walter',     'instagram', 'Tool design',                               'undrafted'),
    (seed_uid, 'Cartyski',              '@cartyski',           'instagram', 'Spring-loaded mechanisms',                  'undrafted')
  ON CONFLICT DO NOTHING;
END $$;


-- =====================
-- PART B: Add invite_code column to red_carpet_recipients (if not exists)
-- =====================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'red_carpet_recipients'
      AND column_name = 'invite_code'
  ) THEN
    ALTER TABLE red_carpet_recipients ADD COLUMN invite_code TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'red_carpet_recipients'
      AND column_name = 'walkthrough_type'
  ) THEN
    ALTER TABLE red_carpet_recipients ADD COLUMN walkthrough_type TEXT
      DEFAULT 'crown'
      CHECK (walkthrough_type IN ('crown','academic','media','blessing','sponsor','political','patron','outreach','creator'));
  END IF;
END $$;


-- =====================
-- PART C: Seed Red Carpet entries for ALL outbound recipients
-- Uses ON CONFLICT on recipient_name (unique-ish — we filter with NOT EXISTS)
-- =====================

-- Crown letter recipients (not already seeded in migration 0001)
INSERT INTO red_carpet_recipients (email_domain, recipient_name, role_offered, initiative, wave, walkthrough_type, invite_code, personalized_greeting, walkthrough_sections)
SELECT * FROM (VALUES
  -- Maneet Chauhan already seeded above in 0001, skip
  ('laughtonassociates.com', 'Mary Beth Laughton', 'Commerce Chancellor', 'Commerce Engine', 1, 'crown',
   substr(md5(random()::text), 1, 6),
   'Ms. Laughton, welcome. The commerce engine was built for this conversation.',
   '["economics","initiative_spotlight","governance","founder"]'::jsonb),

  ('ncba.coop', 'Cathie Mahon', 'Cooperative Chancellor', 'Cooperative Governance', 1, 'crown',
   substr(md5(random()::text), 1, 6),
   'Ms. Mahon, welcome. Real cooperative architecture — not just the branding.',
   '["governance","economics","all_initiatives","founder"]'::jsonb),

  ('taylornation.com', 'Taylor Swift', 'Cultural Ambassador', 'Opening Gambit', 1, 'crown',
   substr(md5(random()::text), 1, 6),
   'Ms. Swift, welcome. The math favors creators. Here is the proof.',
   '["economics","creator_showcase","governance","founder"]'::jsonb),

  ('nnedv.org', 'Ruth Glenn', 'Shield Knight', 'Defense Initiative', 1, 'crown',
   substr(md5(random()::text), 1, 6),
   'Ms. Glenn, welcome. The Klaus Initiative was built to protect.',
   '["initiative_spotlight","economics","governance","founder"]'::jsonb),

  ('costplusdrugs.com', 'Alex Oshmyansky', 'Health Chancellor', 'Cost Plus Model', 1, 'crown',
   substr(md5(random()::text), 1, 6),
   'Dr. Oshmyansky, welcome. Cost+20%. Sound familiar?',
   '["economics","initiative_spotlight","patent_portfolio","founder"]'::jsonb),

  ('joseandresthinkfoodfoundation.org', 'Jose Andres', 'Food Chancellor', 'Let''s Make Dinner', 1, 'crown',
   substr(md5(random()::text), 1, 6),
   'Chef Andres, welcome. Feeding people is the mission.',
   '["initiative_spotlight","economics","governance","founder"]'::jsonb),

  ('jessicajackley.com', 'Jessica Jackley', 'Microfinance Advisor', 'Cooperative Finance', 1, 'crown',
   substr(md5(random()::text), 1, 6),
   'Ms. Jackley, welcome. Kiva proved it works. We built the next layer.',
   '["economics","governance","initiative_spotlight","founder"]'::jsonb),

  ('kaiserpartnership.com', 'Robert Kaiser', 'Shield Knight UK', 'International Expansion', 1, 'crown',
   substr(md5(random()::text), 1, 6),
   'Mr. Kaiser, welcome. The UK chapter starts with you.',
   '["economics","governance","all_initiatives","founder"]'::jsonb),

  ('konmari.com', 'Marie Kondo', 'Lifestyle Ambassador', 'Community Organizing', 1, 'crown',
   substr(md5(random()::text), 1, 6),
   'Ms. Kondo, welcome. Sparking joy — at cooperative scale.',
   '["initiative_spotlight","economics","founder"]'::jsonb),

  ('ellevest.com', 'Sallie Krawcheck', 'Finance Advisor', 'Financial Architecture', 1, 'crown',
   substr(md5(random()::text), 1, 6),
   'Ms. Krawcheck, welcome. The financial architecture is transparent by design.',
   '["economics","governance","patent_portfolio","founder"]'::jsonb),

  ('brenebrown.com', 'Brene Brown', 'Culture Advisor', 'Community Culture', 1, 'crown',
   substr(md5(random()::text), 1, 6),
   'Dr. Brown, welcome. Vulnerability is built into the governance.',
   '["governance","economics","initiative_spotlight","founder"]'::jsonb),

  ('yunuscenter.org', 'Muhammad Yunus', 'Microfinance Chancellor', 'Social Business', 1, 'crown',
   substr(md5(random()::text), 1, 6),
   'Professor Yunus, welcome. Social business — implemented at platform scale.',
   '["economics","governance","all_initiatives","academic_papers","founder"]'::jsonb),

  ('encore.org', 'Marc Freedman', 'Encore Advisor', 'Intergenerational Programs', 1, 'crown',
   substr(md5(random()::text), 1, 6),
   'Mr. Freedman, welcome. Purpose doesn''t retire.',
   '["initiative_spotlight","economics","governance","founder"]'::jsonb),

  ('ashtonapplewhite.com', 'Ashton Applewhite', 'Anti-Ageism Ambassador', 'Inclusive Design', 1, 'crown',
   substr(md5(random()::text), 1, 6),
   'Ms. Applewhite, welcome. No age gates. No generational silos.',
   '["governance","economics","initiative_spotlight","founder"]'::jsonb),

  ('ciaosamin.com', 'Samin Nosrat', 'Food Ambassador', 'Let''s Make Dinner', 1, 'crown',
   substr(md5(random()::text), 1, 6),
   'Samin, welcome. Salt, fat, acid, heat — and cooperative economics.',
   '["initiative_spotlight","economics","founder"]'::jsonb),

  ('opportunitythreads.com', 'Molly Hemstreet', 'Manufacturing Chancellor', 'Let''s Make Bread', 1, 'crown',
   substr(md5(random()::text), 1, 6),
   'Ms. Hemstreet, welcome. Worker-owned manufacturing — built into the platform.',
   '["initiative_spotlight","economics","governance","founder"]'::jsonb),

  ('pucp.edu.pe', 'MariaElena Huambachano', 'Indigenous Knowledge Advisor', 'Cultural Preservation', 1, 'crown',
   substr(md5(random()::text), 1, 6),
   'Dr. Huambachano, welcome. Indigenous knowledge systems, protected by design.',
   '["governance","initiative_spotlight","academic_papers","founder"]'::jsonb),

  ('thefamilydinnerproject.org', 'Anne Fishel', 'Family Dinner Advisor', 'Let''s Make Dinner', 1, 'crown',
   substr(md5(random()::text), 1, 6),
   'Dr. Fishel, welcome. The family dinner table — scaled to neighborhoods.',
   '["initiative_spotlight","economics","founder"]'::jsonb),

  ('reshorenow.org', 'Harry Moser', 'Reshoring Chancellor', 'Let''s Make Bread', 1, 'crown',
   substr(md5(random()::text), 1, 6),
   'Mr. Moser, welcome. Reshoring meets cooperative manufacturing.',
   '["initiative_spotlight","economics","patent_portfolio","founder"]'::jsonb),

  ('ncif.org', 'Karla Hanson', 'CDFI Advisor', 'Cooperative Finance', 1, 'crown',
   substr(md5(random()::text), 1, 6),
   'Ms. Hanson, welcome. Community finance infrastructure, built to last.',
   '["economics","governance","initiative_spotlight","founder"]'::jsonb),

  ('sweetgreen.com', 'Adria Powell', 'Food Ops Advisor', 'Let''s Make Dinner', 1, 'crown',
   substr(md5(random()::text), 1, 6),
   'Ms. Powell, welcome. Scaling food operations — cooperatively.',
   '["initiative_spotlight","economics","founder"]'::jsonb),

  ('kimberlywilliams.com', 'Kimberly Williams', 'Rally Group Leader', 'Rally Group', 1, 'crown',
   substr(md5(random()::text), 1, 6),
   'Ms. Williams, welcome. The rally starts here.',
   '["initiative_spotlight","economics","governance","founder"]'::jsonb)
) AS v(email_domain, recipient_name, role_offered, initiative, wave, walkthrough_type, invite_code, personalized_greeting, walkthrough_sections)
WHERE NOT EXISTS (
  SELECT 1 FROM red_carpet_recipients r WHERE r.recipient_name = v.recipient_name
);


-- Outreach recipients
INSERT INTO red_carpet_recipients (email_domain, recipient_name, role_offered, initiative, wave, walkthrough_type, invite_code, personalized_greeting, walkthrough_sections)
SELECT * FROM (VALUES
  ('gatesfoundation.org', 'Melinda French Gates', 'Strategic Partner', 'Philanthropic Alliance', 2, 'outreach',
   substr(md5(random()::text), 1, 6),
   'Ms. French Gates, welcome. Pivotal Ventures meets cooperative economics.',
   '["economics","governance","all_initiatives","founder"]'::jsonb),

  ('oaktreecapital.com', 'Howard Marks', 'Financial Advisor', 'Risk Architecture', 2, 'outreach',
   substr(md5(random()::text), 1, 6),
   'Mr. Marks, welcome. The second-level thinking is in the architecture.',
   '["economics","patent_portfolio","governance","founder"]'::jsonb),

  ('li-jin.com', 'Li Jin', 'Creator Economy Advisor', 'Creator Economics', 2, 'outreach',
   substr(md5(random()::text), 1, 6),
   'Li, welcome. 83.3% creator retention. The passion economy — realized.',
   '["economics","creator_showcase","governance","founder"]'::jsonb),

  ('anand.ly', 'Anand Giridharadas', 'Press Coverage', 'Economic Justice', 4, 'outreach',
   substr(md5(random()::text), 1, 6),
   'Anand, welcome. Winners take all — unless you rewrite the rules.',
   '["economics","governance","press_kit","founder"]'::jsonb),

  ('kateraworth.com', 'Kate Raworth', 'Academic Advisor', 'Doughnut Economics', 3, 'outreach',
   substr(md5(random()::text), 1, 6),
   'Kate, welcome. The doughnut — implemented as platform architecture.',
   '["economics","academic_papers","governance","founder"]'::jsonb),

  ('shoshanazuboff.com', 'Shoshana Zuboff', 'Academic Advisor', 'Surveillance Capitalism Defense', 3, 'outreach',
   substr(md5(random()::text), 1, 6),
   'Professor Zuboff, welcome. No surveillance. No extraction. By design.',
   '["economics","governance","patent_portfolio","academic_papers","founder"]'::jsonb),

  ('herjavecgroup.com', 'Robert Herjavec', 'Upekrithen Advisor', 'Cybersecurity Initiative', 2, 'outreach',
   substr(md5(random()::text), 1, 6),
   'Mr. Herjavec, welcome. Upekrithen needs a guardian.',
   '["economics","initiative_spotlight","governance","founder"]'::jsonb)
) AS v(email_domain, recipient_name, role_offered, initiative, wave, walkthrough_type, invite_code, personalized_greeting, walkthrough_sections)
WHERE NOT EXISTS (
  SELECT 1 FROM red_carpet_recipients r WHERE r.recipient_name = v.recipient_name
);


-- Blessing recipients
INSERT INTO red_carpet_recipients (email_domain, recipient_name, role_offered, initiative, wave, walkthrough_type, invite_code, personalized_greeting, walkthrough_sections)
SELECT * FROM (VALUES
  ('dollywood.com', 'Dolly Parton', 'Blessing', 'Cultural Ambassador', 5, 'blessing',
   substr(md5(random()::text), 1, 6),
   'Ms. Parton, welcome. Working 9 to 5 — but keeping 83.3%.',
   '["economics","creator_showcase","founder"]'::jsonb),

  ('jimmykimmel.com', 'Jimmy Kimmel', 'Blessing', 'Cultural Ambassador', 5, 'blessing',
   substr(md5(random()::text), 1, 6),
   'Jimmy, welcome. The platform that cannot enshittify. Seriously.',
   '["economics","press_kit","founder"]'::jsonb),

  ('pitbull.com', 'Pitbull', 'Blessing', 'Cultural Ambassador', 5, 'blessing',
   substr(md5(random()::text), 1, 6),
   'Dale! Welcome. Mr. Worldwide meets cooperative economics.',
   '["economics","creator_showcase","founder"]'::jsonb)
) AS v(email_domain, recipient_name, role_offered, initiative, wave, walkthrough_type, invite_code, personalized_greeting, walkthrough_sections)
WHERE NOT EXISTS (
  SELECT 1 FROM red_carpet_recipients r WHERE r.recipient_name = v.recipient_name
);


-- Sponsorship recipients
INSERT INTO red_carpet_recipients (email_domain, recipient_name, role_offered, initiative, wave, walkthrough_type, invite_code, personalized_greeting, walkthrough_sections)
SELECT * FROM (VALUES
  ('vincestaples.com', 'Vince Staples', 'Medallion Sponsor', 'Creator Sponsorship', 5, 'sponsor',
   substr(md5(random()::text), 1, 6),
   'Vince, welcome. Real ownership. Real economics. No cap.',
   '["economics","creator_showcase","governance","founder"]'::jsonb),

  ('ziwe.com', 'Ziwe Fumudoh', 'Medallion Sponsor', 'Creator Sponsorship', 5, 'sponsor',
   substr(md5(random()::text), 1, 6),
   'Ziwe, welcome. The platform asks the uncomfortable questions too.',
   '["economics","creator_showcase","governance","founder"]'::jsonb)
) AS v(email_domain, recipient_name, role_offered, initiative, wave, walkthrough_type, invite_code, personalized_greeting, walkthrough_sections)
WHERE NOT EXISTS (
  SELECT 1 FROM red_carpet_recipients r WHERE r.recipient_name = v.recipient_name
);


-- Political recipients
INSERT INTO red_carpet_recipients (email_domain, recipient_name, role_offered, initiative, wave, walkthrough_type, invite_code, personalized_greeting, walkthrough_sections)
SELECT * FROM (VALUES
  ('ocasio-cortez.com', 'Alexandria Ocasio-Cortez', 'Political Expedition', 'Political Initiative', 6, 'political',
   substr(md5(random()::text), 1, 6),
   'Representative Ocasio-Cortez, welcome. Platform cooperativism meets policy.',
   '["economics","governance","all_initiatives","founder"]'::jsonb),

  ('sandrabullock.com', 'Sandra Bullock', 'Political Expedition', 'Cultural Bridge', 6, 'political',
   substr(md5(random()::text), 1, 6),
   'Ms. Bullock, welcome. Speed — but for cooperative economics.',
   '["economics","initiative_spotlight","founder"]'::jsonb),

  ('schwarzenegger.com', 'Arnold Schwarzenegger', 'Political Expedition', 'Bipartisan Bridge', 6, 'political',
   substr(md5(random()::text), 1, 6),
   'Governor Schwarzenegger, welcome. Terminate extraction economics.',
   '["economics","governance","all_initiatives","founder"]'::jsonb),

  ('keanureeves.com', 'Keanu Reeves', 'Political Expedition', 'Cultural Bridge', 6, 'political',
   substr(md5(random()::text), 1, 6),
   'Mr. Reeves, welcome. Be excellent to each other — as economic policy.',
   '["economics","initiative_spotlight","founder"]'::jsonb)
) AS v(email_domain, recipient_name, role_offered, initiative, wave, walkthrough_type, invite_code, personalized_greeting, walkthrough_sections)
WHERE NOT EXISTS (
  SELECT 1 FROM red_carpet_recipients r WHERE r.recipient_name = v.recipient_name
);


-- Patron recipients
INSERT INTO red_carpet_recipients (email_domain, recipient_name, role_offered, initiative, wave, walkthrough_type, invite_code, personalized_greeting, walkthrough_sections)
SELECT * FROM (VALUES
  ('azizansari.com', 'Aziz Ansari', 'Patron', 'Cultural Patronage', 7, 'patron',
   substr(md5(random()::text), 1, 6),
   'Aziz, welcome. Master of None — except cooperative economics.',
   '["economics","creator_showcase","founder"]'::jsonb),

  ('kekepalmer.com', 'Keke Palmer', 'Patron', 'Cultural Patronage', 7, 'patron',
   substr(md5(random()::text), 1, 6),
   'Keke, welcome. Sorry to this platform — the old one, not ours.',
   '["economics","creator_showcase","founder"]'::jsonb),

  ('sethrogen.com', 'Seth Rogen', 'Patron', 'Cultural Patronage', 7, 'patron',
   substr(md5(random()::text), 1, 6),
   'Seth, welcome. Houseplant meets cooperative manufacturing.',
   '["economics","creator_showcase","founder"]'::jsonb)
) AS v(email_domain, recipient_name, role_offered, initiative, wave, walkthrough_type, invite_code, personalized_greeting, walkthrough_sections)
WHERE NOT EXISTS (
  SELECT 1 FROM red_carpet_recipients r WHERE r.recipient_name = v.recipient_name
);


-- =====================
-- PART D: Index for invite code lookups
-- =====================
CREATE INDEX IF NOT EXISTS idx_rcp_invite_code ON red_carpet_recipients(invite_code)
  WHERE invite_code IS NOT NULL;

-- Backfill invite codes on existing recipients that don't have one
UPDATE red_carpet_recipients
SET invite_code = substr(md5(id::text || random()::text), 1, 6)
WHERE invite_code IS NULL;
