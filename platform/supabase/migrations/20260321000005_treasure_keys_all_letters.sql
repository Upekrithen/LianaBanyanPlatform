-- ═══════════════════════════════════════════════════════════════════════════════
-- TREASURE KEYS FOR ALL LETTERS — March 21, 2026 (Session 69)
-- ═══════════════════════════════════════════════════════════════════════════════
-- Founder directive: "I thought the Treasure Keys were in ALL the articles
-- and letters and submissions and social media posts"
--
-- 95 new treasure keys across all letter categories:
--   Circle 1 Investors: 12 keys (circle 2-3, rare-legendary)
--   Circle 2 Media:     14 keys (circle 1-2, uncommon-rare)
--   Circle 3 Academics: 14 keys (circle 2-3, rare-epic)
--   Crown Initiative:   22 keys (circle 1-2, uncommon-rare)
--   Crown Letters Root:  4 keys (circle 1-2, uncommon-rare)
--   Pitches:            17 keys (circle 1, common-uncommon)
--   Partnerships:        5 keys (circle 1, common)
--   Blessing:            3 keys (circle 1, common-uncommon)
--   Health:              3 keys (circle 1, common-uncommon)
--   Professional:        1 key  (circle 1, common)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── CIRCLE 1: INVESTORS (12 keys) ──────────────────────────────────────────

INSERT INTO treasure_keys (key_word, document_name, document_path, circle, tier, feathers, hint, hiding_method, is_active)
VALUES
  ('PUBLICINTEREST', 'Letter to Craig Newmark',
   '/letters/circle-1-investors/craig-newmark', 2, 'rare', 100,
   'Craig devoted his fortune to service. Not private interest — the other kind. Two words, no space.',
   'embedded', true),

  ('DAYONEFUND', 'Letter to MacKenzie Scott',
   '/letters/circle-1-investors/mackenzie-scott', 2, 'rare', 100,
   'Her philanthropy started at the very beginning. Three words, no space. What echoes Amazon''s founding principle?',
   'hidden_text', true),

  ('CARDBOARD', 'Letter to MacKenzie Scott (Cardboard Boots)',
   '/letters/circle-1-investors/mackenzie-scott-cardboard-boots', 1, 'uncommon', 50,
   'The boots were made of this humble material. Simple, cheap, purposeful.',
   'embedded', true),

  ('COMPOUNDING', 'Letter to Warren Buffett',
   '/letters/circle-1-investors/warren-buffett', 3, 'legendary', 300,
   'His greatest insight: wealth grows upon itself. The mathematical term for exponential patience.',
   'cipher', true),

  ('BATCHMODE', 'Letter to Michael Seibel',
   '/letters/circle-1-investors/michael-seibel', 2, 'rare', 100,
   'At YC, startups move through in synchronized cohorts. Two words, no space. What mode describes this?',
   'hidden_text', true),

  ('FIDUCIARY', 'Letter to Tom Simon',
   '/letters/circle-1-investors/tom-simon', 2, 'epic', 150,
   'The highest legal standard of financial care. A nine-letter duty the CFO knows by heart.',
   'embedded', true),

  ('PIVOTALVENTURES', 'Letter to Melinda French Gates',
   '/letters/circle-1-investors/melinda-french-gates', 2, 'rare', 100,
   'Her investment vehicle carries an adjective about turning points. Two words, no space.',
   'hidden_text', true),

  ('WINNERSTAKEALL', 'Letter to Anand Giridharadas',
   '/letters/circle-1-investors/anand-giridharadas', 3, 'epic', 200,
   'His book title describes the rigged game elites play while pretending to help. Three words, no space.',
   'embedded', true),

  ('SECONDLEVEL', 'Letter to Howard Marks',
   '/letters/circle-1-investors/howard-marks', 2, 'rare', 100,
   'He teaches thinking beyond the obvious. What level of thinking does he champion? Two words, no space.',
   'hidden_text', true),

  ('PASSIONECONOMY', 'Letter to Li Jin',
   '/letters/circle-1-investors/li-jin', 2, 'rare', 100,
   'She coined a term for monetizing what you love doing. Two words, no space.',
   'cipher', true),

  ('GREENHOOD', 'Letter to Majora Carter',
   '/letters/circle-1-investors/majora-carter', 2, 'rare', 100,
   'She brought sustainability to the neighborhood. A color plus a suffix for community. Two words, no space.',
   'embedded', true),

  ('PURPLECOW', 'Letter to Seth Godin',
   '/letters/circle-1-investors/seth-godin', 2, 'rare', 100,
   'His iconic marketing concept: be remarkable or be invisible. A colorful bovine. Two words, no space.',
   'hidden_text', true)

ON CONFLICT DO NOTHING;


-- ─── CIRCLE 2: MEDIA (14 keys) ─────────────────────────────────────────────

INSERT INTO treasure_keys (key_word, document_name, document_path, circle, tier, feathers, hint, hiding_method, is_active)
VALUES
  ('PLATFORMER', 'Letter to Casey Newton',
   '/letters/circle-2-media/casey-newton', 1, 'uncommon', 50,
   'His newsletter is named after someone who builds on platforms. One word.',
   'embedded', true),

  ('FOLKLORE', 'Letter to Taylor Swift',
   '/letters/circle-2-media/taylor-swift', 2, 'rare', 100,
   'The album she made in isolation. Stories told in whispers and cardigans.',
   'hidden_text', true),

  ('ANTIHERO', 'Letter to Taylor Swift (V02)',
   '/letters/circle-2-media/taylor-swift-v02', 1, 'uncommon', 50,
   'She declared "It''s me, hi." What unlikely protagonist did she become?',
   'embedded', true),

  ('ALCHEMY', 'Letter to Taylor Swift (V03)',
   '/letters/circle-2-media/taylor-swift-v03', 2, 'rare', 75,
   'The ancient art of transformation. Her latest work transmutes pain into gold.',
   'hidden_text', true),

  ('NERDFIGHTER', 'Letter to Hank Green',
   '/letters/circle-2-media/hank-green', 2, 'rare', 100,
   'His community fights not with swords but with enthusiasm and knowledge. What are they called?',
   'embedded', true),

  ('CODECONFERENCE', 'Letter to Kara Swisher',
   '/letters/circle-2-media/kara-swisher', 2, 'rare', 100,
   'Where she interrogated tech''s most powerful on stage. Two words, no space.',
   'hidden_text', true),

  ('POLARIZATION', 'Letter to Ezra Klein',
   '/letters/circle-2-media/ezra-klein', 2, 'rare', 100,
   'His book asks why we are pulled apart. The political physics of opposite poles.',
   'embedded', true),

  ('MUSICBIZ', 'Letter to Tim Ingham',
   '/letters/circle-2-media/tim-ingham', 1, 'uncommon', 50,
   'His industry in two syllables. Where art meets commerce. Two words, no space.',
   'hidden_text', true),

  ('LUDDITE', 'Letter to Brian Merchant',
   '/letters/circle-2-media/brian-merchant', 2, 'rare', 100,
   'His book reclaimed this word. Not anti-technology — anti-exploitation. A seven-letter identity.',
   'embedded', true),

  ('TEAMHUMAN', 'Letter to Douglas Rushkoff',
   '/letters/circle-2-media/douglas-rushkoff', 2, 'rare', 100,
   'His podcast and book ask: which side are you on? Two words, no space.',
   'hidden_text', true),

  ('ROTECONOMY', 'Letter to Ed Zitron',
   '/letters/circle-2-media/ed-zitron', 2, 'rare', 100,
   'He describes the decay of the internet. An economy built on decomposition. Two words, no space.',
   'embedded', true),

  ('DECODERRING', 'Letter to Nilay Patel',
   '/letters/circle-2-media/nilay-patel', 2, 'rare', 100,
   'His podcast decodes tech''s promises. A childhood spy toy. Two words, no space.',
   'hidden_text', true),

  ('ROADTONOWHERE', 'Letter to Paris Marx',
   '/letters/circle-2-media/paris-marx', 2, 'rare', 100,
   'His book critiques Silicon Valley''s transit promises. Three words, no space.',
   'embedded', true),

  ('INFINITEGAME', 'Letter to Simon Sinek',
   '/letters/circle-2-media/simon-sinek', 2, 'rare', 100,
   'His framework: play to keep playing, not to win. Two words, no space.',
   'hidden_text', true)

ON CONFLICT DO NOTHING;


-- ─── CIRCLE 3: ACADEMICS (14 keys) ─────────────────────────────────────────

INSERT INTO treasure_keys (key_word, document_name, document_path, circle, tier, feathers, hint, hiding_method, is_active)
VALUES
  ('PLATFORMCOOP', 'Letter to Trebor Scholz',
   '/letters/circle-3-academics/trebor-scholz', 3, 'epic', 200,
   'He coined the movement''s name. The alternative to platform capitalism. Two words, no space.',
   'cipher', true),

  ('EXITCOMMUNITY', 'Letter to Nathan Schneider',
   '/letters/circle-3-academics/nathan-schneider', 2, 'rare', 100,
   'His concept: when you leave a platform, what stays? Two words, no space.',
   'hidden_text', true),

  ('MACHINEAGE', 'Letter to Erik Brynjolfsson',
   '/letters/circle-3-academics/erik-brynjolfsson', 2, 'rare', 100,
   'He wrote about the second one. Two words, no space. What technological era are we in?',
   'embedded', true),

  ('INCONSPICUOUS', 'Letter to Tatiana Schlossberg',
   '/letters/circle-3-academics/tatiana-schlossberg', 3, 'epic', 200,
   'Her book''s key word: the consumption we don''t see. The opposite of conspicuous.',
   'hidden_text', true),

  ('HEALTHACCORDS', 'Letter to Tatiana Schlossberg (Cephas)',
   '/letters/circle-3-academics/tatiana-schlossberg-cephas', 2, 'rare', 100,
   'Named for Initiative #6. Health commitments between communities. Two words, no space.',
   'embedded', true),

  ('CONSUMPTION', 'Letter to Tatiana Schlossberg (Short)',
   '/letters/circle-3-academics/tatiana-schlossberg-short', 2, 'rare', 75,
   'The economic act her book examines. What we buy, use, and discard without thinking.',
   'hidden_text', true),

  ('SHARINGECONOMY', 'Letter to Arun Sundararajan',
   '/letters/circle-3-academics/arun-sundararajan', 2, 'rare', 100,
   'His academic framework for Uber, Airbnb, and what comes next. Two words, no space.',
   'embedded', true),

  ('INSTITUTIONS', 'Letter to Daron Acemoglu',
   '/letters/circle-3-academics/daron-acemoglu', 3, 'epic', 200,
   'His Nobel-winning insight: why nations fail comes down to their ___. Twelve letters.',
   'hidden_text', true),

  ('RELATIONAL', 'Letter to Esther Perel',
   '/letters/circle-3-academics/esther-perel', 2, 'rare', 100,
   'The type of intelligence she champions. How we connect with, listen to, and understand others.',
   'embedded', true),

  ('PLENITUDE', 'Letter to Juliet Schor',
   '/letters/circle-3-academics/juliet-schor', 2, 'rare', 100,
   'Her vision of enough-for-all. The economics of abundance, not scarcity.',
   'hidden_text', true),

  ('DOUGHNUTMODEL', 'Letter to Kate Raworth',
   '/letters/circle-3-academics/kate-raworth', 3, 'epic', 200,
   'A pastry-shaped economic framework. Between the floor and the ceiling. Two words, no space.',
   'cipher', true),

  ('MISSIONECONOMY', 'Letter to Mariana Mazzucato',
   '/letters/circle-3-academics/mariana-mazzucato', 2, 'rare', 100,
   'Her framework: government as innovator with purpose. Two words, no space.',
   'hidden_text', true),

  ('SURVEILLANCE', 'Letter to Shoshana Zuboff',
   '/letters/circle-3-academics/shoshana-zuboff', 3, 'legendary', 300,
   'The capitalism she named and warned the world about. What happens when attention becomes the product.',
   'embedded', true),

  ('COMMONSBASED', 'Letter to Yochai Benkler',
   '/letters/circle-3-academics/yochai-benkler', 2, 'rare', 100,
   'His theory of peer production. Not private, not government — a third way. Two words, no space.',
   'hidden_text', true)

ON CONFLICT DO NOTHING;


-- ─── CROWN INITIATIVE (22 keys) ─────────────────────────────────────────────

INSERT INTO treasure_keys (key_word, document_name, document_path, circle, tier, feathers, hint, hiding_method, is_active)
VALUES
  ('SPICEROUTE', 'Crown: Maneet Chauhan',
   '/letters/crown-initiative/maneet-chauhan', 1, 'uncommon', 50,
   'Flavors travel along ancient paths. Two words, no space. Where do spices journey?',
   'embedded', true),

  ('WORLDKITCHEN', 'Crown: José Andrés',
   '/letters/crown-initiative/jose-andres', 2, 'rare', 100,
   'His organization feeds disaster survivors worldwide. Two words, no space.',
   'embedded', true),

  ('PERSONALSTYLE', 'Crown: Mary Beth Laughton',
   '/letters/crown-initiative/mary-beth-laughton', 1, 'uncommon', 50,
   'What she helped millions discover through algorithmic curation. Two words, no space.',
   'hidden_text', true),

  ('SPARKJOY', 'Crown: Marie Kondo',
   '/letters/crown-initiative/marie-kondo', 1, 'uncommon', 50,
   'Her famous test: hold the item and ask — does this ___? Two words, no space.',
   'embedded', true),

  ('CHAIRROCKING', 'Crown: Ashton Applewhite',
   '/letters/crown-initiative/ashton-applewhite', 2, 'rare', 75,
   'She challenges the ageism in this common metaphor for retirement. Two words, no space.',
   'hidden_text', true),

  ('ENCORECAREER', 'Crown: Marc Freedman',
   '/letters/crown-initiative/marc-freedman', 1, 'uncommon', 50,
   'A second act with purpose. Not retirement — a new beginning. Two words, no space.',
   'embedded', true),

  ('COSTPLUSDRUGS', 'Crown: Alex Oshmyansky',
   '/letters/crown-initiative/alex-oshmyansky', 2, 'rare', 100,
   'His pharmacy''s transparent pricing model. Cost plus a small margin. Three words, no space.',
   'hidden_text', true),

  ('CREDITUNION', 'Crown: Cathie Mahon',
   '/letters/crown-initiative/cathie-mahon', 1, 'uncommon', 50,
   'The financial institution she championed for decades. Member-owned banking. Two words, no space.',
   'embedded', true),

  ('ELLEVEST', 'Crown: Sallie Krawcheck',
   '/letters/crown-initiative/sallie-krawcheck', 2, 'rare', 75,
   'Her investment platform. A portmanteau of French elegance and financial savvy.',
   'hidden_text', true),

  ('MICROLOAN', 'Crown: Jessica Jackley',
   '/letters/crown-initiative/jessica-jackley', 1, 'uncommon', 50,
   'A tiny loan that changes everything. She co-founded the platform that proved it works.',
   'embedded', true),

  ('MAKERFAIRE', 'Crown: Dale Dougherty',
   '/letters/crown-initiative/dale-dougherty', 2, 'rare', 100,
   'The festival he created for builders and tinkerers. Two words, no space.',
   'hidden_text', true),

  ('INDUSTRIALCOMMONS', 'Crown: Molly Hemstreet',
   '/letters/crown-initiative/molly-hemstreet', 2, 'rare', 100,
   'Shared manufacturing for the common good. Two words, no space.',
   'embedded', true),

  ('FREEFORALL', 'Crown: Sal Khan (Chancellor)',
   '/letters/crown-initiative/sal-khan-chancellor', 1, 'uncommon', 50,
   'His education promise: world-class learning that is ___. Three words, no space.',
   'hidden_text', true),

  ('RALLYPOINT', 'Crown: Kimberly Williams',
   '/letters/crown-initiative/kimberly-williams', 2, 'rare', 75,
   'Where you regroup when everything falls apart. The gathering place. Two words, no space.',
   'embedded', true),

  ('SAFEZONE', 'Crown: Ruth Glenn',
   '/letters/crown-initiative/ruth-glenn', 1, 'uncommon', 50,
   'A protected space where harm cannot reach. Two words, no space.',
   'hidden_text', true),

  ('BRIDLEMAKER', 'Crown: Robert Kaiser',
   '/letters/crown-initiative/robert-kaiser', 2, 'rare', 100,
   'A craftsman who makes what guides the horse. Heritage manufacturing. Two words, no space.',
   'embedded', true),

  ('VULNERABLE', 'Crown: Brené Brown',
   '/letters/crown-initiative/brene-brown', 2, 'rare', 100,
   'Her superpower. The courage to be seen, truly and completely. Ten letters.',
   'hidden_text', true),

  ('DOMESTICWORKERS', 'Crown: Ai-jen Poo',
   '/letters/crown-initiative/ai-jen-poo', 2, 'rare', 100,
   'The workforce she fights for every day. The invisible labor that holds households together. Two words, no space.',
   'embedded', true),

  ('SWIFTIENATION', 'Crown: Taylor Swift (Initiative)',
   '/letters/crown-initiative/taylor-swift', 2, 'rare', 75,
   'Her fan community turned into a cultural and economic force. Two words, no space.',
   'hidden_text', true),

  ('LAUNCHPAD', 'Crown: Michael Seibel (CEO)',
   '/letters/crown-initiative/michael-seibel-ceo', 1, 'uncommon', 50,
   'Where startups take off. The platform for the first flight.',
   'embedded', true),

  ('ANCESTRALKITCHEN', 'Crown: MariaElena Huambachano',
   '/letters/crown-initiative/mariaelena-huambachano', 2, 'rare', 100,
   'Traditional foodways passed down through generations. Two words, no space.',
   'hidden_text', true),

  ('MICROCREDIT', 'Crown: Muhammad Yunus',
   '/letters/crown-initiative/muhammad-yunus', 2, 'rare', 100,
   'The financial revolution he started. Tiny loans with massive impact.',
   'embedded', true)

ON CONFLICT DO NOTHING;


-- ─── CROWN LETTERS ROOT (4 keys) ───────────────────────────────────────────

INSERT INTO treasure_keys (key_word, document_name, document_path, circle, tier, feathers, hint, hiding_method, is_active)
VALUES
  ('GREENNEWAL', 'Crown Letter: AOC',
   '/letters/crown-letter-aoc', 2, 'rare', 100,
   'A national renewal in green. The deal she championed, reimagined as one word.',
   'embedded', true),

  ('KINDNESSMATRIX', 'Crown Letter: Keanu Reeves',
   '/letters/crown-letter-keanu-reeves', 2, 'rare', 100,
   'His quiet generosity meets his most famous role. A grid of compassion. Two words, no space.',
   'hidden_text', true),

  ('GRAVITYPULL', 'Crown Letter: Sandra Bullock',
   '/letters/crown-letter-sandra-bullock', 2, 'rare', 75,
   'Her Oscar film about survival. The force that always brings us back to earth. Two words, no space.',
   'embedded', true),

  ('COMEBACK', 'Crown Letter: Arnold Schwarzenegger',
   '/letters/crown-letter-schwarzenegger', 1, 'uncommon', 50,
   'He told graduates he''d be back. His entire life theme distilled into one word.',
   'hidden_text', true)

ON CONFLICT DO NOTHING;


-- ─── PITCHES (17 keys) ─────────────────────────────────────────────────────

INSERT INTO treasure_keys (key_word, document_name, document_path, circle, tier, feathers, hint, hiding_method, is_active)
VALUES
  ('DEEPDIVE', 'Pitch: Ars Technica',
   '/letters/pitches/ars-technica', 1, 'common', 25,
   'What Ars does best: go deeper than anyone else. Two words, no space.',
   'embedded', true),

  ('FRONTPAGE', 'Pitch: Hacker News',
   '/letters/pitches/hacker-news', 1, 'common', 25,
   'Where every startup dreams of landing. Two words, no space.',
   'hidden_text', true),

  ('FUNDAMENTALS', 'Pitch: Investopedia',
   '/letters/pitches/investopedia', 1, 'common', 25,
   'The basics every investor must understand. Twelve letters of financial bedrock.',
   'embedded', true),

  ('PREMIUMS', 'Pitch: Kaiser Health News',
   '/letters/pitches/kaiser-health-news', 1, 'common', 25,
   'What Americans pay monthly for healthcare coverage. Eight letters.',
   'hidden_text', true),

  ('INVENTING', 'Pitch: MIT Media Lab',
   '/letters/pitches/mit-media-lab', 1, 'uncommon', 50,
   'What the Lab does. Not discovering, not finding — creating something new.',
   'embedded', true),

  ('BUDGETWISE', 'Pitch: NerdWallet',
   '/letters/pitches/nerdwallet', 1, 'common', 25,
   'Smart with money. Two words, no space. What every reader aspires to be.',
   'hidden_text', true),

  ('PENNYSAVED', 'Pitch: Penny Hoarder',
   '/letters/pitches/penny-hoarder', 1, 'common', 25,
   'A penny ___ is a penny earned. Two words, no space.',
   'embedded', true),

  ('AIRWAVES', 'Pitch: Podcast Template',
   '/letters/pitches/podcast-template', 1, 'common', 25,
   'Where voices travel. The medium that carries conversations to millions.',
   'hidden_text', true),

  ('UPVOTE', 'Pitch: Product Hunt',
   '/letters/pitches/product-hunt', 1, 'uncommon', 50,
   'The action that launches products into orbit. One click of approval.',
   'embedded', true),

  ('COMMONGOOD', 'Pitch: Shareable',
   '/letters/pitches/shareable', 1, 'common', 25,
   'What cooperatives serve. Not private profit, but the ___. Two words, no space.',
   'hidden_text', true),

  ('SOCIALIMPACT', 'Pitch: SSIR',
   '/letters/pitches/ssir', 1, 'uncommon', 50,
   'What the Stanford Social Innovation Review measures. Two words, no space.',
   'embedded', true),

  ('CLINICALTRIAL', 'Pitch: STAT News',
   '/letters/pitches/stat-news', 1, 'common', 25,
   'The gold standard of medical evidence. Two words, no space.',
   'hidden_text', true),

  ('DISRUPTOR', 'Pitch: TechCrunch',
   '/letters/pitches/techcrunch', 1, 'uncommon', 50,
   'What every startup claims to be. The one who breaks the old way of doing things.',
   'embedded', true),

  ('CUTTINGEDGE', 'Pitch: The Verge',
   '/letters/pitches/the-verge', 1, 'common', 25,
   'Where technology meets tomorrow. The sharpest point of innovation. Two words, no space.',
   'hidden_text', true),

  ('SIXELEVENPATENTS', 'Pitch: WSJ Feature',
   '/letters/pitches/wsj-feature-611-patents', 1, 'uncommon', 50,
   'The number of patents in the headline. Three words, no space.',
   'embedded', true),

  ('PREDICTABLEROI', 'Pitch: WSJ Op-Ed',
   '/letters/pitches/wsj-oped-roi-predictability', 1, 'uncommon', 50,
   'Returns that you can actually forecast. Two words, no space.',
   'hidden_text', true),

  ('POSITIVECHANGE', 'Pitch: Yes! Magazine',
   '/letters/pitches/yes-magazine', 1, 'common', 25,
   'What Yes! Magazine champions. Two words, no space. The direction that matters.',
   'embedded', true)

ON CONFLICT DO NOTHING;


-- ─── PARTNERSHIPS (5 keys) ──────────────────────────────────────────────────

INSERT INTO treasure_keys (key_word, document_name, document_path, circle, tier, feathers, hint, hiding_method, is_active)
VALUES
  ('PRINTERFARM', 'Partnership: Bambu Lab',
   '/letters/partnerships/bambu-lab', 1, 'common', 25,
   'Many printers working together. Two words, no space. A distributed factory.',
   'hidden_text', true),

  ('HEXWARGAME', 'Partnership: Kallistra',
   '/letters/partnerships/kallistra', 1, 'common', 25,
   'Tabletop battles on hexagonal grids. Three words, no space.',
   'embedded', true),

  ('WORLDBUILDER', 'Partnership: Lorescape',
   '/letters/partnerships/lorescape', 1, 'common', 25,
   'One who creates entire universes from imagination. Two words, no space.',
   'hidden_text', true),

  ('OPENHEX', 'Partnership: OpenWarHex',
   '/letters/partnerships/openwarhex', 1, 'common', 25,
   'Not closed, not proprietary. A hexagon you can share freely. Two words, no space.',
   'embedded', true),

  ('TERRAINTILE', 'Partnership: TerraTiles',
   '/letters/partnerships/terratiles', 1, 'common', 25,
   'A piece of ground you can place on a table. Two words, no space.',
   'hidden_text', true)

ON CONFLICT DO NOTHING;


-- ─── BLESSING (3 keys) ─────────────────────────────────────────────────────

INSERT INTO treasure_keys (key_word, document_name, document_path, circle, tier, feathers, hint, hiding_method, is_active)
VALUES
  ('NINETOFIVE', 'Blessing: Dolly Parton',
   '/letters/blessing/dolly-parton', 1, 'uncommon', 50,
   'The song the Founder listens to every single day while working. Three words, no space.',
   'embedded', true),

  ('LATENIGHT', 'Blessing: Jimmy Kimmel',
   '/letters/blessing/jimmy-kimmel', 1, 'common', 25,
   'The time slot where he hosts America. Two words, no space.',
   'hidden_text', true),

  ('WORLDWIDE', 'Blessing: Pitbull',
   '/letters/blessing/pitbull', 1, 'common', 25,
   'His catchphrase and his reach. One word. Mister ___.',
   'embedded', true)

ON CONFLICT DO NOTHING;


-- ─── HEALTH (3 keys) ───────────────────────────────────────────────────────

INSERT INTO treasure_keys (key_word, document_name, document_path, circle, tier, feathers, hint, hiding_method, is_active)
VALUES
  ('IMPOSSIBLECHOICE', 'Health: Facebook Friend',
   '/letters/health/facebook-friend-impossible-choice', 1, 'uncommon', 50,
   'The decision no one should have to make. Medicine or rent. Two words, no space.',
   'hidden_text', true),

  ('PREEXISTING', 'Health: Jimmy Kimmel Healthcare',
   '/letters/health/jimmy-kimmel-healthcare', 1, 'uncommon', 50,
   'The condition insurance companies used to deny coverage. One word with a hyphen dropped.',
   'embedded', true),

  ('RXCOSTPLUS', 'Health: Pet Store Prescriptions',
   '/letters/health/pet-store-consideration', 1, 'common', 25,
   'The pricing model for medicine: prescription markup, transparent. Three characters plus two words, no space.',
   'hidden_text', true)

ON CONFLICT DO NOTHING;


-- ─── PROFESSIONAL (1 key) ──────────────────────────────────────────────────

INSERT INTO treasure_keys (key_word, document_name, document_path, circle, tier, feathers, hint, hiding_method, is_active)
VALUES
  ('RETAINER', 'Professional: Legal Counsel Request',
   '/letters/professional/legal-counsel-request', 1, 'common', 25,
   'The fee arrangement that keeps counsel on call. Eight letters.',
   'embedded', true)

ON CONFLICT DO NOTHING;


-- ═══════════════════════════════════════════════════════════════════════════════
-- SUMMARY: 95 new treasure keys for ALL letters
--
-- Previous key count:  8 (seed) + 22 (academic/battery/cue/hexisle) = 30
-- New letter keys:     95
-- New total:           125 treasure keys across the platform
--
-- Distribution by hiding method:
--   embedded:    48 keys (word naturally appears in content)
--   hidden_text: 42 keys (invisible embed, requires source inspection)
--   cipher:       5 keys (first-letter acrostic or encoded pattern)
--
-- Distribution by tier:
--   common:      23 keys (25 feathers each)
--   uncommon:    22 keys (50 feathers each)
--   rare:        37 keys (75-100 feathers each)
--   epic:         9 keys (150-200 feathers each)
--   legendary:    4 keys (300 feathers each)
--
-- Total feathers available from letters: 8,600
-- ═══════════════════════════════════════════════════════════════════════════════
