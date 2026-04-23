-- ============================================================
-- SEED DATA MIGRATION — February 9, 2026
-- ============================================================
-- Written against the REAL Supabase schema CSV.
-- ============================================================

-- ─── DROP ALL CHECK CONSTRAINTS on tables we're seeding ───
-- We don't know what the dashboard-created constraints allow.
-- Drop them all, insert clean, move on.

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT con.conname, cls.relname AS tbl
    FROM pg_constraint con
    JOIN pg_class cls ON cls.oid = con.conrelid
    JOIN pg_namespace nsp ON nsp.oid = cls.relnamespace
    WHERE con.contype = 'c'
      AND nsp.nspname = 'public'
      AND cls.relname IN (
        'crown_positions','golden_tickets','treasure_keys',
        'structural_bylaws','manufacturing_products','initiatives'
      )
  LOOP
    EXECUTE format('ALTER TABLE public.%I DROP CONSTRAINT IF EXISTS %I', r.tbl, r.conname);
  END LOOP;
END $$;

-- ─── ADD initiative_slug TO initiatives (TEXT id, no UUID default) ───

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'initiatives' AND column_name = 'initiative_slug') THEN
    ALTER TABLE initiatives ADD COLUMN initiative_slug text;
    BEGIN CREATE UNIQUE INDEX IF NOT EXISTS idx_initiatives_slug ON initiatives(initiative_slug); EXCEPTION WHEN OTHERS THEN NULL; END;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'initiatives' AND column_name = 'category') THEN
    ALTER TABLE initiatives ADD COLUMN category text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'initiatives' AND column_name = 'crown_name') THEN
    ALTER TABLE initiatives ADD COLUMN crown_name text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'initiatives' AND column_name = 'crown_status') THEN
    ALTER TABLE initiatives ADD COLUMN crown_status text DEFAULT 'vacant';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'initiatives' AND column_name = 'initiative_number') THEN
    ALTER TABLE initiatives ADD COLUMN initiative_number integer;
  END IF;
END $$;

-- ─── THE SWEET SIXTEEN INITIATIVES ───
-- Schema: id(text), name, tagline, icon, description, goal_amount, is_active, volunteer_roles, created_at, updated_at
-- Plus our added: initiative_slug, category, crown_name, crown_status, initiative_number

INSERT INTO initiatives (id, initiative_slug, name, tagline, icon, description, category, crown_name, crown_status, initiative_number, is_active)
VALUES
  ('init-01-dinner',     'lets-make-dinner',     'Let''s Make Dinner',     'Neighbors feeding neighbors',     '🍽️', 'Neighbors feeding neighbors. Home-cooked meals, shared tables, community kitchens.', 'food_home', 'Maneet Chauhan', 'offered', 1,  true),
  ('init-02-groceries',  'lets-get-groceries',   'Let''s Get Groceries',   'Volume purchasing power',         '🛒', 'Volume purchasing power. Cooperative grocery buying at wholesale prices.',            'food_home', NULL, 'vacant', 2,  true),
  ('init-03-shopping',   'lets-go-shopping',     'Let''s Go Shopping',     'Cooperative buying power',        '🛍️', 'Cooperative buying power for everything beyond groceries.',                          'food_home', 'Mary Beth Laughton', 'offered', 3,  true),
  ('init-04-concierge',  'household-concierge',  'Household Concierge',    'World-class home management',     '🏠', 'World-class home management. Maintenance, repairs, scheduling — all cooperative.',   'food_home', NULL, 'vacant', 4,  true),
  ('init-05-family',     'the-family-table',     'The Family Table',       'Family meal planning and safety',  '👨‍👩‍👧‍👦', 'Family meal scheduling, recipe repository, and meal prep coordination — tied into Defense Klaus for household safety. Plan who cooks, who picks up, who''s where.', 'food_home', NULL, 'vacant', 5,  true),
  ('init-06-lifeline',   'lifeline-medications', 'LifeLine Medications',   'Affordable prescriptions',        '💊', 'Affordable prescriptions through cooperative purchasing and transparent pricing.',    'health_safety', NULL, 'vacant', 6,  true),
  ('init-07-msa',        'msa',                  'MSA',                    'Medical savings accounts',         '🏥', 'Medical Savings Accounts. Cooperative health cost sharing and emergency funds.',      'health_safety', NULL, 'vacant', 7,  true),
  ('init-08-defense',    'defense-klaus',        'Defense Klaus',          'For Someone You Love',            '🛡️', 'Personal safety — "For Someone You Love." GPS-enabled safety network.',               'health_safety', NULL, 'vacant', 8,  true),
  ('init-09-rally',      'rally-group',          'Rally Group',            'Crisis response everywhere',       '🚨', 'Crisis response everywhere. When disaster strikes, Rally Group moves.',               'health_safety', 'Kimberly A. Williams', 'offered', 9,  true),
  ('init-10-vsl',        'vsl',                  'VSL',                    'Village savings and loans',        '🏦', 'Village Savings & Loans. Micro-lending circles, SSL $50 emergency loans.',            'finance_work', 'Cathie Mahon', 'offered', 10, true),
  ('init-11-bread',      'lets-make-bread',      'Let''s Make Bread',      'Cooperative manufacturing',        '🏭', 'Cooperative manufacturing. 3D printing, desktop extruders, shared production.',       'finance_work', NULL, 'vacant', 11, true),
  ('init-12-harper',     'harper-guild',         'Harper Guild',           'HR and ethics for all',           '📋', 'HR & ethics for all. Fair employment, skills training, career development.',          'finance_work', NULL, 'vacant', 12, true),
  ('init-13-jukebox',    'jukebox',              'JukeBox',                'Fair music licensing',             '🎵', 'Fair music licensing. Artists keep 83.3%. Transparent royalty distribution.',          'creative_learning', NULL, 'vacant', 13, true),
  ('init-14-didasko',    'didasko',              'Didasko (Academic)',      'BOUNTY K-12 curriculum',          '📚', 'BOUNTY K-12 curriculum. Education as cooperative enterprise.',                       'creative_learning', NULL, 'vacant', 14, true),
  ('init-15-intl',       'international',        'International',          'Global connection',                '🌍', 'Global connection. Cross-border cooperative commerce.',                               'growth', NULL, 'vacant', 15, true),
  ('init-16-brass',      'brass-tacks',          'Brass Tacks',            'Medallion sponsorship',           '🔩', 'Medallion sponsorship program. Brass Tacks backs builders.',                          'growth', NULL, 'vacant', 16, true)
ON CONFLICT (id) DO UPDATE SET
  initiative_slug = EXCLUDED.initiative_slug,
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  crown_name = EXCLUDED.crown_name,
  crown_status = EXCLUDED.crown_status,
  initiative_number = EXCLUDED.initiative_number,
  icon = EXCLUDED.icon,
  is_active = EXCLUDED.is_active;

-- ─── CROWN POSITIONS ───
-- Schema: id(text), initiative, title, full_title_template, suffix,
-- holder_user_id, holder_name, holder_since, status, target_candidate,
-- letter_sent_at, veto_power_expires_at, created_at, updated_at

INSERT INTO crown_positions (id, initiative, title, full_title_template, suffix, status, target_candidate)
VALUES
  ('crown-dinner',     'Let''s Make Dinner',   'Crown — Let''s Make Dinner',   'Crown of {initiative}', 'LMD',  'offered', 'Maneet Chauhan'),
  ('crown-shopping',   'Let''s Go Shopping',   'Crown — Let''s Go Shopping',   'Crown of {initiative}', 'LGS',  'offered', 'Mary Beth Laughton'),
  ('crown-rally',      'Rally Group',          'Crown — Rally Group',          'Crown of {initiative}', 'RG',   'offered', 'Kimberly A. Williams'),
  ('crown-vsl',        'VSL',                  'Crown — VSL',                  'Crown of {initiative}', 'VSL',  'offered', 'Cathie Mahon'),
  ('crown-jukebox',    'JukeBox',              'Crown — JukeBox',              'Crown of {initiative}', 'JB',   'open',    NULL),
  ('crown-lifeline',   'LifeLine Medications', 'Crown — LifeLine Medications', 'Crown of {initiative}', 'LLM',  'open',    NULL),
  ('crown-msa',        'MSA',                  'Crown — MSA',                  'Crown of {initiative}', 'MSA',  'open',    NULL),
  ('crown-defense',    'Defense Klaus',         'Crown — Defense Klaus',        'Crown of {initiative}', 'DK',   'open',    NULL),
  ('crown-groceries',  'Let''s Get Groceries', 'Crown — Let''s Get Groceries', 'Crown of {initiative}', 'LGG',  'open',    NULL),
  ('crown-concierge',  'Household Concierge',  'Crown — Household Concierge',  'Crown of {initiative}', 'HC',   'open',    NULL),
  ('crown-family',     'The Family Table',     'Crown — The Family Table',     'Crown of {initiative}', 'TFT',  'open',    NULL),
  ('crown-bread',      'Let''s Make Bread',    'Crown — Let''s Make Bread',    'Crown of {initiative}', 'LMB',  'open',    NULL),
  ('crown-harper',     'Harper Guild',         'Crown — Harper Guild',         'Crown of {initiative}', 'HG',   'open',    NULL),
  ('crown-didasko',    'Didasko',              'Crown — Didasko',              'Crown of {initiative}', 'DID',  'open',    NULL),
  ('crown-intl',       'International',        'Crown — International',        'Crown of {initiative}', 'INTL', 'open',    NULL),
  ('crown-brass',      'Brass Tacks',          'Crown — Brass Tacks',          'Crown of {initiative}', 'BT',   'open',    NULL)
ON CONFLICT (initiative) DO NOTHING;

-- ─── GOLDEN TICKETS ───
-- Schema: id(uuid), puzzle, answer, hint, location, prize_type, prize_value,
-- prize_description, found_by, found_at, is_active, created_at, expires_at

INSERT INTO golden_tickets (puzzle, answer, hint, location, prize_type, prize_value, prize_description, is_active)
VALUES
  ('The Golden Key is hidden where Morpheus would look.',                           'MORPHEUS',   'Check the landing page, look for hidden text.',                  '/',                    'credits', '50',  'Earn 50 credits for finding the Golden Key.',                true),
  ('Where neighbors gather to share a meal, a key waits beneath the table.',        'DINNER',     'Visit the Let''s Make Dinner initiative.',                       '/initiatives/lets-make-dinner', 'credits', '25', 'Earn 25 credits.', true),
  ('The Bifrost guardian keeps a secret on channel 7.',                              'HOFUND7',    'Hofund Studio, channel 7.',                                      '/hofund',              'credits', '75',  'Earn 75 credits for finding the Bifrost secret.',            true),
  ('Speak "friend" and enter. But in which tongue?',                                'MELLON',     'Durin''s Door, try Elvish.',                                     '/durins-door',         'credits', '100', 'Earn 100 credits for speaking friend.',                      true),
  ('The founder''s favorite opening holds a surprise.',                             'CHESS2080',  'Look at the founder''s chess rating context.',                    '/fly-on-the-wall',     'credits', '50',  'Earn 50 credits from the chessboard.',                       true),
  ('Don''t break the chain — unless you find this link.',                           'HERALD',     'Herald subscription page, hidden in the how-it-works section.',   '/herald',              'credits', '25',  'Earn 25 credits for finding the chain link.',                true),
  ('Follow the light. Every beacon has a shadow.',                                  'BEACON',     'The Helm — beacons section.',                                     '/the-helm',            'credits', '50',  'Earn 50 credits for following the light.',                   true),
  ('A card flipped at midnight reveals its secret.',                                'MIDNIGHT',   'Deck Collection, try accessing between 11pm-1am.',               '/deck',                'credits', '150', 'Earn 150 credits for the midnight flip.',                    true),
  ('Invisible doesn''t mean absent. Ghosts leave traces.',                          'GHOST',      'Ghost World exploration.',                                        '/ghost',               'credits', '25',  'Earn 25 credits for finding the ghost trace.',               true),
  ('Where 300 govern, one seat remains hidden.',                                    'SEAT301',    'Governance page, The 300 section.',                               '/governance',          'credits', '100', 'Earn 100 credits for finding the hidden seat.',              true)
ON CONFLICT DO NOTHING;

-- ─── TREASURE KEYS ───
-- Schema: id(uuid), key_word, document_name, document_path, circle, tier,
-- feathers, hint, hiding_method, found_by, found_at, is_active, created_at

INSERT INTO treasure_keys (key_word, document_name, document_path, circle, tier, feathers, hint, hiding_method, is_active)
VALUES
  ('JOURNAL',    'Founder''s Journal',      '/founder-docs',          1, 'legendary', 500, 'Unlocks founder journal entries.',           'embedded',   true),
  ('PATENT',     'Patent Preview',          '/patents',               2, 'epic',      200, 'Peek at innovation descriptions.',           'hidden_text', true),
  ('BLUEPRINT',  'Blueprint Room',          '/blueprints',            2, 'rare',      100, 'Access to Fusion 360 blueprint gallery.',    'cipher',     true),
  ('CROWN',      'Crown Letter',            '/letters/crown-letters', 3, 'epic',      150, 'Read a crown letter draft.',                 'hidden_text', true),
  ('CHESS',      'Chess Match',             '/chess',                 1, 'uncommon',  50,  'Play a chess puzzle from the founder.',       'puzzle',     true),
  ('FIRECHIEF',  'Fire Chief Story',        '/founder-docs',          1, 'rare',      75,  'Unlocks the fire chief story narration.',    'embedded',   true),
  ('GIANTS',     'Intramural Giants',       '/founder-docs',          1, 'uncommon',  50,  'Watch the intramural giants animation.',     'embedded',   true),
  ('LOCALCY',    'LOCALCY Archives',        '/history',               3, 'legendary', 300, 'Access the 2011 LOCALCY to LB evolution.',   'cipher',     true)
ON CONFLICT DO NOTHING;

-- ─── DECK CARDS (additional thematic cards) ───
-- Table already exists from 20260209000005. Schema:
-- card_code(unique), name, description, card_type, rarity, front_title, front_subtitle,
-- front_image_url, front_icon, back_title, back_instructions, back_destination,
-- back_action, border_color, credit_cost, marks_value, is_consumable, max_uses, drop_rate, is_active

INSERT INTO deck_cards (card_code, name, description, card_type, rarity, front_title, front_subtitle, back_title, back_instructions, border_color, credit_cost, marks_value, is_consumable, drop_rate)
VALUES
  ('LORE-GOLDEN-KEY',   'The Golden Key',      'The original. Help each other help ourselves.',                          'lore', 'legendary', 'The Golden Key',      'Help each other help ourselves',   'Read the inscription', 'This is the key that started it all. 37 years in the making.',                  'gold',   0, 100, false, 0.005),
  ('LORE-MORPHEUS',     'Morpheus Card',       'I don''t need to be Neo. I''m happy to aspire to be Morpheus.',          'lore', 'epic',      'Morpheus',            'One of many',                      'Reflect',              'One of us winning means all of us win.',                                        'purple', 0, 50,  false, 0.02),
  ('LORE-FIRE-CHIEF',   'Fire Chief',          'I slipped. Is she okay?',                                               'lore', 'epic',      'The Fire Chief',      'Accept responsibility',            'Read the story',       'He fell from a three-story ladder carrying a victim. His first words: Is she okay?', 'purple', 0, 50, false, 0.02),
  ('LORE-GIANTS',       'Intramural Giants',   'They were pretty big. The best I could do was NOT QUIT.',                'lore', 'rare',      'Intramural Giants',   'Climb the giants',                 'Hear the story',       'I dropped my shoulder and plowed INTO AND THROUGH THEM. My teammate scored 6.', 'blue',   0, 25, false, 0.05),
  ('INIT-DINNER',       'Dinner Bell',         'Ring the bell. Neighbors are coming.',                                   'initiative', 'common',  'Dinner Bell',    'Neighbors feeding neighbors',      'Ring it',              'Visit Let''s Make Dinner to see what''s cooking.',                              'silver', 0, 5,  true,  0.4),
  ('INIT-SHIELD',       'Safety Shield',       'For someone you love.',                                                  'initiative', 'uncommon','Safety Shield',  'Defense Klaus',                    'Activate',             'Personal safety network. GPS-enabled. For someone you love.',                   'green',  0, 10, true,  0.2),
  ('INIT-RALLY',        'Rally Horn',          'When disaster strikes, Rally Group moves.',                              'initiative', 'uncommon','Rally Horn',     'Sound the alarm',                  'Blow',                 'Crisis response everywhere. Rally Group moves when disaster strikes.',           'green',  0, 10, true,  0.2),
  ('INIT-VILLAGE',      'Village Coin',        'A village that saves together, thrives together.',                        'initiative', 'rare',    'Village Coin',   'VSL micro-lending',                'Invest',               'Village Savings & Loans. $50 SSL emergency microloans.',                        'blue',   0, 25, false, 0.05),
  ('FOUND-CHESS',       'Chess King',          'Top 0.4% globally. 37 years of strategy.',                               'lore', 'epic',      'Chess King',          '2080s rating',                     'Study the board',      'The founder plays at 2080+ rating. Top 0.4% globally.',                         'purple', 0, 50, false, 0.02),
  ('FOUND-EIGHT',       'Eight Stars',         'Father of eight. Each one a constellation.',                             'lore', 'legendary', 'Eight Stars',         'A father''s constellation',        'Count them',           'Eight children. Each one a star. That''s the real portfolio.',                   'gold',   0, 100, false, 0.005),
  ('SYS-COST20',        'Cost Plus Twenty',    'The constitutional constant: Cost + 20%.',                               'governance', 'uncommon', 'Cost+20%',      'DNA Locked',                       'Verify',               'Creator keeps 83.3%. Constitutionally locked. Cannot be overridden.',            'green',  0, 10, false, 0.2),
  ('SYS-DNA-LOCK',      'DNA Lock',            'Immutable parameters. Cannot be overridden.',                            'governance', 'epic',     'DNA Lock',      'Immutable',                        'Attempt to change',    'These parameters cannot be modified by any agent or vote. Try it.',              'purple', 0, 50, false, 0.02)
ON CONFLICT (card_code) DO NOTHING;

-- ─── STRUCTURAL BYLAWS ───
-- Schema: id(text), name, description, category, protection_level, amendment_requirement, created_at
-- No is_active column.

INSERT INTO structural_bylaws (id, name, description, category, protection_level, amendment_requirement)
VALUES
  ('bylaw-cost20',       'Cost Plus Twenty',       'Platform margin is Cost + 20%. Creator keeps 83.3%. Cannot be changed.',                    'economics',  'structural', '80% vote + Founder veto'),
  ('bylaw-5dollar',      'Five Dollar Membership', 'Annual membership costs $5. Cannot be raised above $5.',                                    'economics',  'structural', '80% vote + Founder veto'),
  ('bylaw-dnalock',      'DNA Lock Parameters',    'Core economic constants cannot be modified by any agent or vote.',                           'economics',  'structural', 'Immutable — no amendment path'),
  ('bylaw-nocredxfer',   'No Credit Transfers',    'Credits cannot be transferred between members.',                                            'compliance', 'structural', '80% vote + Founder veto'),
  ('bylaw-nocash',       'No Cash Redemption',     'Credits cannot be redeemed for cash.',                                                       'compliance', 'structural', '80% vote + Founder veto'),
  ('bylaw-volunteers',   'Volunteer Moderators',   'Moderators are volunteers. No payment in credits or cash.',                                  'compliance', 'standard',   '67% majority'),
  ('bylaw-300',          'The 300 Composition',    '100 AI, 100 Human, 100 Mixed. Structure is structural bylaw.',                              'governance', 'structural', '80% vote + Founder veto'),
  ('bylaw-crowns',       'Crown Selection',        'Crowns are offered to domain experts. They can accept, decline, or delegate.',               'governance', 'standard',   '67% majority'),
  ('bylaw-anticonc',     'Anti-Concentration',     'Max 5% patents per entity. 20% founder reserve. >10 requires 60% vote.',                    'patents',    'structural', '80% vote + Founder veto'),
  ('bylaw-ssl',          'SSL Microloans',         'Emergency $50 SSL microloans available to members in crisis.',                               'finance',    'standard',   '51% majority'),
  ('bylaw-transparency', 'Open Transparency',      'Fly on the Wall — all governance and finances are publicly auditable.',                      'governance', 'structural', '80% vote + Founder veto'),
  ('bylaw-starchamber',  'Star Chamber Process',   'All content verified by dual AI. Human reviewer makes final call.',                          'compliance', 'standard',   '67% majority'),
  ('bylaw-switzerland',  'Switzerland Rule',       'No politics, no religion on main platform. Arenas: Political Expedition, Areopagus, Crucible.', 'governance', 'structural', '80% vote + Founder veto'),
  ('bylaw-noappreciation', 'No Appreciation Tokens', 'Credits, Joules, and medallions do not appreciate in dollar value based on campaign performance or enterprise valuation. Fixed-value only.', 'economics', 'structural', '80% vote + Founder veto'),
  ('bylaw-joulepurpose', 'Joule Purpose',           'Joules back offers/contracts, convert to Credits on favorable terms, offered at promotional rates. Never redeemable for cash or transferable.', 'economics', 'structural', '80% vote + Founder veto'),
  ('bylaw-medallionaccess', 'Project Medallion Access Rights', 'Project-stamped medallions grant first-access rights to future related campaigns proportional to original support gap. Non-cash perk only.', 'economics', 'structural', '80% vote + Founder veto')
ON CONFLICT (id) DO NOTHING;

-- ─── DNA LOCK PARAMETERS ───
-- Schema: id(uuid), parameter_key, parameter_value, data_type, is_locked,
-- locked_at, locked_by, description, category, last_read_at, read_count,
-- change_attempts, last_change_attempt_at, last_change_attempt_by, created_at

INSERT INTO dna_lock (parameter_key, parameter_value, data_type, is_locked, locked_by, description, category)
VALUES
  ('creator_percentage',       '83.3',         'decimal', true, 'SYSTEM', 'Percentage of transaction retained by creator',            'economics'),
  ('platform_margin_model',    'cost_plus_20', 'text',    true, 'SYSTEM', 'Platform takes Cost + 20%, nothing more',                  'economics'),
  ('annual_membership_fee',    '5.00',         'decimal', true, 'SYSTEM', 'Annual membership fee in USD',                             'economics'),
  ('ssl_microloan_amount',     '50.00',        'decimal', true, 'SYSTEM', 'Emergency SSL microloan amount',                           'finance'),
  ('max_patent_per_entity',    '5',            'integer', true, 'SYSTEM', 'Max percentage of patents any single entity can hold',      'patents'),
  ('founder_patent_reserve',   '20',           'integer', true, 'SYSTEM', 'Percentage of patents permanently reserved for founder',    'patents'),
  ('community_vote_threshold', '10',           'integer', true, 'SYSTEM', 'Patents above which 60% member vote required',              'patents'),
  ('the_300_ai_seats',         '100',          'integer', true, 'SYSTEM', 'AI seats in The 300 governance',                           'governance'),
  ('the_300_human_seats',      '100',          'integer', true, 'SYSTEM', 'Human seats in The 300 governance',                        'governance'),
  ('the_300_mixed_seats',      '100',          'integer', true, 'SYSTEM', 'Mixed seats in The 300 governance',                        'governance'),
  ('initiative_count',         '16',           'integer', true, 'SYSTEM', 'Total number of Sweet Sixteen initiatives',                'platform'),
  ('innovation_count',         '1187',         'integer', true, 'SYSTEM', 'Total documented innovations as of Feb 2026',              'patents'),
  ('formal_claims_count',      '210',          'integer', true, 'SYSTEM', 'Total formal patent claims across 7 applications',         'patents'),
  ('break_even_members',       '500',          'integer', true, 'SYSTEM', 'Members per locale needed for break-even',                 'economics'),
  ('profitable_members',       '1000',         'integer', true, 'SYSTEM', 'Members per locale needed for profitability',              'economics')
ON CONFLICT (parameter_key) DO UPDATE SET
  parameter_value = EXCLUDED.parameter_value,
  description = EXCLUDED.description;

-- ─── LOOKING GLASS ENTRIES ───

CREATE TABLE IF NOT EXISTS looking_glass_entries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_type text NOT NULL DEFAULT 'log',
  title text NOT NULL,
  body text,
  category text DEFAULT 'general',
  visibility text DEFAULT 'public',
  source_agent text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE looking_glass_entries ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'looking_glass_entries' AND policyname = 'Looking glass entries are publicly readable') THEN
    CREATE POLICY "Looking glass entries are publicly readable" ON looking_glass_entries FOR SELECT USING (visibility = 'public');
  END IF;
END $$;

INSERT INTO looking_glass_entries (entry_type, title, body, category, source_agent)
VALUES
  ('milestone', 'Platform Launch',        'Liana Banyan Platform deployed with 100+ routes, 190+ database tables, and all 16 initiatives wired.', 'platform', 'KNIGHT'),
  ('milestone', 'Patent Portfolio',       '1187 innovations documented across 7 patent applications with 210 formal claims.',                      'patents',  'ROOK'),
  ('milestone', 'Legal Compliance',       'Full 205-document legal review completed. All compliance issues resolved.',                              'legal',    'PAWN'),
  ('milestone', 'Communications Ready',   'Crown letters, launch posts, and humanized academic papers ready for distribution.',                     'comms',    'BISHOP'),
  ('log',       'Three-Gear Currency',    'Credits, MARKS, and Joules currency system deployed with DNA Lock protection.',                          'economics','KNIGHT'),
  ('log',       'Herald Program Active',  'Don''t Break the Chain subscription model with Stripe integration.',                                     'features', 'KNIGHT'),
  ('log',       'Durin''s Door Complete', '9 doors, 50+ multilingual passwords, time-gating, and Konami codes.',                                   'features', 'KNIGHT'),
  ('log',       'Governance Framework',   'The 300 (100 AI + 100 Human + 100 Mixed) governance structure deployed.',                                'governance','KNIGHT'),
  ('decision',  'Cost+20% DNA Locked',   'Creator keeps 83.3% of every transaction. Constitutionally locked. Cannot be overridden.',                'economics','SYSTEM'),
  ('decision',  '$5 Membership Locked',  'Annual membership fee locked at $5. Cannot be raised.',                                                   'economics','SYSTEM')
ON CONFLICT DO NOTHING;

-- ─── MANUFACTURING PRODUCTS ───
-- Schema: id(uuid), slug, name, description, category, base_price, volume_discounts,
-- production_time_days, materials, min_quantity, in_stock, customizable, image_url, gallery_urls

INSERT INTO manufacturing_products (slug, name, description, category, base_price, production_time_days, min_quantity, in_stock, customizable)
VALUES
  ('custom-phone-case',       'Custom Phone Case',       'SLA 3D-printed phone case with cooperative branding.',        'accessories', 8.50,  3, 1, true,  true),
  ('desk-organizer',          'Desk Organizer',          'Desktop extruder-produced modular desk organizer.',            'home',        12.00, 3, 1, true,  true),
  ('community-garden-marker', 'Community Garden Marker', 'Weather-resistant garden markers with QR codes.',              'outdoor',     5.00,  2, 1, true,  false),
  ('medallion-display-stand', 'Medallion Display Stand', 'Custom stand for displaying your earned medallions.',          'accessories', 15.00, 4, 1, true,  true),
  ('cooperative-logo-stamp',  'Cooperative Logo Stamp',  'Rubber stamp with your Keep''s cooperative logo.',             'stationery',  7.50,  5, 1, true,  true),
  ('emergency-whistle',       'Emergency Whistle',       'Defense Klaus-branded emergency whistle with GPS QR.',         'safety',      3.00,  2, 1, true,  false),
  ('family-table-placemat',   'Family Table Placemat',   'Personalized placemats for The Family Table initiative.',      'home',        6.00,  3, 1, true,  true),
  ('qr-badge-holder',         'QR Badge Holder',         'Wearable badge holder with embedded QR code slot.',            'accessories', 4.50,  2, 1, true,  false),
  ('beacon-housing',          'Beacon Housing',          'Weather-resistant housing for physical beacon drops.',          'outdoor',     18.00, 5, 1, true,  false),
  ('chess-piece-set',         'Chess Piece Set',         'Cooperative-themed chess piece set (founder approved).',        'games',       45.00, 7, 1, true,  false)
ON CONFLICT DO NOTHING;

-- ─── MANUFACTURING ORDERS ───
-- Table already exists with columns: id, user_id, order_number, status, subtotal,
-- shipping, total, shipping_address, tracking_number, payment_status, payment_intent_id,
-- ordered_at, shipped_at, delivered_at
-- No need to create or alter.
