-- ═══════════════════════════════════════════════════════════════════════════════
-- TREASURE KEYS FOR NEW CONTENT — March 8, 2026
-- ═══════════════════════════════════════════════════════════════════════════════
-- Bishop Session: Adding treasure keys to 4 new academic papers, Battery
-- campaign content, and new Cue Card pages.
--
-- Founder directive: "I thought the Treasure Keys were in ALL the articles
-- and letters and submissions and social media posts"
--
-- Key Schema: key_word, document_name, document_path, circle, tier, feathers,
--             hint, hiding_method, is_active
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── ACADEMIC PAPERS — ATTENTION AS FUNDING ─────────────────────────────────

INSERT INTO treasure_keys (key_word, document_name, document_path, circle, tier, feathers, hint, hiding_method, is_active)
VALUES
  ('TRIANGULATE', 'Attention as Funding - Full Paper',
   '/academic-papers/attention-as-funding', 2, 'epic', 200,
   'When three data points meet, they form something powerful. Look for the moment where attention, data, and causes converge.',
   'embedded', true),

  ('VIEWPORT', 'Attention as Funding - TLDR',
   '/academic-papers/attention-as-funding', 1, 'uncommon', 50,
   'The window through which attention is measured. Find where the system watches what you watch.',
   'hidden_text', true),

  ('CAFETERIA', 'Attention as Funding - For Everyone',
   '/academic-papers/attention-as-funding', 1, 'common', 25,
   'The simplest explanation uses a place where kids eat lunch. What word starts the analogy?',
   'embedded', true)

ON CONFLICT DO NOTHING;

-- ─── ACADEMIC PAPERS — GRASSROOTS INTELLIGENCE ──────────────────────────────

INSERT INTO treasure_keys (key_word, document_name, document_path, circle, tier, feathers, hint, hiding_method, is_active)
VALUES
  ('SYBIL', 'Grassroots Intelligence - Full Paper',
   '/academic-papers/grassroots-intelligence', 3, 'legendary', 300,
   'The ancient attack that splits one voice into many. Find the defense that makes it economically impossible.',
   'cipher', true),

  ('FIELDTRIP', 'Grassroots Intelligence - For Everyone',
   '/academic-papers/grassroots-intelligence', 1, 'common', 25,
   'The sixth graders learn about democracy by going on a ___. Fill in the blank.',
   'embedded', true),

  ('ZEROGRAPHIC', 'Grassroots Intelligence - TLDR',
   '/academic-papers/grassroots-intelligence', 2, 'rare', 100,
   'No demographics needed. The system works without knowing who you are. What is the compound word?',
   'hidden_text', true)

ON CONFLICT DO NOTHING;

-- ─── ACADEMIC PAPERS — THE MUFFLED RULE ─────────────────────────────────────

INSERT INTO treasure_keys (key_word, document_name, document_path, circle, tier, feathers, hint, hiding_method, is_active)
VALUES
  ('SHIRLEY', 'The Muffled Rule - Full Paper',
   '/academic-papers/muffled-rule', 2, 'epic', 150,
   'The content standard is named after a famous child actress. A temple, not a rule.',
   'embedded', true),

  ('COVERAGE', 'The Muffled Rule - TLDR',
   '/academic-papers/muffled-rule', 1, 'uncommon', 50,
   'Minutes are the currency. What type of minutes are they?',
   'hidden_text', true),

  ('MICROPHONE', 'The Muffled Rule - For Everyone',
   '/academic-papers/muffled-rule', 1, 'common', 25,
   'When your balance hits zero, this device turns off automatically.',
   'embedded', true)

ON CONFLICT DO NOTHING;

-- ─── ACADEMIC PAPERS — MARKS DEMOCRATIC PARTICIPATION ───────────────────────

INSERT INTO treasure_keys (key_word, document_name, document_path, circle, tier, feathers, hint, hiding_method, is_active)
VALUES
  ('CORNERSTONE', 'Marks Democracy - Full Paper',
   '/academic-papers/marks-democracy', 2, 'epic', 200,
   'The highest tier of commitment. 100 tokens. A foundation stone that never moves.',
   'embedded', true),

  ('PERMANENT', 'Marks Democracy - TLDR',
   '/academic-papers/marks-democracy', 1, 'rare', 75,
   'Your civic commitment NEVER resets. What word describes a vote that lasts forever?',
   'hidden_text', true),

  ('CONCRETE', 'Marks Democracy - For Everyone',
   '/academic-papers/marks-democracy', 1, 'common', 25,
   'Signing your name in wet ___. It is there for good.',
   'embedded', true)

ON CONFLICT DO NOTHING;

-- ─── BATTERY CAMPAIGN POSTS — GRASSROOTS INTELLIGENCE ───────────────────────

INSERT INTO treasure_keys (key_word, document_name, document_path, circle, tier, feathers, hint, hiding_method, is_active)
VALUES
  ('PETITION', 'Grassroots Intelligence Campaign - Day 1',
   '/battery/grassroots-intelligence', 1, 'uncommon', 50,
   'You signed one last week. So did 50,000 other people. What did the politician receive?',
   'embedded', true),

  ('THREESECONDS', 'Grassroots Intelligence Campaign - Day 1',
   '/battery/grassroots-intelligence', 2, 'rare', 100,
   'Each signature cost this amount of time and a mouse click. Two words, no space.',
   'cipher', true),

  ('EXPEDITION', 'Grassroots Intelligence Campaign - Day 5',
   '/battery/grassroots-intelligence', 1, 'uncommon', 50,
   'The final day invites you to join something. Not a journey, not a trip, but a ___.',
   'embedded', true)

ON CONFLICT DO NOTHING;

-- ─── CUE CARD PAGES ─────────────────────────────────────────────────────────

INSERT INTO treasure_keys (key_word, document_name, document_path, circle, tier, feathers, hint, hiding_method, is_active)
VALUES
  ('AIRCRAFTCARRIER', 'Cue Card: Stage Play',
   '/cue/stage-play', 1, 'uncommon', 50,
   'Your business launches from a floating runway. Two words, no space. What is the stage?',
   'embedded', true),

  ('FOREVERESTAMPS', 'Cue Card: Forever Stamps',
   '/cue/forever-stamps', 1, 'uncommon', 50,
   'Like buying postage that never expires. Two words that describe a value lock.',
   'hidden_text', true),

  ('FORWARD', 'Cue Card: Forward Invitation',
   '/cue/forward', 1, 'common', 25,
   'Not left. Not right. The only direction that matters. One word.',
   'embedded', true),

  ('SIXTEENINITIATIVES', 'Cue Card: Political Expedition',
   '/cue/political-expedition', 2, 'rare', 100,
   'The platform runs on this many practical initiatives. A number plus a word, no space.',
   'cipher', true)

ON CONFLICT DO NOTHING;

-- ─── HEXISLE CANAL QUARTER (reinforcing keys from hexCanalDistrict.ts) ──────

INSERT INTO treasure_keys (key_word, document_name, document_path, circle, tier, feathers, hint, hiding_method, is_active)
VALUES
  ('GONDOLA', 'Canal Quarter - The Undertow',
   '/hexisle/world-3d', 2, 'rare', 100,
   'The boat that glides through Venice. Find it on the winding walk to The Undertow.',
   'embedded', true),

  ('ALLACCESS', 'Canal Quarter - All Access Pass',
   '/hexisle/world-3d', 2, 'epic', 150,
   'One pass. Every venue. No limits. Two words, no space.',
   'hidden_text', true)

ON CONFLICT DO NOTHING;

-- ─── PIPE PORTAL SYSTEM ─────────────────────────────────────────────────────

INSERT INTO treasure_keys (key_word, document_name, document_path, circle, tier, feathers, hint, hiding_method, is_active)
VALUES
  ('WARPPIPE', 'Pipe Portal System',
   '/hexisle/overworld', 2, 'rare', 100,
   'Mario knew. Green means go. Two words, no space. What transports you between cities?',
   'embedded', true)

ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- SUMMARY: 22 new treasure keys added
-- Papers: 12 keys (3 per paper x 4 papers)
-- Battery Campaign: 3 keys
-- Cue Cards: 4 keys
-- HexIsle Canal: 2 keys
-- HexIsle Pipes: 1 key
-- ═══════════════════════════════════════════════════════════════════════════════
