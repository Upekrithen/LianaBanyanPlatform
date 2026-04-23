-- ============================================================================
-- Session 25: Add content columns to outbound_dispatch + seed 18 articles
-- ============================================================================

ALTER TABLE public.outbound_dispatch
  ADD COLUMN IF NOT EXISTS content_type TEXT,
  ADD COLUMN IF NOT EXISTS content_path TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- ═══════════════════════════════════════════════════════════════
-- TIER 1: OPEN LETTERS (Comprehension Quiz, no embedded keys)
-- ═══════════════════════════════════════════════════════════════

INSERT INTO outbound_dispatch (title, type, status, priority, content_body, content_summary, channels, created_by, tags, content_type, content_path, metadata) VALUES
(
  'An Open Letter to MacKenzie Scott',
  'publication', 'draft', 'high',
  'See BISHOP_DROPZONE/ARTICLE_MEDIUM_SCOTT_OPEN_LETTER.md',
  'Open letter to MacKenzie Scott on cooperative economics and structural philanthropy.',
  ARRAY['medium', 'linkedin'],
  'bishop',
  ARRAY['philanthropy', 'MacKenzie Scott', 'cooperative economics'],
  'open_letter',
  'BISHOP_DROPZONE/ARTICLE_MEDIUM_SCOTT_OPEN_LETTER.md',
  '{"golden_key_type": "comprehension_quiz", "quiz_path": "BISHOP_DROPZONE/QUIZ_SCOTT_OPEN_LETTER.md"}'::jsonb
),
(
  'An Open Letter to Warren Buffett',
  'publication', 'draft', 'high',
  'See BISHOP_DROPZONE/ARTICLE_MEDIUM_BUFFETT_OPEN_LETTER.md',
  'Open letter to Warren Buffett on cooperative economics and wealth inequality.',
  ARRAY['medium', 'linkedin'],
  'bishop',
  ARRAY['Warren Buffett', 'philanthropy', 'cooperative economics'],
  'open_letter',
  'BISHOP_DROPZONE/ARTICLE_MEDIUM_BUFFETT_OPEN_LETTER.md',
  '{"golden_key_type": "comprehension_quiz", "quiz_path": "BISHOP_DROPZONE/QUIZ_BUFFETT_OPEN_LETTER.md"}'::jsonb
);

-- ═══════════════════════════════════════════════════════════════
-- TIER 2: OP-ED ARTICLES (with anecdotes + golden keys)
-- ═══════════════════════════════════════════════════════════════

INSERT INTO outbound_dispatch (title, type, status, priority, content_body, content_summary, channels, created_by, tags, content_type, content_path, metadata) VALUES
(
  'Unlimited Throws: What If the Carnival Game Was Free?',
  'publication', 'draft', 'high',
  'See 01 MarkupFiles/PAPER_UNLIMITED_THROWS_MEDIUM.md',
  'What if every carnival game gave unlimited throws? The economics of persistence and cooperative design.',
  ARRAY['medium', 'linkedin'],
  'bishop',
  ARRAY['entrepreneurship', 'HexIsle', 'cooperative economics', 'persistence'],
  'article',
  '01 MarkupFiles/PAPER_UNLIMITED_THROWS_MEDIUM.md',
  '{"golden_key": "PERSIST", "key_tier": "flight", "key_method": "acrostic", "feathers": 3, "anecdote": "How to Learn to Swim"}'::jsonb
),
(
  'The Ambassador of the Quan',
  'publication', 'draft', 'high',
  'See BISHOP_DROPZONE/ARTICLE_AMBASSADOR_OF_THE_QUAN.md',
  'Jerry Maguire promised to show the money. We built the infrastructure to actually do it.',
  ARRAY['medium', 'linkedin'],
  'bishop',
  ARRAY['jerrymaguire', 'thequan', 'cooperatives', 'platformeconomics'],
  'article',
  'BISHOP_DROPZONE/ARTICLE_AMBASSADOR_OF_THE_QUAN.md',
  '{"golden_key": "TOGETHER", "key_tier": "flight", "key_method": "acrostic", "feathers": 3, "anecdote": "Not Around Through"}'::jsonb
),
(
  'Ruprecht is the New Quan',
  'publication', 'draft', 'high',
  'See BISHOP_DROPZONE/ARTICLE_RUPRECHT_IS_THE_NEW_QUAN.md',
  'The platform economy extracts. We built the opposite. Earned, not extracted.',
  ARRAY['medium', 'linkedin'],
  'bishop',
  ARRAY['platform economy', 'cooperative economics', 'gig economy', 'meritocracy'],
  'article',
  'BISHOP_DROPZONE/ARTICLE_RUPRECHT_IS_THE_NEW_QUAN.md',
  '{"golden_key": "EARNED", "key_tier": "flight", "key_method": "acrostic", "feathers": 3, "anecdote": "Rooster Tail"}'::jsonb
),
(
  'Not Left or Right. Forward.',
  'publication', 'draft', 'high',
  'See BISHOP_DROPZONE/ARTICLE_NOT_LEFT_OR_RIGHT_FORWARD.md',
  'Political expeditions dont need parties. They need infrastructure. This is the Forward approach.',
  ARRAY['medium', 'linkedin'],
  'bishop',
  ARRAY['politics', 'cooperation', 'forward', 'infrastructure'],
  'article',
  'BISHOP_DROPZONE/ARTICLE_NOT_LEFT_OR_RIGHT_FORWARD.md',
  '{"golden_key": "FORWARD", "key_tier": "fledgling", "key_method": "natural", "feathers": 1, "anecdote": "Christmas Eve 1992"}'::jsonb
),
(
  'Canada 40K: A Rescue Fleet for Stranded Entrepreneurs',
  'publication', 'draft', 'high',
  'See BISHOP_DROPZONE/ARTICLE_CANADA_40K_RESCUE_FLEET.md',
  'Canada is losing 40,000 entrepreneurs a year. What if the cooperative rescued them?',
  ARRAY['medium', 'linkedin'],
  'bishop',
  ARRAY['canada40k', 'startupvisa', 'entrepreneurs', 'immigration'],
  'article',
  'BISHOP_DROPZONE/ARTICLE_CANADA_40K_RESCUE_FLEET.md',
  '{"golden_key": "RESCUE", "key_tier": "fledgling", "key_method": "natural", "feathers": 1, "anecdote": "Christmas Eve 1992 (secondary)"}'::jsonb
),
(
  'Ludicrous Speed: How We Built Without VC',
  'publication', 'draft', 'high',
  'See Asteroid-ProofVault/Foundation Documents/MEDIUM-ARTICLE-LUDICROUS-SPEED.md',
  'No investors. No board. No dilution. How a 37-year system was built at ludicrous speed.',
  ARRAY['medium', 'linkedin'],
  'bishop',
  ARRAY['startup', 'bootstrapping', 'cooperative economics', 'venture capital'],
  'article',
  'Asteroid-ProofVault/Foundation Documents/MEDIUM-ARTICLE-LUDICROUS-SPEED.md',
  '{"golden_key": "BOOTSTRAP", "key_tier": "fledgling", "key_method": "natural", "feathers": 1, "anecdote": "Jeep of Theseus"}'::jsonb
);

-- ═══════════════════════════════════════════════════════════════
-- TIER 3: BOT DEFENSE / TECHNICAL
-- ═══════════════════════════════════════════════════════════════

INSERT INTO outbound_dispatch (title, type, status, priority, content_body, content_summary, channels, created_by, tags, content_type, content_path, metadata) VALUES
(
  'Digg Died Because Engagement Was Free. We Fixed That.',
  'publication', 'draft', 'high',
  'See BISHOP_DROPZONE/MEDIUM_DEAD_INTERNET_DEFENSE.md',
  'Four layers of bot defense built into LB economic DNA. STAMP, coverage minutes, chain voting, and cost floors.',
  ARRAY['medium', 'linkedin', 'cephas'],
  'bishop',
  ARRAY['bot defense', 'dead internet', 'platform security'],
  'article',
  'BISHOP_DROPZONE/MEDIUM_DEAD_INTERNET_DEFENSE.md',
  '{"golden_key": "PROACTIVE", "key_tier": "flight", "key_method": "acrostic", "feathers": 3, "anecdote": "No Brakes"}'::jsonb
);

-- ═══════════════════════════════════════════════════════════════
-- TIER 4: PLATFORM MECHANICS
-- ═══════════════════════════════════════════════════════════════

INSERT INTO outbound_dispatch (title, type, status, priority, content_body, content_summary, channels, created_by, tags, content_type, content_path, metadata) VALUES
(
  'Every Purchase Is a Vote: HIVI',
  'publication', 'draft', 'normal',
  'See articles/MEDIUM_ARTICLE_HIVI_EVERY_PURCHASE_IS_A_VOTE.md',
  'Every purchase is a vote. HIVI makes that literal with three-currency economics.',
  ARRAY['medium'],
  'bishop',
  ARRAY['economics', 'currency', 'cooperative', 'fintech'],
  'article',
  'articles/MEDIUM_ARTICLE_HIVI_EVERY_PURCHASE_IS_A_VOTE.md',
  '{"golden_key": "VOTE", "key_tier": "fledgling", "key_method": "natural", "feathers": 1}'::jsonb
),
(
  'The Midas Touch: Golden Keys',
  'publication', 'draft', 'normal',
  'See BISHOP_DROPZONE/HUMANIZED_FINAL/ARTICLE_THE_MIDAS_TOUCH_HUMANIZED.md',
  'Golden Keys hidden across the platform. Find them to unlock the treasure hunt.',
  ARRAY['medium'],
  'bishop',
  ARRAY['gamification', 'treasure hunt', 'golden keys'],
  'article',
  'BISHOP_DROPZONE/HUMANIZED_FINAL/ARTICLE_THE_MIDAS_TOUCH_HUMANIZED.md',
  '{"golden_key": "GOLD", "key_tier": "fledgling", "key_method": "natural", "feathers": 1, "status_note": "KEY ALREADY EMBEDDED"}'::jsonb
),
(
  'Why Code-Breakers Matter',
  'publication', 'draft', 'normal',
  'See BISHOP_DROPZONE/HUMANIZED_FINAL/ARTICLE_WHY_CODE_BREAKERS_MATTER_HUMANIZED.md',
  'Why code-breakers are the lifeblood of cooperative intelligence.',
  ARRAY['medium'],
  'bishop',
  ARRAY['security', 'code-breakers', 'cooperative intelligence'],
  'article',
  'BISHOP_DROPZONE/HUMANIZED_FINAL/ARTICLE_WHY_CODE_BREAKERS_MATTER_HUMANIZED.md',
  '{"golden_key": "HUNT", "key_tier": "flight", "key_method": "acrostic", "feathers": 3, "status_note": "KEY ALREADY EMBEDDED"}'::jsonb
),
(
  'How Liana Banyan Uses AI: The Husky in the Room',
  'publication', 'draft', 'normal',
  'See LAUNCH_TONIGHT_JAN28/ARTICLE_HOW_LIANA_BANYAN_USES_AI.md',
  'AI as sled dogs, not overlords. How the cooperative uses AI transparently.',
  ARRAY['medium'],
  'bishop',
  ARRAY['AI', 'transparency', 'cooperative AI'],
  'article',
  'LAUNCH_TONIGHT_JAN28/ARTICLE_HOW_LIANA_BANYAN_USES_AI.md',
  '{"golden_key": "SPEAK", "key_tier": "fledgling", "key_method": "natural", "feathers": 1, "status_note": "KEY ALREADY EMBEDDED"}'::jsonb
);

-- ═══════════════════════════════════════════════════════════════
-- TIER 5: ACADEMIC PAPERS (Conversational versions)
-- ═══════════════════════════════════════════════════════════════

INSERT INTO outbound_dispatch (title, type, status, priority, content_body, content_summary, channels, created_by, tags, content_type, content_path, metadata) VALUES
(
  'Leave the Corners of Your Field: Boaz Principle',
  'publication', 'draft', 'normal',
  'See BISHOP_DROPZONE/PAPERS_CONVERSATIONAL/BOAZ_PRINCIPLE_COLLEGE_FRESHMAN.md',
  'Ancient gleaning rights meet modern platform economics. The Boaz Principle.',
  ARRAY['medium'],
  'bishop',
  ARRAY['platform cooperativism', 'economics', 'fairness'],
  'academic_paper',
  'BISHOP_DROPZONE/PAPERS_CONVERSATIONAL/BOAZ_PRINCIPLE_COLLEGE_FRESHMAN.md',
  '{"golden_key_type": "comprehension_quiz", "anecdote": "How to Learn to Swim (secondary)"}'::jsonb
),
(
  'We Asked AI to Destroy Our Own Work: Star Chamber',
  'publication', 'draft', 'normal',
  'See BISHOP_DROPZONE/PAPERS_CONVERSATIONAL/STAR_CHAMBER_COLLEGE_FRESHMAN.md',
  'What happens when you ask AI to destroy your own research? The Star Chamber protocol.',
  ARRAY['medium'],
  'bishop',
  ARRAY['AI', 'research', 'platform economy'],
  'academic_paper',
  'BISHOP_DROPZONE/PAPERS_CONVERSATIONAL/STAR_CHAMBER_COLLEGE_FRESHMAN.md',
  '{"golden_key_type": "comprehension_quiz"}'::jsonb
),
(
  'Why One Currency Cant Do Everything: Three-Gear',
  'publication', 'draft', 'normal',
  'See BISHOP_DROPZONE/PAPERS_CONVERSATIONAL/THREE_GEAR_CURRENCY_COLLEGE_FRESHMAN.md',
  'Three currencies, three functions: Marks for measuring, Credits for trading, Feathers for rewarding.',
  ARRAY['medium'],
  'bishop',
  ARRAY['economics', 'currency', 'fintech'],
  'academic_paper',
  'BISHOP_DROPZONE/PAPERS_CONVERSATIONAL/THREE_GEAR_CURRENCY_COLLEGE_FRESHMAN.md',
  '{"golden_key_type": "comprehension_quiz"}'::jsonb
),
(
  'Cost + 20%: Anti-Extractive Derivative',
  'publication', 'draft', 'normal',
  'See BISHOP_DROPZONE/PAPERS_CONVERSATIONAL/ANTI_EXTRACTIVE_DERIVATIVE_COLLEGE_FRESHMAN.md',
  'What if every price had a ceiling built into the architecture? Cost + 20% — no more, ever.',
  ARRAY['medium'],
  'bishop',
  ARRAY['economics', 'pricing', 'cooperative'],
  'academic_paper',
  'BISHOP_DROPZONE/PAPERS_CONVERSATIONAL/ANTI_EXTRACTIVE_DERIVATIVE_COLLEGE_FRESHMAN.md',
  '{"golden_key": "FLOOR", "key_tier": "fledgling", "key_method": "natural", "feathers": 1}'::jsonb
),
(
  'What If You Could Know Your Profit Before You Built?',
  'publication', 'draft', 'normal',
  'See BISHOP_DROPZONE/PAPERS_CONVERSATIONAL/ROI_PREDICTABILITY_COLLEGE_FRESHMAN.md',
  'ROI predictability turns manufacturing into a certainty game, not a gamble.',
  ARRAY['medium'],
  'bishop',
  ARRAY['economics', 'manufacturing', 'business model'],
  'academic_paper',
  'BISHOP_DROPZONE/PAPERS_CONVERSATIONAL/ROI_PREDICTABILITY_COLLEGE_FRESHMAN.md',
  '{"golden_key": "CERTAINTY", "key_tier": "flight", "key_method": "acrostic", "feathers": 3}'::jsonb
);

-- Total: 18 new items seeded
