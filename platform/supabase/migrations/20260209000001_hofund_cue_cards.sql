-- ═══════════════════════════════════════════════════════════════
-- HOFUND DIAL SYSTEM + CUE CARD GENERATION
-- Hofund = Heimdall's sword. Controls where your QR routes.
-- Cue Cards = social media marketing images with your QR stamped in.
-- ═══════════════════════════════════════════════════════════════

-- ─── HOFUND CHANNEL SETTINGS ───
-- Each medallion has its own Hofund dial position.
-- The dial controls where the QR code routes when scanned.

CREATE TABLE IF NOT EXISTS public.hofund_channels (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  medallion_id    TEXT,                              -- blockchain token ID (nullable for default)
  
  -- Channel configuration
  channel_number  INTEGER NOT NULL DEFAULT 1,        -- 1-10 dial position
  channel_name    TEXT NOT NULL,                      -- display name
  channel_type    TEXT NOT NULL DEFAULT 'platform',   -- platform | project | custom | social
  destination_url TEXT,                               -- where QR routes to
  project_id      UUID REFERENCES public.projects(id), -- if channel_type = 'project'
  
  -- Display
  icon            TEXT DEFAULT '📺',                  -- emoji icon for dial
  is_active       BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, medallion_id, channel_number)
);

-- Default channels seeded per user (triggered on membership)
-- Channel 1: My Portfolio
-- Channel 2: My Projects
-- Channel 3: My Achievements
-- Channel 4: Platform Home
-- Channels 5-10: Custom (user-defined)

CREATE INDEX idx_hofund_user ON public.hofund_channels(user_id);
CREATE INDEX idx_hofund_medallion ON public.hofund_channels(medallion_id);

-- ─── CURRENT DIAL POSITION ───
-- Tracks which channel the member's dial is currently set to.

CREATE TABLE IF NOT EXISTS public.hofund_dial_position (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  medallion_id    TEXT,                              -- which medallion (null = default)
  current_channel INTEGER NOT NULL DEFAULT 4,        -- current dial position
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, medallion_id)
);

CREATE INDEX idx_hofund_dial_user ON public.hofund_dial_position(user_id);

-- ─── CUE CARD TEMPLATES ───
-- Pre-designed social media card templates, organized by project/initiative.
-- Members select from these when creating their sharable cue cards.

CREATE TABLE IF NOT EXISTS public.cue_card_templates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- What this template is for
  project_id      UUID REFERENCES public.projects(id),
  initiative_slug TEXT,                              -- e.g. 'lets-make-dinner'
  template_type   TEXT NOT NULL DEFAULT 'general',   -- general | project | initiative | letter | innovation
  
  -- Content
  title           TEXT NOT NULL,
  subtitle        TEXT,
  body_text       TEXT NOT NULL,                     -- pre-written social post text
  hashtags        TEXT[] DEFAULT '{}',               -- array of hashtags
  
  -- Visual design
  background_type TEXT DEFAULT 'gradient',           -- gradient | image | solid
  background_value TEXT DEFAULT 'from-primary/20 to-secondary/20',
  accent_color    TEXT DEFAULT 'primary',
  card_style      TEXT DEFAULT 'standard',           -- standard | bold | minimal | quote
  
  -- QR stamp zone (where the member's QR gets placed)
  qr_position     TEXT DEFAULT 'bottom-right',       -- bottom-right | bottom-left | center | top-right
  qr_size         INTEGER DEFAULT 120,               -- pixels
  
  -- Platform-specific variants
  twitter_text    TEXT,                               -- character-limited version
  linkedin_text   TEXT,                               -- professional version
  facebook_text   TEXT,
  
  -- Metadata
  is_active       BOOLEAN DEFAULT true,
  sort_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cue_card_templates_project ON public.cue_card_templates(project_id);
CREATE INDEX idx_cue_card_templates_initiative ON public.cue_card_templates(initiative_slug);
CREATE INDEX idx_cue_card_templates_type ON public.cue_card_templates(template_type);

-- ─── STAMPED CUE CARDS (Member-generated) ───
-- When a member selects a template and stamps their QR,
-- this records the specific card they created.

CREATE TABLE IF NOT EXISTS public.stamped_cue_cards (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id     UUID NOT NULL REFERENCES public.cue_card_templates(id),
  medallion_id    TEXT,                              -- which medallion's QR was stamped
  
  -- The stamped card
  qr_data_url     TEXT,                              -- the QR code data (RedCarpet link)
  card_image_url  TEXT,                              -- generated card image URL (if stored)
  custom_text     TEXT,                              -- member's edits to body text
  
  -- Distribution tracking
  share_count     INTEGER DEFAULT 0,
  click_count     INTEGER DEFAULT 0,                 -- tracked via RedCarpet views
  conversion_count INTEGER DEFAULT 0,                -- resulted in signup
  
  -- Social media posts
  shared_platforms TEXT[] DEFAULT '{}',               -- which platforms shared to
  scheduled_at    TIMESTAMPTZ,                        -- if scheduled for future
  published_at    TIMESTAMPTZ,                        -- when actually posted
  
  -- Timestamps
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stamped_cards_user ON public.stamped_cue_cards(user_id);
CREATE INDEX idx_stamped_cards_template ON public.stamped_cue_cards(template_id);

-- ─── SOCIAL MEDIA PLUGS ───
-- Connected social media accounts for one-click distribution.

CREATE TABLE IF NOT EXISTS public.social_media_plugs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Platform connection
  platform        TEXT NOT NULL,                      -- twitter | linkedin | facebook | instagram | tiktok | mastodon
  platform_user_id TEXT,                              -- their ID on that platform
  platform_username TEXT,                             -- display name
  account_type    TEXT DEFAULT 'personal',            -- personal | business | creator
  
  -- OAuth tokens (encrypted in practice)
  access_token    TEXT,
  refresh_token   TEXT,
  token_expires_at TIMESTAMPTZ,
  
  -- Status
  is_connected    BOOLEAN DEFAULT false,
  last_posted_at  TIMESTAMPTZ,
  post_count      INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, platform, platform_user_id)
);

CREATE INDEX idx_social_plugs_user ON public.social_media_plugs(user_id);

-- ═══════════════════════════════════════════════════════════════
-- RLS POLICIES
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.hofund_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hofund_dial_position ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cue_card_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stamped_cue_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_media_plugs ENABLE ROW LEVEL SECURITY;

-- Hofund: members manage their own channels
CREATE POLICY "Users manage own channels" ON public.hofund_channels
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own dial" ON public.hofund_dial_position
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Templates: everyone can read, admins can write
CREATE POLICY "Anyone can read templates" ON public.cue_card_templates
  FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "Admins manage templates" ON public.cue_card_templates
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Stamped cards: members manage their own
CREATE POLICY "Users manage own cards" ON public.stamped_cue_cards
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Social plugs: members manage their own
CREATE POLICY "Users manage own plugs" ON public.social_media_plugs
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- SEED DATA: Default cue card templates
-- ═══════════════════════════════════════════════════════════════

INSERT INTO public.cue_card_templates (template_type, initiative_slug, title, subtitle, body_text, hashtags, card_style, twitter_text, linkedin_text) VALUES
-- General platform templates
('general', NULL, 'The Golden Key', 'Help each other help ourselves', 'A platform where creators keep 83.3% of every transaction. Not a policy — a constitutional lock. No vote can change it. Ever. $5/year. No gatekeeping.', ARRAY['LianaBanyan', 'HelpEachOther', 'CooperativeEconomics'], 'quote',
  '🗝️ "Help each other help ourselves." A platform where creators keep 83.3%. Not a policy — a constitutional lock. $5/year. lianabanyan.com/RedCarpet #LianaBanyan',
  'I just discovered a cooperative commerce platform where creators keep 83.3% of every transaction — constitutionally locked, not just promised. The platform margin is Cost+20%, permanently. $5/year membership. No VC. No extraction. Just community commerce.'),

('general', NULL, 'Cannot Enshittify', 'The economics are locked', 'What if a platform literally could not enshittify? Cost+20% margin locked by DNA Lock. 83.3% to creators, forever. 1,200+ innovations. 8 patents with no prior art. This exists.', ARRAY['LianaBanyan', 'AntiEnshittification', 'CreatorEconomy'], 'bold',
  '🔒 What if a platform literally COULD NOT enshittify? Cost+20% locked by DNA Lock. 83.3% to creators. Forever. It exists. lianabanyan.com/RedCarpet #LianaBanyan',
  'The word "enshittification" describes what happens when platforms extract from users to please investors. What if a platform made that structurally impossible? Cost+20% constitutional margin. 83.3% to creators. DNA Lock prevents changes. This is real.'),

('general', NULL, '8 Crown Jewels', '1,200+ innovations, 8 with no prior art', '130 innovations deep-dived against the U.S. Patent Office. Eight survived with zero prior art. A cooperative commerce platform backed by real IP, not promises.', ARRAY['LianaBanyan', 'Innovation', 'PatentPortfolio'], 'standard',
  '💎 1,200+ innovations. 130 deep-dived against USPTO. 8 survived with ZERO prior art. A cooperative platform backed by real IP. lianabanyan.com/RedCarpet #LianaBanyan',
  '1,200+ innovations across a cooperative commerce platform. 130 were deep-dived against the U.S. Patent Office. Eight survived with zero relevant prior art. These ''Crown Jewels'' span economics, governance, manufacturing, and IP protection.'),

-- Initiative-specific templates
('initiative', 'lets-make-dinner', 'Let''s Make Dinner', 'Neighbors feeding neighbors', 'Home cooks sharing meals with their community. 83.3% of every dollar goes to the cook. No algorithms deciding who eats — just people cooking for people.', ARRAY['LianaBanyan', 'LetsMakeDinner', 'CommunityFood', 'HomeCooked'], 'standard',
  '🍽️ Neighbors feeding neighbors. Home cooks keep 83.3%. No algorithms — just people cooking for people. lianabanyan.com/RedCarpet #LetsMakeDinner #LianaBanyan',
  'Imagine a platform where home cooks share meals with their community and keep 83.3% of every dollar. No delivery fees eating into their earnings. No algorithm deciding who eats. Just neighbors feeding neighbors, cooperatively.'),

('initiative', 'jukebox', 'JukeBox', 'Music ownership returned to artists', 'Artists keep 83.3% of every stream, sale, and license. That number is constitutionally locked. No one — no CEO, no board, no investor — can ever change it.', ARRAY['LianaBanyan', 'JukeBox', 'MusicOwnership', 'ArtistFirst'], 'bold',
  '🎵 Artists keep 83.3% of every stream. Constitutionally locked. No one can ever change it. lianabanyan.com/RedCarpet #JukeBox #LianaBanyan',
  'What if music streaming actually paid artists? JukeBox gives artists 83.3% of every stream, sale, and license — constitutionally locked by DNA Lock. No future CEO can change that number. Ever.'),

('initiative', 'defense-klaus', 'Defense Klaus', 'For someone you love', 'Domestic violence protection through cooperative infrastructure. Safety planning, emergency resources, community shields. Funded by the platform, not extracted from survivors.', ARRAY['LianaBanyan', 'DefenseKlaus', 'ForSomeoneYouLove', 'EndDV'], 'minimal',
  '🛡️ "For Someone You Love." Domestic violence protection through cooperative infrastructure. Not charity — architecture. lianabanyan.com/RedCarpet #DefenseKlaus',
  'Defense Klaus: domestic violence protection built into a cooperative platform''s infrastructure. Safety planning, emergency resources, community shields — funded by the platform margin, not extracted from survivors. "For Someone You Love."'),

('initiative', 'lifeline-medications', 'LifeLine Medications', 'Medicine at cost, not at markup', 'Medication access through cooperative buying power. Cost+20% applied to pharmaceuticals. Members pay what drugs actually cost, plus a transparent margin.', ARRAY['LianaBanyan', 'LifeLine', 'MedicineForAll', 'TransparentPricing'], 'standard',
  '💊 Medicine at Cost+20%. Not markup — transparency. Cooperative buying power for medications. lianabanyan.com/RedCarpet #LifeLine #LianaBanyan',
  'LifeLine Medications: access to medicine through cooperative buying power. Cost+20% applied to pharmaceuticals — members pay what drugs actually cost, plus a transparent 20% margin. No hidden fees. No price gouging. Constitutional.'),

-- Letter-specific templates
('letter', NULL, 'Cardboard Boots', 'An open letter to MacKenzie Scott', 'An open letter asking for reputation, not money. Three references from people who understand cooperative economics. That''s the ask. Read it on Cephas.', ARRAY['LianaBanyan', 'CardboardBoots', 'OpenLetter'], 'quote',
  '📬 "I don''t want your money. I want your rolodex." An open letter to MacKenzie Scott. lianabanyan.com/RedCarpet/mackenzie-scott #CardboardBoots',
  'An open letter to MacKenzie Scott: "I don''t want your money. I want your rolodex." A cooperative platform founder asks for three references, not funding. Read the full letter.'),

('letter', NULL, 'One Crown, One Offer', 'An open letter to Michael Seibel', 'A CEO offer to the former head of Y Combinator. One Crown. One Offer. One Leader. "I''m structurally building this so the CEO role is a professional, accountable seat from day one."', ARRAY['LianaBanyan', 'OneCrown', 'OpenLetter', 'CEO'], 'bold',
  '👑 "One Crown. One Offer. One Leader." A CEO offer to the former head of Y Combinator. lianabanyan.com/RedCarpet/michael-seibel #LianaBanyan',
  'A cooperative commerce platform with 1,200+ innovations is looking for a CEO. Not the founder — he designed himself out of the role. One Crown, One Offer, One Leader. Read the open letter to Michael Seibel.'),

-- Warren Buffett letter
('letter', NULL, 'The Oracle''s Question', 'An open letter to Warren Buffett', 'What would you say to Warren Buffett if you had 500 words? Here''s what we''re saying when we hit 100 members. Value investing meets constitutional economics.', ARRAY['LianaBanyan', 'OracleOfOmaha', 'OpenLetter', 'ValueInvesting'], 'quote',
  '📬 What would you say to @WarrenBuffett if you had 500 words? Here''s what we''re saying. lianabanyan.com/RedCarpet/warren-buffett #LianaBanyan',
  'What would you say to Warren Buffett if you had 500 words? A cooperative platform with constitutional economics — Cost+20% locked forever — wrote him a letter. Value investing meets cooperative commerce.'),

-- The 300 recruiting
('letter', NULL, 'The 300', 'We''re identifying 300 leaders', 'We''re identifying 300 leaders to govern a community-owned platform. Here''s who we''re looking for. Not politicians — builders, teachers, healers, makers.', ARRAY['LianaBanyan', 'The300', 'CooperativeGovernance', 'Leadership'], 'bold',
  '🛡️ We''re looking for 300 leaders to govern a community-owned platform. Not politicians — builders, teachers, healers. lianabanyan.com #The300 #LianaBanyan',
  'We''re identifying 300 leaders to govern a community-owned platform of millions. The 300 Framework is a governance architecture with hard-coded size limits and defined overflow mechanics. We''re looking for builders, teachers, healers, and makers.'),

-- Under the Hood documents
('general', NULL, 'Harper System', 'Trust isn''t given. It''s computed.', 'Trust isn''t given. It''s computed. Here''s how Liana Banyan automates auditor selection. No committees. No politics. Just math.', ARRAY['LianaBanyan', 'AutomatedTrust', 'HarperSystem', 'Governance'], 'minimal',
  '🔍 Trust isn''t given. It''s computed. Here''s how one platform automates auditor selection with math, not committees. lianabanyan.com #HarperSystem #LianaBanyan',
  'Trust isn''t given. It''s computed. The Harper System automates auditor selection using algorithmic fairness — no committees, no politics, just math. Read how it works.'),

('general', NULL, 'Marks for Marks', 'Babysitting for plumbing', 'Babysitting for plumbing. Guitar lessons for lawn care. Here''s how neighbors help neighbors with MARKS — non-transferable reputation currency earned only by doing.', ARRAY['LianaBanyan', 'MARKS', 'TimeBank', 'NeighborHelp', 'CooperativeEconomics'], 'standard',
  '🤝 Babysitting for plumbing. Guitar lessons for lawn care. MARKS: the currency you earn by helping. lianabanyan.com #MARKS #LianaBanyan',
  'MARKS is a non-transferable reputation currency. You can''t buy it — only earn it by helping others. Babysitting for plumbing. Guitar lessons for lawn care. Neighbors helping neighbors, with receipts.'),

('general', NULL, 'The 300 Governance', '300 people will govern a platform of millions', '300 people will govern a platform of millions. Here''s how the selection works. Hard-coded organization size limits with defined overflow mechanics. Governance by design.', ARRAY['LianaBanyan', 'The300', 'Governance', 'CooperativeModel'], 'standard',
  '🏛️ 300 people will govern a platform of millions. Hard-coded limits. Defined overflow. Governance by design. lianabanyan.com #The300 #LianaBanyan',
  '300 people will govern a cooperative platform of millions. The 300 Framework has hard-coded organization size limits with defined overflow/split mechanics. When you hit 300, you split. No exceptions. No empire building.'),

('general', NULL, 'Bond Account', 'Put your money where your MARKS are', 'Put your money where your MARKS are. Here''s how collateral creates accountability. Skin in the game, cooperatively.', ARRAY['LianaBanyan', 'BondAccount', 'Accountability', 'Collateral'], 'standard',
  '💰 Put your money where your MARKS are. Collateral creates accountability. Skin in the game, cooperatively. lianabanyan.com #BondAccount #LianaBanyan',
  'Bond Accounts create accountability through collateral. Members stake their own credibility. Put your money where your MARKS are — skin in the game, cooperatively.'),

-- Academic papers
('general', NULL, 'Automated Trust Paper', 'How do you select auditors without bias?', 'New paper: How do you select auditors without bias? With math. Read the Harper Certification System — decentralized quality assurance backed by algorithmic fairness.', ARRAY['LianaBanyan', 'AcademicPaper', 'AutomatedTrust', 'Harper'], 'minimal',
  '📄 How do you select auditors without bias? With math. New paper: The Harper Certification System. lianabanyan.com #AutomatedTrust #LianaBanyan',
  'New academic paper: How do you select auditors without bias? The Harper Certification System uses algorithmic fairness to automate quality assurance. No committees. No politics. Just math and accountability.'),

('general', NULL, 'Band Strategy Paper', 'When everyone succeeds, the band succeeds', 'When everyone in the band succeeds, the band succeeds. Here''s the economic model — cooperative economics where individual success drives collective prosperity.', ARRAY['LianaBanyan', 'AcademicPaper', 'BandStrategy', 'CooperativeEconomics'], 'quote',
  '🎸 When everyone in the band succeeds, the band succeeds. The economic model that proves it. lianabanyan.com #BandStrategy #LianaBanyan',
  'When everyone in the band succeeds, the band succeeds. A new economic model proving that cooperative economics — where individuals keep 83.3% — drives collective prosperity better than extraction.'),

-- Milestone-triggered cue cards
('general', NULL, 'MacKenzie Scott Reached', 'We''ve reached out. Read the letter.', 'We''ve reached out to MacKenzie Scott. Read our open letter: Cardboard Boots — asking for reputation, not money. Three references. That''s the ask.', ARRAY['LianaBanyan', 'CardboardBoots', 'MacKenzieScott', 'OpenLetter'], 'bold',
  '📬 We''ve reached out to MacKenzie Scott. Read our open letter. Not asking for money — asking for her rolodex. lianabanyan.com/RedCarpet/mackenzie-scott #CardboardBoots',
  NULL),

('general', NULL, '100 Members Strong', 'Time to invite Warren Buffett', '100 members strong! Time to invite Warren Buffett to see what we''re building. A cooperative platform with constitutional economics — exactly the kind of value investing he preaches.', ARRAY['LianaBanyan', '100Members', 'WarrenBuffett', 'Milestone'], 'bold',
  '🎉 100 members strong! Time to invite @WarrenBuffett. A platform with constitutional economics he''d recognize. lianabanyan.com #LianaBanyan',
  NULL),

('general', NULL, 'THE 300 IDENTIFIED', 'Our leadership council takes shape', 'THE 300 ARE IDENTIFIED. Our leadership council is taking shape. 300 builders, teachers, healers, and makers — governing a cooperative platform by design, not politics.', ARRAY['LianaBanyan', 'The300', 'Milestone', 'Leadership'], 'bold',
  '🛡️ THE 300 ARE IDENTIFIED. Our leadership council is taking shape. 300 builders, not politicians. lianabanyan.com #The300 #LianaBanyan',
  NULL),

('general', NULL, 'First Harper Certified', 'Decentralized quality assurance is LIVE', 'Our first Harper Auditor is certified! Decentralized quality assurance is LIVE. Trust isn''t given — it''s computed. The Harper System is real.', ARRAY['LianaBanyan', 'Harper', 'Milestone', 'QualityAssurance'], 'standard',
  '✅ First Harper Auditor CERTIFIED! Decentralized quality assurance is LIVE. Trust computed, not granted. lianabanyan.com #Harper #LianaBanyan',
  NULL),

('general', NULL, 'First Node Live', 'The network grows', 'First node passes inspection! The network grows. A cooperative commerce node — real people, real transactions, real 83.3% to creators. This is happening.', ARRAY['LianaBanyan', 'FirstNode', 'Milestone', 'NetworkGrowth'], 'standard',
  '🌱 First node passes inspection! The cooperative commerce network grows. Real transactions, 83.3% to creators. lianabanyan.com #LianaBanyan',
  NULL),

-- Standalone special cards
('general', NULL, 'Work From Home', 'In the Hive, Making Honey. For Bread.', 'The Colony. The Forge. The Kitchen. The Nursery. The Field. Every Guild is a room in the Hive. Every worker makes their own kind of honey. Find your room. Make your honey. Help each other help ourselves.', ARRAY['LianaBanyan', 'WorkFromHome', 'TheHive', 'GuildSystem', 'MakeHoney'], 'quote',
  '🐝 WORK FROM HOME. In the Hive, making Honey. For Bread. Find your room. Make your honey. lianabanyan.com #TheHive #LianaBanyan',
  'The Hive: every Guild is a room. The Kitchen. The Forge. The Classroom. The Clinic. Every worker makes their own kind of honey. Find your room. Make your honey. Help each other help ourselves. 83.3% stays with the worker. Always.'),

('general', NULL, 'Real Ownership', 'Not a thank-you. Not a t-shirt. OWNERSHIP.', 'Most crowdfunding gives you a thing. We give you a stake. Fund our patents, own a piece of everything they enable. When we license, you get paid. This isn''t charity — this is investment.', ARRAY['LianaBanyan', 'PatentOwnership', 'RealOwnership', 'Crowdfunding'], 'bold',
  '💎 "Not a thank-you. Not a t-shirt. OWNERSHIP." Back our patents, own a piece of everything they enable. lianabanyan.com #RealOwnership #LianaBanyan',
  'Most crowdfunding gives you a thing. We give you a STAKE. Fund our patents, own a piece of everything they enable. When companies license our technology, you get paid. This isn''t charity — this is investment.'),

('general', NULL, 'Angry? Do Something About It.', 'Start a Business.', 'Anger comes from frustration. Frustration comes from a lack of satisfaction. Satisfaction comes from controlling your life. Choosing what you do. How you do it. When you do it. For clients YOU choose. Choose your life.', ARRAY['LianaBanyan', 'StartABusiness', 'TakeControl', 'ChooseYourLife'], 'bold',
  '🔥 Angry? Do something about it. Start a business. Choose what you do. How. When. For whom. lianabanyan.biz #ChooseYourLife #LianaBanyan',
  'Anger comes from frustration. Frustration comes from a lack of satisfaction. Satisfaction comes from controlling your life. Choosing what you do. How you do it. When you do it. For clients YOU choose. Choose your life. LianaBanyan.biz'),

-- ═══════════════════════════════════════════════════════
-- FOUNDER''S VISUAL CUE CARDS (CSS flip-card style)
-- These are the iconic visual cards with imagery + text
-- ═══════════════════════════════════════════════════════

-- Welcome, Captain
('general', NULL, 'Welcome, Captain', 'the2ndSecond.com', 'Welcome, Captain. You found us. the2ndSecond.com — where we document everything, transparently, in real time. The authorized version.', ARRAY['LianaBanyan', 'Cephas', 'WelcomeCaptain', 'the2ndSecond'], 'bold',
  '⚓ Welcome, Captain. You found us. the2ndsecond.com #WelcomeCaptain #LianaBanyan',
  NULL),

-- Pretend THIS is a Seed (Wall-E shoe with plant)
('general', NULL, 'Pretend THIS is a Seed', 'LianaBanyan.com', 'A worn shoe with a green sprout growing from it. New life from unexpected places. Pretend THIS is a seed. Plant it. Watch what grows. LianaBanyan.com', ARRAY['LianaBanyan', 'PretendThisIsASeed', 'NewBeginnings', 'PlantIt'], 'quote',
  '🌱 Pretend THIS is a seed. Plant it. Watch what grows. lianabanyan.com #LianaBanyan',
  NULL),

-- Leap of Faith (Inception dreamscape)
('general', NULL, 'Leap of Faith', 'Do you want to take a leap of faith?', 'Do you want to take a leap of faith, or become an old man, filled with regret, waiting to die alone? A dream skyline folds into the sea. The question isn''t whether it''s real. The question is whether you''re brave enough.', ARRAY['LianaBanyan', 'LeapOfFaith', 'NoRegrets'], 'bold',
  '🌊 Do you want to take a leap of faith, or become an old man, filled with regret, waiting to die alone? lianabanyan.com #LeapOfFaith',
  NULL),

-- Lottery Tickets ($300 vs $5)
('general', NULL, '$300 on Lottery Tickets', '$5 Business at LianaBanyan.com', 'Americans, on average, spend $300 per year on Lottery Tickets. $5 Business at LianaBanyan.com. Three scratched-off losers in a pile. Or one real shot.', ARRAY['LianaBanyan', 'FiveDollarBusiness', 'BetterOdds', 'RealShot'], 'bold',
  '🎰 Americans spend $300/year on lottery tickets. $5 gets you a real business. lianabanyan.com #BetterOdds #LianaBanyan',
  'Americans, on average, spend $300 per year on lottery tickets. Three scratched-off losers in a pile. For $5, you could start a real business on a cooperative platform where you keep 83.3% of every dollar.'),

-- A Ship is Safe in Harbor
('general', NULL, 'A Ship is Safe in Harbor', 'But that''s not what ships are built for.', 'A ship is safe in harbor. But that''s not what ships are built for. Set sail. LianaBanyan.com', ARRAY['LianaBanyan', 'SetSail', 'ShipInHarbor', 'Courage'], 'quote',
  '⛵ A ship is safe in harbor. But that''s not what ships are built for. lianabanyan.com #SetSail #LianaBanyan',
  NULL),

-- Not a Job — A Way Out (hazard tape)
('general', NULL, 'Not a Job', 'A Way Out.', 'NOT A JOB. [hazard tape] A WAY OUT. This isn''t employment. This is infrastructure for building your own life. 83.3% of everything you earn. Constitutional. Permanent.', ARRAY['LianaBanyan', 'NotAJob', 'AWayOut', 'Entrepreneurship'], 'bold',
  '⚠️ Not a Job. A WAY OUT. 83.3% of everything you earn. Constitutional. Permanent. lianabanyan.com #AWayOut #LianaBanyan',
  NULL),

-- Hiring Secret Agents to Help People
('general', NULL, 'Hiring Secret Agents', 'To Help People.', 'HIRING [SECRET] AGENTS — To Help People. If you know how to do what you are doing; we need you. Old-timey private eye hat. Dark shades. No face. Just purpose.', ARRAY['LianaBanyan', 'HiringAgents', 'SecretAgents', 'HelpPeople'], 'bold',
  '🕵️ HIRING [SECRET] AGENTS — To Help People. If you know how to do what you''re doing, we need you. lianabanyan.com #LianaBanyan',
  NULL),

-- We Believe in YOU ($100 credits)
('general', NULL, 'We Believe in YOU', 'Believe in Yourself. $100 Credits to Start.', 'We Believe in YOU. Believe in Yourself. $100 of Platform Credits to get you Started. No strings. No tricks. Just belief.', ARRAY['LianaBanyan', 'BelieveInYou', 'PlatformCredits', 'GetStarted'], 'standard',
  '💪 We Believe in YOU. Believe in Yourself. $100 of Platform Credits to get you started. lianabanyan.com #BelieveInYou #LianaBanyan',
  NULL),

-- Swing for the Fences
('general', NULL, 'SWING FOR THE FENCES', 'Babe Ruth. Warren Buffett. You.', 'SWING FOR THE FENCES. Babe Ruth. Warren Buffett. You. You might not hit a home run. At first. $5 Real World Business Simulator.', ARRAY['LianaBanyan', 'SwingForTheFences', 'HomeRun', 'BusinessSimulator'], 'bold',
  '⚾ SWING FOR THE FENCES. Babe Ruth. Warren Buffett. You. $5 Real World Business Simulator. lianabanyan.com #SwingForTheFences #LianaBanyan',
  NULL),

-- Join a Crew. Build a Ship.
('general', NULL, 'Join a Crew. Build a Ship.', 'Set out for Adventure.', 'Join a Crew. Build a Ship. Set out for Adventure. LianaBanyan.net — the network where people build together.', ARRAY['LianaBanyan', 'JoinACrew', 'BuildAShip', 'Adventure'], 'standard',
  '🚢 Join a Crew. Build a Ship. Set out for Adventure. lianabanyan.net #JoinACrew #LianaBanyan',
  NULL),

-- There is No Free Lunch (except when there IS)
('initiative', 'lets-make-dinner', 'There is No Free Lunch', 'Except, you know, when there IS.', 'There is No Free Lunch. Except, you know, when there IS. LianaBanyan.org — HAVE dinner to share? Or NEED one tonight? Let''s Make Dinner.', ARRAY['LianaBanyan', 'LetsMakeDinner', 'FreeLunch', 'CommunityFood'], 'quote',
  '🍽️ There is No Free Lunch. Except, you know, when there IS. lianabanyan.org #LetsMakeDinner #LianaBanyan',
  NULL),

-- We''re Going to Need an Army (ant colony from Bug''s Life)
('general', NULL, 'We''re Going to Need an Army', 'Ants carrying fragments with different hats', 'A field of flowers from an ant''s viewpoint. Carpenter ants carry leaf fragments, flower petals, seeds — each with a different hat. Construction, suits, baseball caps, graduation caps. We''re going to need an Army.', ARRAY['LianaBanyan', 'ArmyAnts', 'WeAreTheAnts', 'OneArmyAnt'], 'bold',
  '🐜 We''re going to need an Army. Construction hats. Graduation caps. Suits. All carrying something different. All going the same direction. lianabanyan.com #WeAreTheAnts #LianaBanyan',
  NULL),

-- Tristan and Yvain Babylon Candle (Sponsor-only)
('general', NULL, 'Tristan and Yvain Left This For YOU', 'Babylon Candle — 10 Uses Left', 'A black candle with a glow. Tristan and Yvain left this for YOU. Babylon Candle. 10 Uses Left. It''s yours — 100 Credits Gifted to you by your Sponsor. Light it wisely.', ARRAY['LianaBanyan', 'BabylonCandle', 'SponsorGift', 'Stardust'], 'minimal',
  '🕯️ Tristan and Yvain left this for you. Babylon Candle — 10 uses left. 100 Credits gifted by your Sponsor. lianabanyan.com #BabylonCandle #LianaBanyan',
  NULL),

-- The Game of Real Life
('general', NULL, 'The Game of Real Life', 'The Game to Make Money', 'The Game of Real Life. The Game to Make Money. Anyone can start a Node. Form a team. Submit a Charter. All members staked. LB fills in the blanks.', ARRAY['LianaBanyan', 'GameOfRealLife', 'StartANode', 'MakeMoney'], 'bold',
  '🎮 The Game of Real Life. The Game to Make Money. Start a Node. Form a team. Submit a Charter. lianabanyan.com #GameOfRealLife #LianaBanyan',
  NULL),

-- Mr. Anderson / NEO (Matrix red/blue choice)
('general', NULL, 'Mr. Anderson', 'Red button: Buy. Blue button: Build.', 'Mr. Anderson. [RED] Buy products and services. [BLUE] Become a sponsor and build. You know what each pill does. You''ve always known.', ARRAY['LianaBanyan', 'TheMatrix', 'RedOrBlue', 'ChooseYourPath'], 'bold',
  '💊 Mr. Anderson. Red: Buy. Blue: Build. You know what each pill does. You''ve always known. lianabanyan.com #LianaBanyan',
  NULL),

-- Waiting on a Train (Inception spinning top)
('general', NULL, 'You''re Waiting on a Train', 'A train that will take you far away.', 'You''re waiting on a train. A train that will take you far away. You know where you hope the train will take you, but you can''t know for sure. Or can you. LianaBanyan.com', ARRAY['LianaBanyan', 'WaitingOnATrain', 'Inception', 'OrCanYou'], 'quote',
  '🌀 You''re waiting on a train. You know where you hope it''ll take you, but you can''t know for sure. Or can you. lianabanyan.com #LianaBanyan',
  NULL),

-- HexIsle.com card
('general', NULL, 'HexIsle', 'No batteries. No screens. Just physics.', 'Water-powered. Gear-driven. Magnetically coupled. Palm trees that literally grow. No batteries. No screens. Just physics and imagination. HexIsle.com', ARRAY['HexIsle', 'LianaBanyan', 'WaterPowered', 'TabletopGaming', 'NoScreens'], 'standard',
  '🏝️ No batteries. No screens. Just physics and imagination. Water-powered gaming. hexisle.com #HexIsle #LianaBanyan',
  NULL),

-- ElSegundoSegundo.com card
('general', NULL, 'El Segundo Segundo', 'the2ndSecond.com / elsegundosegundo.com', 'El Segundo Segundo. The second second. Where everything is documented. Where transparency isn''t a promise — it''s the architecture. the2ndSecond.com', ARRAY['LianaBanyan', 'Cephas', 'ElSegundoSegundo', 'Transparency'], 'minimal',
  '📜 El Segundo Segundo. Where transparency isn''t a promise — it''s the architecture. the2ndsecond.com #LianaBanyan',
  NULL);
