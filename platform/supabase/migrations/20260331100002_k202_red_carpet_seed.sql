-- K202: Seed red_carpet_registry with all existing recipients (B053)
-- Source: platform/src/data/redCarpetRecipients.ts RECIPIENTS array
-- Idempotent: ON CONFLICT (slug) DO NOTHING

-- ═══════════════════════════════════════════════════════
-- CROWN LETTERS (21)
-- ═══════════════════════════════════════════════════════

INSERT INTO red_carpet_registry (slug, name, title, organization, bio, purpose, why_you, categories, known_emails, email_domains, walkthrough_config, initiatives, source, launch_flag, icon, category_label)
VALUES
  ('michael-seibel', 'Michael Seibel', 'Chief Executive Officer', 'Y Combinator',
   'Former CEO of Y Combinator, launched Twitch',
   'CEO of Liana Banyan Corporation',
   'You''ve spent your career finding founders who see what others miss. This platform was built by an engineer over 37 years — not a pitch deck founder. It has 2,007 documented innovations — 99% utility patents, not design — protected by 1,511 formal claims across 10 provisional applications. Eight definite with 9 more from the first 130 survived a deep dive with no prior art found. Economics constitutionally locked against extraction. The CEO seat was designed for a professional, not the founder''s ego. You''re the one we built it for.',
   ARRAY['crown'], ARRAY[]::text[], ARRAY['ycombinator.com','yc.com'],
   '{"theme":"gold","showInitiatives":["ceo"]}'::jsonb, ARRAY['ceo'],
   'import', 'AA', '👑', 'Crown Leadership'),

  ('sal-khan', 'Sal Khan', 'Chancellor', 'Khan Academy',
   'Founded Khan Academy, revolutionized free education',
   'Crown: Chancellor of Didasko (Academic/BOUNTY K-12)',
   'You proved education can be free and excellent. Didasko is the next step: a cooperative platform where educators keep 83.3% of every transaction and curriculum is shared, not gatekept. You didn''t just build a school — you built a philosophy. We''re building the infrastructure to scale it.',
   ARRAY['crown'], ARRAY[]::text[], ARRAY['khanacademy.org'],
   '{}'::jsonb, ARRAY['didasko'],
   'import', 'AB', '👑', 'Crown Leadership'),

  ('maneet-chauhan', 'Maneet Chauhan', 'Grand Chef', 'Let''s Make Dinner',
   'Celebrity chef, James Beard nominee, restaurant empire builder',
   'Crown: Grand Chef of Let''s Make Dinner',
   'You''ve built restaurants, competed on national television, and championed Nashville''s food culture. Let''s Make Dinner is neighbors feeding neighbors — home cooks sharing meals through a cooperative platform where 83.3% of every dollar goes to the cook. You understand that food is community. We need you to lead it.',
   ARRAY['crown'], ARRAY[]::text[], ARRAY['maneetchauhan.com','chauhan.com'],
   '{}'::jsonb, ARRAY['lets_make_dinner'],
   'import', 'BA', '👑', 'Crown Leadership'),

  ('mary-beth-laughton', 'Mary Beth Laughton', 'Merchant Mentor', 'REI',
   'Former SVP at REI, scaled ethical retail operations',
   'Crown: Merchant Mentor of Let''s Go Shopping',
   'You scaled ethical retail at REI to billions. Let''s Go Shopping is a marketplace where every merchant keeps 83.3% and the platform margin is constitutionally locked. You proved commerce can have values. We''re building the infrastructure that makes those values permanent.',
   ARRAY['crown'], ARRAY[]::text[], ARRAY['rei.com','rei.coop'],
   '{}'::jsonb, ARRAY['lets_go_shopping'],
   'import', 'BB', '👑', 'Crown Leadership'),

  ('cathie-mahon', 'Cathie Mahon', 'Lender Mentor', 'Inclusiv',
   'CEO of Inclusiv, national credit union network leader',
   'Crown: Lender Mentor of VSL',
   'You lead a network of credit unions serving 50 million people. VSL is peer-to-peer lending powered by cooperative economics — the credit union model taken to its logical conclusion. Community members back each other with transparent, non-extractive terms. Your expertise makes this real.',
   ARRAY['crown'], ARRAY[]::text[], ARRAY['inclusiv.org'],
   '{}'::jsonb, ARRAY['vsl'],
   'import', 'T', '👑', 'Crown Leadership'),

  ('kimberly-williams', 'Kimberly A. Williams', 'Responder General', 'Rally Group',
   'Emergency management leader, disaster response expert',
   'Crown: Responder General of Rally Group',
   'When disaster strikes, you''re the one who coordinates the response. Rally Group is community crisis response through cooperative infrastructure — mutual aid with real logistics. We need someone who knows what ''boots on the ground'' actually means.',
   ARRAY['crown'], ARRAY[]::text[], ARRAY[]::text[],
   '{}'::jsonb, ARRAY['rally_group'],
   'import', 'T', '👑', 'Crown Leadership'),

  ('taylor-swift', 'Taylor Swift', 'Maestro Mentor', 'JukeBox',
   'Artist who fought for creator rights, masters battle icon',
   'Crown: Maestro Mentor of JukeBox',
   'You fought for your masters when the industry said artists don''t control their work. You re-recorded entire albums to prove a point. JukeBox is a music platform where artists keep 83.3% of every stream, sale, and license — and that number is constitutionally locked. No one can ever change it. You fought for creator rights. We built it into the DNA.',
   ARRAY['crown'], ARRAY[]::text[], ARRAY['taylorswift.com','13management.com'],
   '{}'::jsonb, ARRAY['jukebox'],
   'import', 'BC', '👑', 'Crown Leadership'),

  ('jose-andres', 'José Andrés', 'Provisioner', 'World Central Kitchen',
   'Chef who founded World Central Kitchen, fed millions in disasters',
   'Crown: Provisioner of Let''s Get Groceries',
   'You''ve fed millions in the worst moments of their lives. Let''s Get Groceries is cooperative provisioning at scale — connecting communities directly to producers. You know that feeding people isn''t charity; it''s infrastructure. We need the Provisioner who understands that.',
   ARRAY['crown'], ARRAY[]::text[], ARRAY['wck.org','thinkfoodgroup.com'],
   '{}'::jsonb, ARRAY['lets_get_groceries'],
   'import', 'BB', '👑', 'Crown Leadership'),

  ('dale-dougherty', 'Dale Dougherty', 'Industry Chancellor', 'Make Magazine',
   'Founded Make Magazine, godfather of the Maker Movement',
   'Crown: Industry Chancellor of Let''s Make Bread',
   'You didn''t just start a magazine — you started a movement. Makers worldwide build because you showed them they could. Let''s Make Bread is distributed manufacturing where makers keep 83.3%. From 3D printing to woodworking, artisans sell through a platform that can never extract more than Cost+20%. You built the movement. We built the marketplace.',
   ARRAY['crown'], ARRAY[]::text[], ARRAY['make.co','makermedia.com','makezine.com'],
   '{}'::jsonb, ARRAY['lets_make_bread'],
   'import', 'BA', '👑', 'Crown Leadership'),

  ('ruth-glenn', 'Ruth Glenn', 'First Shield', 'NCADV',
   'Led NCADV, national voice for domestic violence survivors',
   'Crown: First Shield of Defense Klaus',
   'You''ve spent your career protecting people from the ones who should love them most. Defense Klaus is domestic violence protection through cooperative infrastructure — safety planning, emergency resources, and community shields. ''For Someone You Love'' isn''t a tagline. It''s a promise. You''re the one who makes it real.',
   ARRAY['crown'], ARRAY[]::text[], ARRAY['ncadv.org'],
   '{}'::jsonb, ARRAY['defense_klaus'],
   'import', 'T', '👑', 'Crown Leadership'),

  ('alex-oshmyansky', 'Alex Oshmyansky', 'Apothecary', 'Cost Plus Drugs',
   'Founded Mark Cuban Cost Plus Drugs, slashed medication prices',
   'Crown: Apothecary of Tatiana Schlossburg Health Accords',
   'You proved medications don''t have to cost what they cost. Cost Plus Drugs showed the world what transparent pricing looks like. The Tatiana Schlossburg Health Accords apply that same principle — Cost+20% — through a cooperative platform where the margin is constitutionally locked. You built the proof of concept. We built the permanent infrastructure.',
   ARRAY['crown'], ARRAY[]::text[], ARRAY['costplusdrugs.com','markcubancostplusdrugs.com'],
   '{}'::jsonb, ARRAY['lifeline'],
   'import', 'T', '👑', 'Crown Leadership'),

  ('jessica-jackley', 'Jessica Jackley', 'Lender Mentor', 'Kiva',
   'Co-founded Kiva, pioneered peer-to-peer microloans',
   'Crown: Lender Mentor of VSL (backup)',
   'You co-founded Kiva and proved that regular people will lend to strangers when the platform is transparent. VSL is peer-to-peer lending with cooperative economics — the model you pioneered, with constitutional protections against extraction built into the DNA.',
   ARRAY['crown'], ARRAY[]::text[], ARRAY['kiva.org'],
   '{}'::jsonb, ARRAY['vsl'],
   'import', 'T', '👑', 'Crown Leadership'),

  ('robert-kaiser', 'Robert Kaiser', 'First Shield UK', '',
   'UK-based defense/safety leader',
   'Crown: First Shield UK (international)',
   'Defense Klaus needs international reach. The UK model will prove that cooperative protection works across borders and legal systems. You''re the international expansion of a promise: for someone you love.',
   ARRAY['crown'], ARRAY[]::text[], ARRAY[]::text[],
   '{}'::jsonb, ARRAY['defense_klaus'],
   'import', 'T', '👑', 'Crown Leadership'),

  ('marie-kondo', 'Marie Kondo', 'Steward Mentor', 'KonMari',
   'Home organization icon, ''spark joy'' methodology worldwide',
   'Crown: Steward Mentor of Home Logistics',
   'You taught the world that organizing your home is organizing your life. Household Concierge is home logistics through cooperative infrastructure — service providers keep 83.3% and members get transparent pricing. Joy isn''t just a feeling; it''s a system. We need the Steward who understands that.',
   ARRAY['crown'], ARRAY[]::text[], ARRAY['konmari.com'],
   '{}'::jsonb, ARRAY['home_logistics'],
   'import', 'H', '👑', 'Crown Leadership'),

  ('sallie-krawcheck', 'Sallie Krawcheck', 'Treasury Mentor', 'Ellevest',
   'Former Wall Street exec, founded Ellevest for women''s finance',
   'Crown: Treasury Mentor of MSA',
   'You left Wall Street to build financial tools for the people Wall Street ignores. MSA is community treasury infrastructure built on cooperative principles. You understand that banking can serve people instead of extracting from them. We need the Treasury Mentor who proved it.',
   ARRAY['crown'], ARRAY[]::text[], ARRAY['ellevest.com'],
   '{}'::jsonb, ARRAY['msa'],
   'import', 'H', '👑', 'Crown Leadership'),

  ('brene-brown', 'Brené Brown', 'Harper Prime', 'Harper Guild',
   'Researcher on vulnerability and trust, ''Daring Greatly'' author',
   'Crown: Harper Prime of Harper Guild',
   'You''ve spent decades researching what makes communities trust each other. Harper Guild trains community facilitators who resolve conflicts, onboard new members, and maintain cooperative culture. Trust isn''t soft — it''s infrastructure. You''re the researcher who proved it. We need the Harper Prime who lives it.',
   ARRAY['crown'], ARRAY[]::text[], ARRAY['brenebrown.com'],
   '{}'::jsonb, ARRAY['harper_guild'],
   'import', 'H', '👑', 'Crown Leadership'),

  ('muhammad-yunus', 'Muhammad Yunus', 'Commerce Secretary', 'Grameen Bank',
   'Nobel laureate, founded Grameen Bank, global microfinance pioneer',
   'Crown: Commerce Secretary (International)',
   'You won the Nobel Prize for proving that poor people are creditworthy. Grameen Bank changed the world. The International initiative takes cooperative economics global with PPP adjustment — the same DNA Lock, the same 83.3%, calibrated for local purchasing power. You built the proof. We built the scale.',
   ARRAY['crown'], ARRAY[]::text[], ARRAY['grameen.com','yunuscentre.org'],
   '{}'::jsonb, ARRAY['international'],
   'import', 'H', '👑', 'Crown Leadership'),

  ('alexandria-ocasio-cortez', 'Alexandria Ocasio-Cortez', 'Door-Opener (Left)', 'Power to the People',
   'U.S. Representative, civic engagement champion, cooperative economics advocate',
   'Crown: Door-Opener (Left) — Power to the People',
   'You bartended. You organized. You ran. You won. The cooperative encodes into an operating agreement what you''ve been arguing for in legislation — every member earns governance rights through contribution. Initiative #15 needs a leader who understands that civic participation and economic participation are the same fight.',
   ARRAY['crown'], ARRAY[]::text[], ARRAY['ocasiocortez.com','mail.house.gov'],
   '{}'::jsonb, ARRAY['power_to_the_people'],
   'import', 'H', '👑', 'Crown Leadership'),

  ('arnold-schwarzenegger', 'Arnold Schwarzenegger', 'Door-Opener (Right)', 'Power to the People',
   'Former Governor, actor, advocate for bipartisan civic engagement',
   'Crown: Door-Opener (Right) — Power to the People',
   'You told graduates there is no such thing as a self-made man, then listed every person who helped you. Two Door-Opening Crowns — left and right — prove cooperative economics is not partisan. If both doors open, people on every side of the aisle walk through the same entrance into the same cooperative.',
   ARRAY['crown'], ARRAY[]::text[], ARRAY['schwarzenegger.com'],
   '{}'::jsonb, ARRAY['power_to_the_people'],
   'import', 'H', '👑', 'Crown Leadership'),

  ('keanu-reeves', 'Keanu Reeves', 'Builder (Culture)', 'Power to the People',
   'Actor, quiet philanthropist, universally respected for genuine humility',
   'Crown: Builder (Culture) — Power to the People',
   'You gave your Matrix earnings to the special effects and costume design crews. You ride the subway. You gave up your seat. The Builder Crown (Culture) demonstrates that civic participation and mutual generosity are the same impulse. You already live the way this platform asks people to live.',
   ARRAY['crown'], ARRAY[]::text[], ARRAY[]::text[],
   '{}'::jsonb, ARRAY['power_to_the_people'],
   'import', 'H', '👑', 'Crown Leadership'),

  ('sandra-bullock', 'Sandra Bullock', 'Builder (Action)', 'Power to the People',
   'Academy Award winner, quiet disaster relief builder, community infrastructure advocate',
   'Crown: Builder (Action) — Power to the People',
   'After Katrina, you gave a million dollars. After the tsunami, a million. After Harvey, a million. After the wildfires, a million. And in between, you built the actual infrastructure of recovery most people never see. The Builder Crown (Action) is the operational seat — infrastructure, logistics, the unsexy machinery of sustained civic engagement.',
   ARRAY['crown'], ARRAY[]::text[], ARRAY[]::text[],
   '{}'::jsonb, ARRAY['power_to_the_people'],
   'import', 'H', '👑', 'Crown Leadership')
ON CONFLICT (slug) DO NOTHING;

-- ═══════════════════════════════════════════════════════
-- HIGH-VALUE PERSONAL (2)
-- ═══════════════════════════════════════════════════════

INSERT INTO red_carpet_registry (slug, name, title, organization, bio, purpose, why_you, categories, known_emails, email_domains, walkthrough_config, initiatives, source, launch_flag, icon, category_label)
VALUES
  ('mackenzie-scott', 'MacKenzie Scott', NULL, 'Philanthropist',
   'Philanthropist, gave away $17B+ with no strings attached',
   'Major funder — believes in giving without control',
   'You give without strings. You trust organizations to know what they need. This platform was built with half a family''s emergency savings and a prayer for potatoes at the end of a hoe handle. We don''t want your money — we want your rolodex. Three references from people who understand cooperative economics. That''s it.',
   ARRAY['high-value'], ARRAY[]::text[], ARRAY['losthorsepress.org','yielding.com'],
   '{}'::jsonb, ARRAY[]::text[],
   'import', 'AA', '💎', 'Strategic Partnership'),

  ('warren-buffett', 'Warren Buffett', NULL, 'Berkshire Hathaway',
   'Oracle of Omaha, value-focused contributor, cooperative economics thinker',
   'Contribution philosophy alignment, credibility anchor',
   'You''ve spent sixty years proving that value-focused backing beats speculation. This platform''s economics are designed the same way — predictable service value, transparent margins, constitutional guardrails against extraction. Cost+20% isn''t a policy; it''s a DNA Lock. The economics can''t degrade because they''re structurally locked.',
   ARRAY['high-value'], ARRAY[]::text[], ARRAY['berkshirehathaway.com'],
   '{}'::jsonb, ARRAY[]::text[],
   'import', 'T', '💎', 'Strategic Partnership')
ON CONFLICT (slug) DO NOTHING;

-- ═══════════════════════════════════════════════════════
-- JOURNALIST & MEDIA (7)
-- ═══════════════════════════════════════════════════════

INSERT INTO red_carpet_registry (slug, name, title, organization, bio, purpose, why_you, categories, known_emails, email_domains, walkthrough_config, initiatives, source, launch_flag, icon, category_label)
VALUES
  ('casey-newton', 'Casey Newton', NULL, 'Platformer',
   'Writes Platformer newsletter, top tech platform critic',
   'Coverage — he covers exactly what we''re disrupting',
   'You write about platform power every day. What happens when a platform constitutionally locks its margin at Cost+20%, gives creators 83.3%, and makes the economics impossible to change? That''s not a thought experiment. We built it.',
   ARRAY['journalist'], ARRAY[]::text[], ARRAY['platformer.news'],
   '{}'::jsonb, ARRAY[]::text[],
   'import', 'AB', '📰', 'Press & Media'),

  ('cory-doctorow', 'Cory Doctorow', NULL, 'Pluralistic',
   'Coined ''enshittification,'' novelist, digital rights champion',
   'Coverage — his thesis IS our business model',
   'You named the disease. We built the cure. ''Enshittification'' describes what happens when platforms extract from users to please investors. This platform has a DNA Lock — constitutional economics that literally cannot change. Cost+20%. 83.3% to creators. Locked. Forever.',
   ARRAY['journalist'], ARRAY[]::text[], ARRAY['craphound.com','pluralistic.net'],
   '{}'::jsonb, ARRAY[]::text[],
   'import', 'AB', '📰', 'Press & Media'),

  ('molly-white', 'Molly White', NULL, 'Web3 Is Going Great',
   'Runs ''Web3 Is Going Great,'' skeptic of tech grift',
   'Coverage — we''re the real thing she''s been looking for',
   'You''ve spent years proving that ''decentralized'' platforms are usually centralized grift. We''re not crypto. We''re not blockchain. We''re a cooperative with constitutional economics and a DNA Lock that prevents the founder from changing the deal. Come be skeptical. We built this for skeptics.',
   ARRAY['journalist'], ARRAY[]::text[], ARRAY['mollywhite.net'],
   '{}'::jsonb, ARRAY[]::text[],
   'import', 'AC', '📰', 'Press & Media'),

  ('tim-ingham', 'Tim Ingham', NULL, 'Music Business Worldwide',
   'Founded Music Business Worldwide, music industry analyst',
   'Coverage — JukeBox directly addresses his reporting',
   'You report on an industry where artists get fractions of pennies per stream. JukeBox gives artists 83.3% of every transaction — streams, sales, licenses — with that number constitutionally locked. You''ve documented the problem for years. Here''s the infrastructure that fixes it.',
   ARRAY['journalist'], ARRAY[]::text[], ARRAY['musicbusinessworldwide.com'],
   '{}'::jsonb, ARRAY['jukebox'],
   'import', 'BA', '📰', 'Press & Media'),

  ('paris-marx', 'Paris Marx', NULL, 'Tech Won''t Save Us',
   'Hosts ''Tech Won''t Save Us'' podcast, tech labor critic',
   'Coverage — our cooperative model answers his critique',
   'Your whole thesis is that tech platforms exploit workers. What happens when the tech platform is a cooperative where workers keep 83.3%, governance is limited to 300 members with rotation, and the economics are constitutionally locked? Tech won''t save us — but cooperative tech might.',
   ARRAY['journalist'], ARRAY[]::text[], ARRAY[]::text[],
   '{}'::jsonb, ARRAY[]::text[],
   'import', 'BB', '📰', 'Press & Media'),

  ('ed-zitron', 'Ed Zitron', NULL, 'Better Offline',
   'Writes ''Better Offline,'' corporate tech accountability',
   'Coverage — platform accountability is his beat',
   'You hold tech companies accountable when they break promises. We built a platform where the promises are constitutionally locked — DNA Lock, Cost+20%, 83.3% to creators. These aren''t policies that a board can override. They''re structural.',
   ARRAY['journalist'], ARRAY[]::text[], ARRAY['ezpr.com'],
   '{}'::jsonb, ARRAY[]::text[],
   'import', 'BB', '📰', 'Press & Media'),

  ('brian-merchant', 'Brian Merchant', NULL, 'Author',
   'Author of ''Blood in the Machine,'' tech labor historian',
   'Coverage — cooperative labor is his historical thesis',
   'You wrote the history of workers fighting machines. This is the machine that fights for workers. Cooperative economics, constitutional protections, 83.3% to creators. The Luddites weren''t against technology — they were against technology that extracted from labor. So are we.',
   ARRAY['journalist'], ARRAY[]::text[], ARRAY[]::text[],
   '{}'::jsonb, ARRAY[]::text[],
   'import', 'BA', '📰', 'Press & Media')
ON CONFLICT (slug) DO NOTHING;

-- ═══════════════════════════════════════════════════════
-- ACADEMICS (8)
-- ═══════════════════════════════════════════════════════

INSERT INTO red_carpet_registry (slug, name, title, organization, bio, purpose, why_you, categories, known_emails, email_domains, walkthrough_config, initiatives, source, launch_flag, icon, category_label)
VALUES
  ('trebor-scholz', 'Trebor Scholz', NULL, 'The New School',
   'The New School — coined ''platform cooperativism''',
   'Academic ally — literally named what we''re building',
   'You coined ''platform cooperativism.'' We built it. 2,007 innovations — 99% utility patents — protected by 1,511 formal claims across 10 provisional applications.',
   ARRAY['academic'], ARRAY[]::text[], ARRAY['newschool.edu'],
   '{}'::jsonb, ARRAY[]::text[],
   'import', 'AC', '🎓', 'Academic Partnership'),

  ('nathan-schneider', 'Nathan Schneider', NULL, 'CU Boulder',
   'CU Boulder — writes about cooperative governance models',
   'Academic ally — cooperative governance scholar',
   'You study how cooperatives govern themselves. We built The 300 Framework — hard-coded organization size limits with defined overflow mechanics, a Steward/Red Queen dual governance model, and a DNA Lock that makes constitutional economics immutable.',
   ARRAY['academic'], ARRAY[]::text[], ARRAY['colorado.edu'],
   '{}'::jsonb, ARRAY[]::text[],
   'import', 'AC', '🎓', 'Academic Partnership'),

  ('erik-brynjolfsson', 'Erik Brynjolfsson', NULL, 'Stanford',
   'Stanford — studies technology''s impact on economy/labor',
   'Academic ally — AI + labor economics authority',
   'You study what happens when technology reshapes labor markets. We built a platform where the AI serves the cooperative — context management, innovation extraction, agent coordination — but the economics are locked in favor of humans. 83.3% to creators. Constitutional. Permanent.',
   ARRAY['academic'], ARRAY[]::text[], ARRAY['stanford.edu'],
   '{}'::jsonb, ARRAY[]::text[],
   'import', 'BA', '🎓', 'Academic Partnership'),

  ('juliet-schor', 'Juliet Schor', NULL, 'Boston College',
   'Boston College — sharing economy & overwork researcher',
   'Academic ally — proves gig economy fails workers',
   'Your research proved the sharing economy exploits workers. We built the cooperative alternative: transparent pricing, constitutional margins, 83.3% to providers. This isn''t the sharing economy rebranded — it''s the sharing economy redesigned with structural protections.',
   ARRAY['academic'], ARRAY[]::text[], ARRAY['bc.edu'],
   '{}'::jsonb, ARRAY[]::text[],
   'import', 'BB', '🎓', 'Academic Partnership'),

  ('yochai-benkler', 'Yochai Benkler', NULL, 'Harvard Law',
   'Harvard Law — peer production & commons theory',
   'Academic ally — his theory of commons IS our platform',
   'You theorized peer production and the networked commons. We built the commercial infrastructure for it — a platform where commons-based production meets constitutional economics.',
   ARRAY['academic'], ARRAY[]::text[], ARRAY['law.harvard.edu','harvard.edu'],
   '{}'::jsonb, ARRAY[]::text[],
   'import', 'BB', '🎓', 'Academic Partnership'),

  ('arun-sundararajan', 'Arun Sundararajan', NULL, 'NYU Stern',
   'NYU Stern — sharing economy & platform economics',
   'Academic ally — platform business model expert',
   'You wrote the book on platform business models. Here''s one that breaks every rule: Cost+20% constitutional margin, 83.3% to creators, DNA Lock against extraction.',
   ARRAY['academic'], ARRAY[]::text[], ARRAY['stern.nyu.edu','nyu.edu'],
   '{}'::jsonb, ARRAY[]::text[],
   'import', 'BC', '🎓', 'Academic Partnership'),

  ('daron-acemoglu', 'Daron Acemoglu', NULL, 'MIT',
   'MIT — Nobel laureate, ''Why Nations Fail,'' institutional economics',
   'Academic credibility — institutional design authority',
   'You won the Nobel Prize for proving that institutions determine prosperity. We built a digital institution with constitutional economics — DNA Lock, The 300 Framework, Steward/Red Queen governance — designed so the institution cannot extract from its members.',
   ARRAY['academic'], ARRAY[]::text[], ARRAY['mit.edu'],
   '{}'::jsonb, ARRAY[]::text[],
   'import', 'BC', '🎓', 'Academic Partnership'),

  ('mariana-mazzucato', 'Mariana Mazzucato', NULL, 'UCL',
   'UCL — ''The Entrepreneurial State,'' mission-oriented economics',
   'Academic ally — public value creation framework',
   'You argue that the state creates value, not just the market. This platform creates public value through cooperative commerce — 16 charitable initiatives funded by constitutional 20% margins. Mission-oriented economics, implemented.',
   ARRAY['academic'], ARRAY[]::text[], ARRAY['ucl.ac.uk'],
   '{}'::jsonb, ARRAY[]::text[],
   'import', 'H', '🎓', 'Academic Partnership')
ON CONFLICT (slug) DO NOTHING;

-- ═══════════════════════════════════════════════════════
-- THOUGHT LEADERS (3)
-- ═══════════════════════════════════════════════════════

INSERT INTO red_carpet_registry (slug, name, title, organization, bio, purpose, why_you, categories, known_emails, email_domains, walkthrough_config, initiatives, source, launch_flag, icon, category_label)
VALUES
  ('esther-perel', 'Esther Perel', NULL, NULL,
   'Therapist, relationship/trust expert, top podcast host',
   'Amplifier — trust & community resonance',
   'You understand that trust is built through vulnerability and accountability. This platform''s entire architecture is a trust machine — transparent economics, constitutional protections, Harper Guild facilitators.',
   ARRAY['thought-leader'], ARRAY[]::text[], ARRAY['estherperel.com'],
   '{}'::jsonb, ARRAY[]::text[],
   'import', 'BC', '🧠', 'Thought Leadership'),

  ('simon-sinek', 'Simon Sinek', NULL, NULL,
   '''Start With Why'' author, purpose-driven leadership icon',
   'Amplifier — our ''why'' is his entire framework',
   'You taught the world to start with why. Our why: help each other help ourselves. The Golden Key. Every decision — Cost+20%, 83.3% to creators, DNA Lock, The 300 — flows from that single principle.',
   ARRAY['thought-leader'], ARRAY[]::text[], ARRAY['simonsinek.com','optimismpress.com'],
   '{}'::jsonb, ARRAY[]::text[],
   'import', 'BA', '🧠', 'Thought Leadership'),

  ('seth-godin', 'Seth Godin', NULL, NULL,
   'Marketing legend, ''Tribes'' author, permission marketing',
   'Amplifier — cooperative tribes is his thesis applied',
   'You wrote about tribes before platforms existed. Now platforms have tribes — but they extract from them. We built a platform where the tribe owns the economics: 83.3% to creators, constitutional margins, governance limited to 300 members with overflow mechanics.',
   ARRAY['thought-leader'], ARRAY[]::text[], ARRAY['sethgodin.com','squidoo.com'],
   '{}'::jsonb, ARRAY[]::text[],
   'import', 'BB', '🧠', 'Thought Leadership')
ON CONFLICT (slug) DO NOTHING;

-- ═══════════════════════════════════════════════════════
-- OUTREACH (14)
-- ═══════════════════════════════════════════════════════

INSERT INTO red_carpet_registry (slug, name, title, organization, bio, purpose, why_you, categories, known_emails, email_domains, walkthrough_config, initiatives, source, launch_flag, icon, category_label)
VALUES
  ('anand-giridharadas', 'Anand Giridharadas', NULL, NULL,
   '''Winners Take All'' author, philanthropy critic',
   'Narrative ally — our model answers his critique',
   'You wrote that the elite ''change the world'' in ways that preserve their power. This platform is the structural answer: cooperative economics that cannot be captured, constitutional margins that cannot be extracted, and governance that rotates by design.',
   ARRAY['outreach'], ARRAY[]::text[], ARRAY['anand.ly'],
   '{}'::jsonb, ARRAY[]::text[], 'import', 'AB', '📢', 'Strategic Outreach'),

  ('hank-green', 'Hank Green', NULL, 'Complexly',
   'Creator economy advocate, built creator-first platforms',
   'Ally — creator economics pioneer',
   'You''ve built platforms that put creators first. We took it further: 83.3% to creators, constitutionally locked. No future board, no future CEO, no future backer can ever change that number.',
   ARRAY['outreach'], ARRAY[]::text[], ARRAY['complexly.com','dftba.com'],
   '{}'::jsonb, ARRAY[]::text[], 'import', 'BA', '📢', 'Strategic Outreach'),

  ('li-jin', 'Li Jin', NULL, 'Atelier Ventures',
   'Atelier Ventures, passion economy & creator participation',
   'Sponsor/ally — creator-driven platform thesis',
   'You back the passion economy and creator participation. This is a platform where creators genuinely control their economics — 83.3% constitutionally locked, three-gear currency, Joules with platform benefit rights.',
   ARRAY['outreach'], ARRAY[]::text[], ARRAY['atelierventures.co','atelier.com'],
   '{}'::jsonb, ARRAY[]::text[], 'import', 'BA', '📢', 'Strategic Outreach'),

  ('craig-newmark', 'Craig Newmark', NULL, 'Craigslist',
   'Founded Craigslist, now philanthropist for trustworthy info',
   'Funder/ally — community platform pioneer',
   'You built the original community platform — simple, useful, not extractive. Then you watched every platform after yours become extractive. We built the one that can''t. Constitutional economics, DNA Lock, 83.3% to users.',
   ARRAY['outreach'], ARRAY[]::text[], ARRAY['craigslist.org','craignewmarkphilanthropies.org'],
   '{}'::jsonb, ARRAY[]::text[], 'import', 'BB', '📢', 'Strategic Outreach'),

  ('douglas-rushkoff', 'Douglas Rushkoff', NULL, NULL,
   '''Throwing Rocks at the Google Bus,'' cooperative economics writer',
   'Narrative ally — cooperative digital economics',
   'You argued that the digital economy should serve people, not extract from them. We built the platform that does: cooperative commerce with constitutional margins, 83.3% to creators, and a DNA Lock that prevents extraction.',
   ARRAY['outreach'], ARRAY[]::text[], ARRAY['rushkoff.com'],
   '{}'::jsonb, ARRAY[]::text[], 'import', 'BB', '📢', 'Strategic Outreach'),

  ('ai-jen-poo', 'Ai-jen Poo', NULL, 'NDWA',
   'National Domestic Workers Alliance leader',
   'Labor ally — domestic worker cooperative champion',
   'You fight for domestic workers who are invisible to the economy. Household Concierge puts those workers on a cooperative platform where they keep 83.3% — with transparent pricing, no algorithmic wage theft, and constitutional protections.',
   ARRAY['outreach'], ARRAY[]::text[], ARRAY['domesticworkers.org'],
   '{}'::jsonb, ARRAY['home_logistics'], 'import', 'BC', '📢', 'Strategic Outreach'),

  ('majora-carter', 'Majora Carter', NULL, NULL,
   'Urban revitalization, community self-determination',
   'Ally — grassroots cooperative economics in action',
   'You''ve spent decades proving that communities can revitalize themselves without being displaced by the revitalization. Cooperative commerce with constitutional margins is the economic infrastructure for that vision.',
   ARRAY['outreach'], ARRAY[]::text[], ARRAY['majoracarter.com'],
   '{}'::jsonb, ARRAY[]::text[], 'import', 'BC', '📢', 'Strategic Outreach'),

  ('howard-marks', 'Howard Marks', NULL, 'Oaktree Capital',
   'Oaktree Capital, writes contribution memos on value',
   'Backer framing — value contribution alignment',
   'Your memos are legendary because you think about risk differently. This platform''s economics are designed to eliminate the biggest risk in tech: extraction creep. Cost+20% is constitutionally locked.',
   ARRAY['outreach'], ARRAY[]::text[], ARRAY['oaktreecapital.com'],
   '{}'::jsonb, ARRAY[]::text[], 'import', 'T', '📢', 'Strategic Outreach'),

  ('kara-swisher', 'Kara Swisher', NULL, NULL,
   'Top tech journalist, podcast host, industry access',
   'Media — she opens doors to everyone',
   'You''ve interviewed every tech CEO alive and asked the questions they don''t want to answer. Here''s a platform that answers them all before you ask: transparent margins, constitutional economics, 83.3% to creators, DNA Lock against extraction.',
   ARRAY['outreach'], ARRAY[]::text[], ARRAY['karaswisher.com','vox.com'],
   '{}'::jsonb, ARRAY[]::text[], 'import', 'T', '📢', 'Strategic Outreach'),

  ('ezra-klein', 'Ezra Klein', NULL, 'New York Times',
   'NYT opinion, policy deep-dives, massive audience',
   'Media — policy framing for cooperative commerce',
   'You make policy understandable. Cooperative commerce with constitutional economics is a policy story waiting to be told — what happens when a platform is structurally prevented from extracting?',
   ARRAY['outreach'], ARRAY[]::text[], ARRAY['nytimes.com'],
   '{}'::jsonb, ARRAY[]::text[], 'import', 'T', '📢', 'Strategic Outreach'),

  ('melinda-french-gates', 'Melinda French Gates', NULL, 'Pivotal Ventures',
   'Philanthropist, Pivotal Ventures, economic empowerment focus',
   'Major funder — women''s economic empowerment',
   'You fund women''s economic empowerment. This platform gives women entrepreneurs 83.3% of every transaction — constitutionally locked. From Let''s Make Dinner to Harper Guild to MSA, women lead the initiatives.',
   ARRAY['outreach'], ARRAY[]::text[], ARRAY['pivotalventures.org','gatesfoundation.org'],
   '{}'::jsonb, ARRAY[]::text[], 'import', 'H', '📢', 'Strategic Outreach'),

  ('shoshana-zuboff', 'Shoshana Zuboff', NULL, 'Harvard',
   'Harvard, ''Surveillance Capitalism'' author',
   'Academic/ally — her critique, our answer',
   'You diagnosed surveillance capitalism. We built the antidote: zero-PII policy, no behavioral data extraction, no attention economy. The platform makes money through transparent margins, not surveillance.',
   ARRAY['outreach'], ARRAY[]::text[], ARRAY['hbs.edu'],
   '{}'::jsonb, ARRAY[]::text[], 'import', 'H', '📢', 'Strategic Outreach'),

  ('kate-raworth', 'Kate Raworth', NULL, NULL,
   '''Doughnut Economics'' author, regenerative economics',
   'Academic/ally — her economic model maps to ours',
   'You drew the doughnut — the safe space between social foundation and ecological ceiling. This platform operates inside it: constitutional margins prevent overshoot, cooperative economics ensure the social foundation.',
   ARRAY['outreach'], ARRAY[]::text[], ARRAY['kateraworth.com'],
   '{}'::jsonb, ARRAY[]::text[], 'import', 'H', '📢', 'Strategic Outreach'),

  ('nilay-patel', 'Nilay Patel', NULL, 'The Verge',
   'Editor-in-Chief of The Verge, platform policy voice',
   'Media — platform accountability coverage',
   'You''ve covered every platform''s rise and every platform''s betrayal. Here''s one built so the betrayal is architecturally impossible. Constitutional economics, DNA Lock, 83.3% to creators.',
   ARRAY['outreach'], ARRAY[]::text[], ARRAY['theverge.com','voxmedia.com'],
   '{}'::jsonb, ARRAY[]::text[], 'import', 'H', '📢', 'Strategic Outreach')
ON CONFLICT (slug) DO NOTHING;

-- ═══════════════════════════════════════════════════════
-- BLESSING LETTERS (3)
-- ═══════════════════════════════════════════════════════

INSERT INTO red_carpet_registry (slug, name, title, organization, bio, purpose, why_you, categories, known_emails, email_domains, walkthrough_config, initiatives, source, launch_flag, icon, category_label)
VALUES
  ('dolly-parton', 'Dolly Parton', NULL, 'Dollywood',
   'Country legend, Imagination Library, beloved universally',
   'Blessing — cultural credibility, heartland trust',
   'You gave away 200 million books because every child deserves to read. This platform gives creators 83.3% because every person''s work has value.',
   ARRAY['blessing'], ARRAY[]::text[], ARRAY['dollywood.com','dollyparton.com'],
   '{}'::jsonb, ARRAY[]::text[], 'import', 'BC', '🎵', 'Cultural Blessing'),

  ('jimmy-kimmel', 'Jimmy Kimmel', NULL, 'ABC',
   'Late night host, healthcare advocacy, broad audience',
   'Blessing — mainstream visibility, healthcare angle',
   'You stood on national television and cried about healthcare because your son nearly died. The Tatiana Schlossburg Health Accords give members access to medicine at Cost+20%.',
   ARRAY['blessing'], ARRAY[]::text[], ARRAY['abc.com'],
   '{}'::jsonb, ARRAY['lifeline'], 'import', 'T', '🎵', 'Cultural Blessing'),

  ('pitbull', 'Pitbull', NULL, NULL,
   'Mr. Worldwide, charter school founder, hustle embodied',
   'Blessing — multicultural reach, entrepreneurship',
   'You built charter schools because education should be accessible. You built a brand because hustle should be rewarded. This platform gives entrepreneurs 83.3% and funds 16 charitable initiatives including education.',
   ARRAY['blessing'], ARRAY[]::text[], ARRAY['pitbullmusic.com','mrworldwide.com'],
   '{}'::jsonb, ARRAY[]::text[], 'import', 'T', '🎵', 'Cultural Blessing')
ON CONFLICT (slug) DO NOTHING;

-- ═══════════════════════════════════════════════════════
-- FAMILY / CUE CARD RECIPIENTS (3 + 1 pushed)
-- ═══════════════════════════════════════════════════════

INSERT INTO red_carpet_registry (slug, name, title, organization, bio, purpose, why_you, categories, known_emails, email_domains, walkthrough_config, initiatives, source, launch_flag, icon, category_label)
VALUES
  ('amarissa-jones', 'Amarissa Jones', NULL, NULL,
   'LB''s first paid Influencer',
   'Content Creator / Influencer / Pearl Diver / TasteMaker',
   'You''re creative, you''re fast, and you already know how to make content people watch. $5,500 worth of work across 9 categories — pick what you want, skip what you don''t. Your phone is your office.',
   ARRAY['family'], ARRAY['amarissa.vigil.111@gmail.com'], ARRAY[]::text[],
   '{}'::jsonb, ARRAY[]::text[], 'import', 'F', '🎬', 'Family / Pioneer'),

  ('diana-jones', 'Diana Jones', NULL, 'House Viridis',
   'Photographer + Pearl Diver',
   'Business Photographer / Resource Intelligence Scout',
   'You already see what others miss. You already know which thrift store has 50% off on Tuesdays. Now it counts. Now it earns Marks.',
   ARRAY['family'], ARRAY['vigilfenix@gmail.com','diana@houseviridis.com'], ARRAY['houseviridis.com'],
   '{}'::jsonb, ARRAY[]::text[], 'import', 'F', '📸', 'Family / Pioneer'),

  ('alford-hunter', 'Alford Hunter', NULL, NULL,
   'Godfather — Charitable Steward & Platform Explorer',
   'Guided Tour → Charitable Focus → Self-Funding Model',
   'You''ve always seen what I was trying to do. Now you can see it. Over two decades of building — live software, filed patents, a cooperative about to launch.',
   ARRAY['family'], ARRAY['bachelorsalad@gmail.com'], ARRAY[]::text[],
   '{}'::jsonb, ARRAY[]::text[], 'import', 'F', '🌳', 'Family / Pioneer'),

  ('jones-family', 'Jones Family', NULL, NULL,
   'The Founder''s family — first testers, first believers',
   'Family testing and feedback',
   'Welcome home. Dad built this for us. All 16 initiatives, all the tools, all the economics — this is what 37 years of work looks like. Help me test it. Break it. Tell me what you think.',
   ARRAY['family'], ARRAY[]::text[], ARRAY['family'],
   '{}'::jsonb, ARRAY[]::text[], 'import', 'F', '🏠', 'Family')
ON CONFLICT (slug) DO NOTHING;
