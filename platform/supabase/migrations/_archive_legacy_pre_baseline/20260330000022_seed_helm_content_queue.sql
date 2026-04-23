-- K190: Seed helm_content_queue from cephas_content_registry + disk-only documents
-- ~300 documents total across all content types

-- ============================================================
-- PART 1: Pull from cephas_content_registry (articles, papers, letters, pitches)
-- ============================================================

INSERT INTO helm_content_queue (slug, title, content_type, content_markdown, source_file_path, destination, recipient_name, status, priority, wave, tags)
SELECT
  slug,
  title,
  CASE category
    WHEN 'crown_letter' THEN 'crown_letter'
    WHEN 'outreach_letter' THEN 'outreach_letter'
    WHEN 'open_letter' THEN 'political_letter'
    WHEN 'academic_paper' THEN 'academic_paper'
    WHEN 'pitch' THEN 'publication_pitch'
    WHEN 'article' THEN
      CASE
        WHEN style = 'pudding' THEN 'pudding_essay'
        ELSE 'cephas_article'
      END
    WHEN 'system_design' THEN 'cephas_article'
    WHEN 'under_the_hood' THEN 'cephas_article'
    WHEN 'founder' THEN 'cephas_article'
    WHEN 'business-plan' THEN 'cephas_article'
    ELSE 'cephas_article'
  END::TEXT,
  content_markdown,
  source_path,
  CASE category
    WHEN 'crown_letter' THEN 'email'
    WHEN 'outreach_letter' THEN 'email'
    WHEN 'open_letter' THEN 'cephas'
    WHEN 'pitch' THEN 'email'
    ELSE 'cephas'
  END,
  CASE
    WHEN category IN ('crown_letter', 'outreach_letter') THEN
      REPLACE(REPLACE(INITCAP(REPLACE(slug, '-', ' ')), 'Letter ', ''), 'Crown ', '')
    ELSE NULL
  END,
  'draft',
  CASE category
    WHEN 'crown_letter' THEN 1
    WHEN 'outreach_letter' THEN 2
    WHEN 'academic_paper' THEN 3
    WHEN 'pitch' THEN 4
    WHEN 'article' THEN 5
    ELSE 6
  END,
  CASE
    WHEN category = 'crown_letter' THEN 1
    WHEN category = 'outreach_letter' AND subcategory = 'circle-1-investors' THEN 1
    WHEN category IN ('outreach_letter', 'open_letter') THEN 2
    WHEN category = 'pitch' THEN 3
    WHEN category = 'academic_paper' THEN 2
    ELSE NULL
  END,
  ARRAY[category, COALESCE(subcategory, '')]::TEXT[]
FROM cephas_content_registry
WHERE category IN (
  'crown_letter', 'outreach_letter', 'open_letter',
  'academic_paper', 'pitch',
  'article', 'system_design', 'under_the_hood', 'founder', 'business-plan'
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- PART 2: Crown letters from Cephas Hugo (not in registry)
-- ============================================================

INSERT INTO helm_content_queue (slug, title, content_type, source_file_path, destination, recipient_name, status, priority, wave, tags)
VALUES
  ('crown-letter-aoc', 'Crown Letter: Alexandria Ocasio-Cortez', 'crown_letter', 'Cephas/cephas-hugo/content/letters/crown-letter-aoc.md', 'email', 'Alexandria Ocasio-Cortez', 'draft', 1, 1, ARRAY['crown_letter', 'political']),
  ('crown-letter-keanu-reeves', 'Crown Letter: Keanu Reeves', 'crown_letter', 'Cephas/cephas-hugo/content/letters/crown-letter-keanu-reeves.md', 'email', 'Keanu Reeves', 'draft', 1, 1, ARRAY['crown_letter', 'celebrity']),
  ('crown-letter-sandra-bullock', 'Crown Letter: Sandra Bullock', 'crown_letter', 'Cephas/cephas-hugo/content/letters/crown-letter-sandra-bullock.md', 'email', 'Sandra Bullock', 'draft', 1, 1, ARRAY['crown_letter', 'celebrity']),
  ('crown-letter-schwarzenegger', 'Crown Letter: Arnold Schwarzenegger', 'crown_letter', 'Cephas/cephas-hugo/content/letters/crown-letter-schwarzenegger.md', 'email', 'Arnold Schwarzenegger', 'draft', 1, 1, ARRAY['crown_letter', 'celebrity'])
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- PART 3: Blessing letters
-- ============================================================

INSERT INTO helm_content_queue (slug, title, content_type, source_file_path, destination, recipient_name, status, priority, wave, tags)
VALUES
  ('blessing-dolly-parton', 'Blessing Letter: Dolly Parton', 'blessing_letter', 'Cephas/cephas-hugo/content/letters/blessing/dolly-parton.md', 'email', 'Dolly Parton', 'draft', 2, 2, ARRAY['blessing_letter']),
  ('blessing-jimmy-kimmel', 'Blessing Letter: Jimmy Kimmel', 'blessing_letter', 'Cephas/cephas-hugo/content/letters/blessing/jimmy-kimmel.md', 'email', 'Jimmy Kimmel', 'draft', 2, 2, ARRAY['blessing_letter']),
  ('blessing-pitbull', 'Blessing Letter: Pitbull', 'blessing_letter', 'Cephas/cephas-hugo/content/letters/blessing/pitbull.md', 'email', 'Pitbull', 'draft', 2, 2, ARRAY['blessing_letter'])
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- PART 4: Partnership / Sponsorship letters
-- ============================================================

INSERT INTO helm_content_queue (slug, title, content_type, source_file_path, destination, recipient_name, status, priority, wave, tags)
VALUES
  ('partnership-bambu-lab', 'Partnership: Bambu Lab', 'sponsorship_letter', 'Cephas/cephas-hugo/content/letters/partnerships/bambu-lab.md', 'email', 'Bambu Lab', 'draft', 3, 3, ARRAY['sponsorship_letter', 'hexisle']),
  ('partnership-kallistra', 'Partnership: Kallistra', 'sponsorship_letter', 'Cephas/cephas-hugo/content/letters/partnerships/kallistra.md', 'email', 'Kallistra', 'draft', 3, 3, ARRAY['sponsorship_letter', 'hexisle']),
  ('partnership-lorescape', 'Partnership: Lorescape', 'sponsorship_letter', 'Cephas/cephas-hugo/content/letters/partnerships/lorescape.md', 'email', 'Lorescape', 'draft', 3, 3, ARRAY['sponsorship_letter', 'hexisle']),
  ('partnership-openwarhex', 'Partnership: OpenWarHex', 'sponsorship_letter', 'Cephas/cephas-hugo/content/letters/partnerships/openwarhex.md', 'email', 'OpenWarHex', 'draft', 3, 3, ARRAY['sponsorship_letter', 'hexisle']),
  ('partnership-terratiles', 'Partnership: TerraTiles', 'sponsorship_letter', 'Cephas/cephas-hugo/content/letters/partnerships/terratiles.md', 'email', 'TerraTiles', 'draft', 3, 3, ARRAY['sponsorship_letter', 'hexisle'])
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- PART 5: Political / Health letters
-- ============================================================

INSERT INTO helm_content_queue (slug, title, content_type, source_file_path, destination, recipient_name, status, priority, wave, tags)
VALUES
  ('political-facebook-friend', 'Open Letter: Facebook Friend Impossible Choice', 'political_letter', 'Cephas/cephas-hugo/content/letters/health/facebook-friend-impossible-choice.md', 'cephas', NULL, 'draft', 4, 3, ARRAY['political_letter', 'health']),
  ('political-jimmy-kimmel-healthcare', 'Open Letter: Jimmy Kimmel Healthcare', 'political_letter', 'Cephas/cephas-hugo/content/letters/health/jimmy-kimmel-healthcare.md', 'cephas', 'Jimmy Kimmel', 'draft', 4, 3, ARRAY['political_letter', 'health']),
  ('political-pet-store', 'Open Letter: Pet Store Consideration', 'political_letter', 'Cephas/cephas-hugo/content/letters/health/pet-store-consideration.md', 'cephas', NULL, 'draft', 4, 3, ARRAY['political_letter', 'health'])
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- PART 6: Patron letters (Circle 1 - Investors)
-- ============================================================

INSERT INTO helm_content_queue (slug, title, content_type, source_file_path, destination, recipient_name, status, priority, wave, tags)
VALUES
  ('patron-warren-buffett', 'Patron Letter: Warren Buffett', 'patron_letter', 'Cephas/cephas-hugo/content/letters/circle-1-investors/warren-buffett.md', 'email', 'Warren Buffett', 'draft', 2, 1, ARRAY['patron_letter', 'circle-1-investors']),
  ('patron-mackenzie-scott', 'Patron Letter: MacKenzie Scott', 'patron_letter', 'Cephas/cephas-hugo/content/letters/circle-1-investors/mackenzie-scott.md', 'email', 'MacKenzie Scott', 'draft', 2, 1, ARRAY['patron_letter', 'circle-1-investors']),
  ('patron-mackenzie-scott-cardboard', 'Patron Letter: MacKenzie Scott (Cardboard Boots)', 'patron_letter', 'Cephas/cephas-hugo/content/letters/circle-1-investors/mackenzie-scott-cardboard-boots.md', 'email', 'MacKenzie Scott', 'draft', 2, 1, ARRAY['patron_letter', 'circle-1-investors']),
  ('patron-craig-newmark', 'Patron Letter: Craig Newmark', 'patron_letter', 'Cephas/cephas-hugo/content/letters/circle-1-investors/craig-newmark.md', 'email', 'Craig Newmark', 'draft', 2, 1, ARRAY['patron_letter', 'circle-1-investors']),
  ('patron-melinda-french-gates', 'Patron Letter: Melinda French Gates', 'patron_letter', 'Cephas/cephas-hugo/content/letters/circle-1-investors/melinda-french-gates.md', 'email', 'Melinda French Gates', 'draft', 2, 1, ARRAY['patron_letter', 'circle-1-investors']),
  ('patron-seth-godin', 'Patron Letter: Seth Godin', 'patron_letter', 'Cephas/cephas-hugo/content/letters/circle-1-investors/seth-godin.md', 'email', 'Seth Godin', 'draft', 2, 1, ARRAY['patron_letter', 'circle-1-investors']),
  ('patron-howard-marks', 'Patron Letter: Howard Marks', 'patron_letter', 'Cephas/cephas-hugo/content/letters/circle-1-investors/howard-marks.md', 'email', 'Howard Marks', 'draft', 2, 1, ARRAY['patron_letter', 'circle-1-investors']),
  ('patron-li-jin', 'Patron Letter: Li Jin', 'patron_letter', 'Cephas/cephas-hugo/content/letters/circle-1-investors/li-jin.md', 'email', 'Li Jin', 'draft', 2, 1, ARRAY['patron_letter', 'circle-1-investors']),
  ('patron-anand-giridharadas', 'Patron Letter: Anand Giridharadas', 'patron_letter', 'Cephas/cephas-hugo/content/letters/circle-1-investors/anand-giridharadas.md', 'email', 'Anand Giridharadas', 'draft', 2, 1, ARRAY['patron_letter', 'circle-1-investors']),
  ('patron-majora-carter', 'Patron Letter: Majora Carter', 'patron_letter', 'Cephas/cephas-hugo/content/letters/circle-1-investors/majora-carter.md', 'email', 'Majora Carter', 'draft', 2, 1, ARRAY['patron_letter', 'circle-1-investors'])
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- PART 7: Academic letters (Circle 3)
-- Not already in registry — explicit inserts for unique slugs
-- ============================================================

INSERT INTO helm_content_queue (slug, title, content_type, source_file_path, destination, recipient_name, status, priority, wave, tags)
VALUES
  ('academic-arun-sundararajan', 'Academic Letter: Arun Sundararajan', 'academic_letter', 'Cephas/cephas-hugo/content/letters/circle-3-academics/arun-sundararajan.md', 'email', 'Arun Sundararajan', 'draft', 3, 2, ARRAY['academic_letter', 'circle-3-academics']),
  ('academic-daron-acemoglu', 'Academic Letter: Daron Acemoglu', 'academic_letter', 'Cephas/cephas-hugo/content/letters/circle-3-academics/daron-acemoglu.md', 'email', 'Daron Acemoglu', 'draft', 3, 2, ARRAY['academic_letter', 'circle-3-academics']),
  ('academic-erik-brynjolfsson', 'Academic Letter: Erik Brynjolfsson', 'academic_letter', 'Cephas/cephas-hugo/content/letters/circle-3-academics/erik-brynjolfsson.md', 'email', 'Erik Brynjolfsson', 'draft', 3, 2, ARRAY['academic_letter', 'circle-3-academics']),
  ('academic-esther-perel', 'Academic Letter: Esther Perel', 'academic_letter', 'Cephas/cephas-hugo/content/letters/circle-3-academics/esther-perel.md', 'email', 'Esther Perel', 'draft', 3, 2, ARRAY['academic_letter', 'circle-3-academics']),
  ('academic-juliet-schor', 'Academic Letter: Juliet Schor', 'academic_letter', 'Cephas/cephas-hugo/content/letters/circle-3-academics/juliet-schor.md', 'email', 'Juliet Schor', 'draft', 3, 2, ARRAY['academic_letter', 'circle-3-academics']),
  ('academic-kate-raworth', 'Academic Letter: Kate Raworth', 'academic_letter', 'Cephas/cephas-hugo/content/letters/circle-3-academics/kate-raworth.md', 'email', 'Kate Raworth', 'draft', 3, 2, ARRAY['academic_letter', 'circle-3-academics']),
  ('academic-mariana-mazzucato', 'Academic Letter: Mariana Mazzucato', 'academic_letter', 'Cephas/cephas-hugo/content/letters/circle-3-academics/mariana-mazzucato.md', 'email', 'Mariana Mazzucato', 'draft', 3, 2, ARRAY['academic_letter', 'circle-3-academics']),
  ('academic-nathan-schneider', 'Academic Letter: Nathan Schneider', 'academic_letter', 'Cephas/cephas-hugo/content/letters/circle-3-academics/nathan-schneider.md', 'email', 'Nathan Schneider', 'draft', 3, 2, ARRAY['academic_letter', 'circle-3-academics']),
  ('academic-shoshana-zuboff', 'Academic Letter: Shoshana Zuboff', 'academic_letter', 'Cephas/cephas-hugo/content/letters/circle-3-academics/shoshana-zuboff.md', 'email', 'Shoshana Zuboff', 'draft', 3, 2, ARRAY['academic_letter', 'circle-3-academics']),
  ('academic-tatiana-schlossberg', 'Academic Letter: Tatiana Schlossberg', 'academic_letter', 'Cephas/cephas-hugo/content/letters/circle-3-academics/tatiana-schlossberg.md', 'email', 'Tatiana Schlossberg', 'draft', 3, 2, ARRAY['academic_letter', 'circle-3-academics']),
  ('academic-trebor-scholz', 'Academic Letter: Trebor Scholz', 'academic_letter', 'Cephas/cephas-hugo/content/letters/circle-3-academics/trebor-scholz.md', 'email', 'Trebor Scholz', 'draft', 3, 2, ARRAY['academic_letter', 'circle-3-academics']),
  ('academic-yochai-benkler', 'Academic Letter: Yochai Benkler', 'academic_letter', 'Cephas/cephas-hugo/content/letters/circle-3-academics/yochai-benkler.md', 'email', 'Yochai Benkler', 'draft', 3, 2, ARRAY['academic_letter', 'circle-3-academics'])
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- PART 8: Cue Card templates
-- ============================================================

INSERT INTO helm_content_queue (slug, title, content_type, source_file_path, destination, status, priority, tags)
VALUES
  ('cue-card-bounty-photographer', 'Cue Card: Bounty Photographer', 'cue_card', NULL, 'red_carpet', 'draft', 5, ARRAY['cue_card', 'bounty_photographer']),
  ('cue-card-pearl-diver', 'Cue Card: Pearl Diver', 'cue_card', NULL, 'red_carpet', 'draft', 5, ARRAY['cue_card', 'pearl_diver']),
  ('cue-card-home-teacher', 'Cue Card: Home Teacher', 'cue_card', NULL, 'red_carpet', 'draft', 5, ARRAY['cue_card', 'home_teacher']),
  ('cue-card-node-captain', 'Cue Card: Node Captain', 'cue_card', NULL, 'red_carpet', 'draft', 5, ARRAY['cue_card', 'captain']),
  ('cue-card-subscription-creator', 'Cue Card: Subscription Creator', 'cue_card', NULL, 'red_carpet', 'draft', 5, ARRAY['cue_card', 'subscription_creator']),
  ('cue-card-freezer-node', 'Cue Card: Freezer Node Operator', 'cue_card', NULL, 'red_carpet', 'draft', 5, ARRAY['cue_card', 'freezer_node'])
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- PART 9: Pudding essays from BISHOP_DROPZONE (not in registry)
-- ============================================================

INSERT INTO helm_content_queue (slug, title, content_type, source_file_path, destination, status, priority, wave, tags)
VALUES
  ('pudding-battery-dispatch', 'Battery Dispatch & Universal Remote', 'pudding_essay', 'BISHOP_DROPZONE/CEPHAS_PUDDING_BATTERY_DISPATCH_UNIVERSAL_REMOTE.md', 'cephas', 'draft', 5, 2, ARRAY['pudding_essay', 'battery-dispatch']),
  ('pudding-captain-system', 'Your Captain Has Arrived', 'pudding_essay', 'BISHOP_DROPZONE/CEPHAS_PUDDING_CAPTAIN_SYSTEM.md', 'cephas', 'draft', 5, 2, ARRAY['pudding_essay', 'captain']),
  ('pudding-cold-start', 'Six Doors In: Cold Start Hub', 'pudding_essay', 'BISHOP_DROPZONE/CEPHAS_PUDDING_COLD_START_HUB.md', 'cephas', 'draft', 5, 2, ARRAY['pudding_essay', 'cold-start']),
  ('pudding-ghost-world', 'Ghost World: Your Digital Storefront', 'pudding_essay', 'BISHOP_DROPZONE/CEPHAS_PUDDING_GHOST_WORLD.md', 'cephas', 'draft', 5, 2, ARRAY['pudding_essay', 'ghost-world']),
  ('pudding-guest-marks', 'Try Before You Join: Guest Marks', 'pudding_essay', 'BISHOP_DROPZONE/CEPHAS_PUDDING_GUEST_MARKS_WALLET.md', 'cephas', 'draft', 5, 2, ARRAY['pudding_essay', 'guest-marks']),
  ('pudding-lb-card', 'The LB Card: Your Cooperative Wallet', 'pudding_essay', 'BISHOP_DROPZONE/CEPHAS_PUDDING_LB_CARD.md', 'cephas', 'draft', 5, 2, ARRAY['pudding_essay', 'lb-card']),
  ('pudding-marks-payback', 'Marks Payback: Earn Your Membership', 'pudding_essay', 'BISHOP_DROPZONE/CEPHAS_PUDDING_MARKS_PAYBACK.md', 'cephas', 'draft', 5, 2, ARRAY['pudding_essay', 'marks-payback']),
  ('pudding-moneypenny', 'MoneyPenny: Your AI Receptionist', 'pudding_essay', 'BISHOP_DROPZONE/CEPHAS_PUDDING_MONEYPENNY_RECEPTIONIST.md', 'cephas', 'draft', 5, 2, ARRAY['pudding_essay', 'moneypenny']),
  ('pudding-pathfinder', 'PathFinder: Where Do You Want to Go?', 'pudding_essay', 'BISHOP_DROPZONE/CEPHAS_PUDDING_PATHFINDER_JOURNAL.md', 'cephas', 'draft', 5, 2, ARRAY['pudding_essay', 'pathfinder']),
  ('pudding-anticipated-critiques', 'Anticipated Critiques', 'pudding_essay', 'BISHOP_DROPZONE/CEPHAS_PUDDING_REWRITE_ANTICIPATED_CRITIQUES.md', 'cephas', 'draft', 5, 3, ARRAY['pudding_essay', 'critiques']),
  ('pudding-currency-differential', 'Currency Differential', 'pudding_essay', 'BISHOP_DROPZONE/CEPHAS_PUDDING_REWRITE_CURRENCY_DIFFERENTIAL.md', 'cephas', 'draft', 5, 3, ARRAY['pudding_essay', 'currency']),
  ('pudding-lifeline-medications', 'Lifeline Medications', 'pudding_essay', 'BISHOP_DROPZONE/CEPHAS_PUDDING_REWRITE_LIFELINE_MEDICATIONS.md', 'cephas', 'draft', 5, 3, ARRAY['pudding_essay', 'health']),
  ('pudding-more-than-me', 'More Than Me', 'pudding_essay', 'BISHOP_DROPZONE/CEPHAS_PUDDING_REWRITE_MORE_THAN_ME.md', 'cephas', 'draft', 5, 3, ARRAY['pudding_essay', 'philosophy']),
  ('pudding-roommate-accountability', 'Roommate Accountability', 'pudding_essay', 'BISHOP_DROPZONE/CEPHAS_PUDDING_ROOMMATE_ACCOUNTABILITY.md', 'cephas', 'draft', 5, 3, ARRAY['pudding_essay', 'housing']),
  ('pudding-three-currency-intro', 'Three Currency Intro', 'pudding_essay', 'BISHOP_DROPZONE/CEPHAS_PUDDING_THREE_CURRENCY_INTRO.md', 'cephas', 'draft', 5, 2, ARRAY['pudding_essay', 'currency']),
  ('pudding-youre-in-charge', 'You''re in Charge of YOU', 'pudding_essay', 'BISHOP_DROPZONE/CEPHAS_PUDDING_YOURE_IN_CHARGE_OF_YOU.md', 'cephas', 'draft', 5, 2, ARRAY['pudding_essay', 'philosophy']),
  ('pudding-backer-election', 'Your Money, Your Choice: Backer Election', 'pudding_essay', 'BISHOP_DROPZONE/CEPHAS_PUDDING_BACKER_ELECTION.md', 'cephas', 'draft', 5, 2, ARRAY['pudding_essay', 'backer-election']),
  ('pudding-hood-uber', 'Hood Uber Proves the Need', 'pudding_essay', 'BISHOP_DROPZONE/PUDDING_23_HOOD_UBER_PROVES_THE_NEED.md', 'cephas', 'draft', 5, 3, ARRAY['pudding_essay', 'rideshare']),
  ('pudding-zero-storage', 'Zero Storage, Full Income', 'pudding_essay', 'BISHOP_DROPZONE/PUDDING_FULL/PUDDING_18_ZERO_STORAGE_FULL_INCOME.md', 'cephas', 'draft', 5, 3, ARRAY['pudding_essay', 'content-economy']),
  ('pudding-pearl-diver', 'Pearl Diver: Neighborhood Intelligence', 'pudding_essay', 'BISHOP_DROPZONE/PUDDING_FULL/PUDDING_19_PEARL_DIVER.md', 'cephas', 'draft', 5, 3, ARRAY['pudding_essay', 'pearl-diver']),
  ('pudding-five-dollar-classroom', 'The $5 Classroom', 'pudding_essay', 'BISHOP_DROPZONE/PUDDING_FULL/PUDDING_20_FIVE_DOLLAR_CLASSROOM.md', 'cephas', 'draft', 5, 3, ARRAY['pudding_essay', 'classroom']),
  ('pudding-first-ten-matter', 'Why the First 10 Matter', 'pudding_essay', 'BISHOP_DROPZONE/PUDDING_FULL/PUDDING_21_WHY_THE_FIRST_TEN_MATTER.md', 'cephas', 'draft', 5, 3, ARRAY['pudding_essay', 'pioneers']),
  ('pudding-four-currencies', 'Four Currencies, One Subscription', 'pudding_essay', 'BISHOP_DROPZONE/PUDDING_FULL/PUDDING_22_FOUR_CURRENCIES_ONE_SUBSCRIPTION.md', 'cephas', 'draft', 5, 3, ARRAY['pudding_essay', 'subscription'])
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- PART 10: Professional / legal letter
-- ============================================================

INSERT INTO helm_content_queue (slug, title, content_type, source_file_path, destination, status, priority, tags)
VALUES
  ('professional-legal-counsel', 'Legal Counsel Request', 'outreach_letter', 'Cephas/cephas-hugo/content/letters/professional/legal-counsel-request.md', 'email', 'draft', 4, ARRAY['outreach_letter', 'professional'])
ON CONFLICT (slug) DO NOTHING;
