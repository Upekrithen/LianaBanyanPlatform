-- MoneyPenny Q&A Intelligence — qa_entries table
-- Tracks every incoming question across all channels

CREATE TABLE IF NOT EXISTS qa_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text text NOT NULL,
  answer_text text NOT NULL DEFAULT '',
  asker_name text NOT NULL,
  asker_email text,
  asker_user_id uuid REFERENCES auth.users(id),
  channel text NOT NULL CHECK (channel IN ('website', 'social_media', 'email', 'in_platform', 'discord')),
  classification text NOT NULL DEFAULT 'worthwhile' CHECK (classification IN ('worthwhile', 'duplicate', 'throwaway', 'flamer', 'troll', 'bot')),
  is_novel boolean NOT NULL DEFAULT true,
  marks_awarded numeric NOT NULL DEFAULT 0,
  follow_up_received boolean NOT NULL DEFAULT false,
  follow_up_marks_awarded numeric NOT NULL DEFAULT 0,
  ai_responder text NOT NULL DEFAULT 'MoneyPenny',
  status text NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'approved', 'rejected', 'sent', 'followed_up')),
  similar_question_ids uuid[],
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  sent_at timestamptz,
  follow_up_at timestamptz
);

ALTER TABLE qa_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on qa_entries"
  ON qa_entries FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users see own qa_entries"
  ON qa_entries FOR SELECT
  USING (asker_user_id = auth.uid());

-- Seed data: 25 sample Q&A entries spanning all channels, classifications, statuses
INSERT INTO qa_entries (question_text, answer_text, asker_name, asker_email, channel, classification, is_novel, marks_awarded, follow_up_received, follow_up_marks_awarded, ai_responder, status, similar_question_ids, created_at, reviewed_at, sent_at, follow_up_at) VALUES
('How does the three-currency system work? I understand Credits but what are Marks and Joules?', 'Credits are purchased with fiat ($1 = 1 Credit). Marks are effort-debt currency earned through participation. Joules are surplus storage with forever-stamp mechanics. All three hold equal value: 1 Credit = 1 Mark = 1 Joule.', 'Sarah Chen', 'sarah.chen@example.com', 'website', 'worthwhile', true, 5, true, 25, 'bishop', 'followed_up', NULL, '2026-03-10T09:15:00Z', '2026-03-10T09:45:00Z', '2026-03-10T10:00:00Z', '2026-03-10T14:30:00Z'),
('What is the Cost+20 pricing model?', 'Cost+20 is our reciprocity-based pricing law. Sellers set their own prices with a floor of cost plus 20%. This margin translates into purchasing power for buyers.', 'Marcus Williams', NULL, 'in_platform', 'worthwhile', true, 5, false, 0, 'rook', 'sent', NULL, '2026-03-10T11:20:00Z', '2026-03-10T11:35:00Z', '2026-03-10T11:40:00Z', NULL),
('How do I make money on this platform?', 'Complete bounties for Marks, sell products, become a Steward, join Crew Calls, or build XP through quality contributions. Value comes from demonstrated effort.', 'Jake Torres', 'jake.t@example.com', 'social_media', 'worthwhile', true, 5, true, 25, 'moneypenny', 'followed_up', NULL, '2026-03-11T08:00:00Z', '2026-03-11T08:20:00Z', '2026-03-11T08:25:00Z', '2026-03-11T15:10:00Z'),
('How do I make money on this platform?', 'See our previous answer. In short: bounties, marketplace sales, steward campaigns, crew calls, and XP progression.', 'Anonymous User', NULL, 'website', 'duplicate', false, 0, false, 0, 'pawn', 'sent', NULL, '2026-03-11T14:30:00Z', '2026-03-11T14:45:00Z', '2026-03-11T14:50:00Z', NULL),
('this is stupid lol', '', 'throwaway123', NULL, 'discord', 'throwaway', false, 0, false, 0, 'moneypenny', 'rejected', NULL, '2026-03-11T16:00:00Z', NULL, NULL, NULL),
('What is the BandWagon system and how does backing projects work?', 'BandWagon lets you back projects with Marks. When a project succeeds, you earn increased Service Allocation Authority (SAA). This is NOT investment return.', 'Diana Reeves', 'diana.r@example.com', 'email', 'worthwhile', true, 5, true, 25, 'bishop', 'followed_up', NULL, '2026-03-12T10:00:00Z', '2026-03-12T10:15:00Z', '2026-03-12T10:20:00Z', '2026-03-12T18:00:00Z'),
('Is this a crypto scam? Sounds like a ponzi scheme.', '', 'CryptoSkeptic99', NULL, 'social_media', 'troll', false, 0, false, 0, 'moneypenny', 'rejected', NULL, '2026-03-12T12:00:00Z', NULL, NULL, NULL),
('What are the requirements for Tereno Certification for HexIsle pieces?', 'Tereno Certified requires: lithographic manufacturing, compliant mechanisms only, cost under ceiling, 60mm flat-to-flat, water-safe materials, and full stack compatibility.', 'Maker Mike', 'mike@makerspace.org', 'in_platform', 'worthwhile', true, 5, false, 0, 'knight', 'sent', NULL, '2026-03-12T14:00:00Z', '2026-03-12T14:10:00Z', '2026-03-12T14:15:00Z', NULL),
('YOU PEOPLE ARE DESTROYING AMERICA WITH YOUR SOCIALIST GARBAGE', '', 'PatriotEagle1776', NULL, 'email', 'flamer', false, 0, false, 0, 'moneypenny', 'rejected', NULL, '2026-03-12T16:30:00Z', NULL, NULL, NULL),
('How does the XP Score system calculate reputation?', 'XP is multiplicative: for bounties XP = Score x Points. For products XP = price x volume x (quality/5.0). XP never decreases. Everyone starts at 100 rep.', 'Lena Park', NULL, 'website', 'worthwhile', true, 5, true, 25, 'rook', 'followed_up', NULL, '2026-03-13T09:00:00Z', '2026-03-13T09:20:00Z', '2026-03-13T09:25:00Z', '2026-03-13T16:45:00Z'),
('buy cheap viagra online www dot spam dot com', '', 'bot_user_38291', NULL, 'website', 'bot', false, 0, false, 0, 'moneypenny', 'rejected', NULL, '2026-03-13T03:22:00Z', NULL, NULL, NULL),
('Can I use HexIsle pieces with 3D-printed designs from my own printer?', 'Yes! Third-party designs fall under Tier 4 HexIsle Compatible. Submit designs through the Piggy-Back Protocol for tier classification.', 'PrinterPro', 'printerpro@gmail.com', 'discord', 'worthwhile', true, 5, false, 0, 'pawn', 'sent', NULL, '2026-03-13T11:15:00Z', '2026-03-13T11:30:00Z', '2026-03-13T11:35:00Z', NULL),
('What is a Steward and how do I become one?', 'A Steward manages campaigns end-to-end, pledging Marks as skin in the game. Tiers: Apprentice, Journeyman, Master Steward, Grand Steward.', 'Rachel Kim', NULL, 'in_platform', 'worthwhile', true, 5, false, 0, 'bishop', 'approved', NULL, '2026-03-14T08:30:00Z', '2026-03-14T09:00:00Z', NULL, NULL),
('What is a steward?', 'A Steward manages projects, pledging their own Marks for accountability. See our detailed answer linked below.', 'NewUser42', NULL, 'website', 'duplicate', false, 0, false, 0, 'moneypenny', 'sent', NULL, '2026-03-14T15:00:00Z', '2026-03-14T15:10:00Z', '2026-03-14T15:15:00Z', NULL),
('How does the Coverage Minutes system prevent people from dominating conversations?', 'The Muffled Rule gates speaking by listening. Earn minutes in 3-minute chunks with 180-minute cap and 90-day expiry.', 'Community Builder', 'builder@community.org', 'email', 'worthwhile', true, 5, true, 25, 'rook', 'followed_up', NULL, '2026-03-14T10:00:00Z', '2026-03-14T10:20:00Z', '2026-03-14T10:25:00Z', '2026-03-14T19:00:00Z'),
('Is there a free trial or do I need to pay to join?', 'Membership is $5/year with a complete Viral Cue Card Deck. First onboarding cohort gets Founding Status.', 'Budget Buyer', NULL, 'social_media', 'worthwhile', true, 5, false, 0, 'pawn', 'sent', NULL, '2026-03-15T09:00:00Z', '2026-03-15T09:15:00Z', '2026-03-15T09:20:00Z', NULL),
('asdf asdf asdf test test test', '', 'test_bot_7742', NULL, 'website', 'bot', false, 0, false, 0, 'moneypenny', 'rejected', NULL, '2026-03-15T02:14:00Z', NULL, NULL, NULL),
('What makes this different from every other failed cooperative?', 'Several structural innovations: three-currency system, Cost+20, IP Load Balancing, preorder-funded manufacturing, and XP Score.', 'Skeptical Sam', 'sam@startupworld.io', 'email', 'worthwhile', true, 5, true, 25, 'bishop', 'followed_up', NULL, '2026-03-15T13:00:00Z', '2026-03-15T13:30:00Z', '2026-03-15T13:35:00Z', '2026-03-16T08:00:00Z'),
('What is Ghost World?', 'Ghost World is a risk-free practice realm with time dilation. Root Lock principle: if it fits, it sits. Safe sandbox for learning.', 'Curious Cat', NULL, 'in_platform', 'worthwhile', true, 5, false, 0, 'knight', 'approved', NULL, '2026-03-16T10:00:00Z', '2026-03-16T10:15:00Z', NULL, NULL),
('Can I refer friends and earn rewards?', 'The six-tier referral system rewards you based on when you join: Pioneer (1-100) earns 10 Marks per referral, scaling down. Cue Card must be sent BEFORE signup.', 'Network Nelly', NULL, 'website', 'worthwhile', true, 5, false, 0, 'moneypenny', 'pending_review', NULL, '2026-03-17T08:00:00Z', NULL, NULL, NULL),
('you guys are scammers and I will report you to the FTC', '', 'AngryAndy', NULL, 'social_media', 'flamer', false, 0, false, 0, 'moneypenny', 'rejected', NULL, '2026-03-17T11:00:00Z', NULL, NULL, NULL),
('How does the Harper Guild work? Are they like moderators?', 'Harper Guild members are ethics checkers and truth-tellers — the cooperative''s immune system for truthfulness.', 'Ethics Enthusiast', 'ethics@university.edu', 'email', 'worthwhile', true, 5, false, 0, 'rook', 'pending_review', NULL, '2026-03-17T14:00:00Z', NULL, NULL, NULL),
('How does referral work again?', 'See our previous detailed answer about the six-tier referral system.', 'ForgetfulFred', NULL, 'discord', 'duplicate', false, 0, false, 0, 'pawn', 'sent', NULL, '2026-03-17T16:00:00Z', '2026-03-17T16:10:00Z', '2026-03-17T16:15:00Z', NULL),
('What is the Senate and how does governance work?', 'The Senate is a hex-hub governance space. Members shape policy through Pledged Mark Voting — commitment-weighted influence.', 'GovNerd', NULL, 'in_platform', 'worthwhile', true, 5, false, 0, 'bishop', 'pending_review', NULL, '2026-03-18T07:30:00Z', NULL, NULL, NULL),
('Can I sell food through the platform? I make homemade hot sauce.', 'Yes! Let''s Make Dinner supports food entrepreneurs with Cottage Law integration. List in Marketplace, production begins after preorders hit threshold.', 'HotSauceHank', 'hank@hotsauce.biz', 'website', 'worthwhile', true, 5, false, 0, 'moneypenny', 'pending_review', NULL, '2026-03-18T09:00:00Z', NULL, NULL, NULL);
