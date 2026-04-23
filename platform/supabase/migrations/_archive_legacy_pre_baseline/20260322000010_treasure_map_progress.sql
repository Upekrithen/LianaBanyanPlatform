-- Treasure Map Progress + Knowledge Quiz Tables
-- Session 81: Onboarding funnel tracking

CREATE TABLE IF NOT EXISTS treasure_map_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  map_id TEXT NOT NULL,
  current_phase TEXT NOT NULL DEFAULT 'scout',
  current_level INTEGER NOT NULL DEFAULT 1,
  phase_data JSONB DEFAULT '{}',
  quiz_score INTEGER,
  quiz_attempts INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, map_id)
);

ALTER TABLE treasure_map_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own progress" ON treasure_map_progress
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON treasure_map_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON treasure_map_progress
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can read all treasure map progress" ON treasure_map_progress
  FOR SELECT USING (public.is_admin());

CREATE TABLE IF NOT EXISTS treasure_map_quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  map_id TEXT NOT NULL,
  category TEXT NOT NULL,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  difficulty INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE treasure_map_quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read quizzes" ON treasure_map_quizzes
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage quizzes" ON treasure_map_quizzes
  FOR ALL USING (public.is_admin());

-- Seed 55 questions

-- Category 1: Economics (Q1-Q12)
INSERT INTO treasure_map_quizzes (map_id, category, question_text, option_a, option_b, option_c, option_d, correct_answer, difficulty) VALUES
('general', 'economics', 'What percentage of every transaction goes to creators, makers, and workers?', '50%', '70%', '83.3%', '90%', 'c', 1),
('general', 'economics', 'What is Cost+20%?', 'A variable pricing formula', 'The floor price: cost of goods plus a fixed 20% platform fee', 'A maximum price cap', 'The seller''s margin target', 'b', 1),
('general', 'economics', 'How much does a basic Liana Banyan membership cost?', 'Free', '$5 per year', '$10 per month', '$25 per year', 'b', 1),
('general', 'economics', 'What are the three currencies in the LB system?', 'Dollars, Euros, Bitcoin', 'Credits, Marks, Joules', 'Coins, Tokens, Points', 'Credits, Vouchers, Stamps', 'b', 1),
('general', 'economics', 'What is 1 Credit worth?', '$0.50', '$1.00', '$5.00', 'It varies', 'b', 1),
('general', 'economics', 'What happens to platform revenue? (13.3% operations split)', 'It goes to shareholders', 'It funds platform infrastructure, legal, and support', 'It''s distributed as dividends', 'It''s held as profit', 'b', 2),
('general', 'economics', 'What is Gleaner''s Corner?', 'A marketplace section', 'A 3.3% community benefit fund from every transaction', 'A food donation program', 'A corner of the website for new members', 'b', 2),
('general', 'economics', 'Can Credits be converted to cash?', 'Yes, at any ATM', 'Yes, for a 10% fee', 'No — Credits stay in the cooperative system', 'Only after 1 year', 'c', 1),
('general', 'economics', 'What do Marks represent?', 'A type of cryptocurrency', 'Effort-debt that can only be spent on essentials', 'Loyalty points', 'Gift certificates', 'b', 2),
('general', 'economics', 'What are Joules?', 'Units of electrical energy', 'Surplus storage with "forever stamp" mechanics — LB owns them, members direct them', 'Premium currency for VIP members', 'Donation receipts', 'b', 3),
('general', 'economics', 'How many users does LB need in one metro area to be self-sustaining?', '100', '500', '1,000', '10,000', 'c', 2),
('general', 'economics', 'Who sets prices on the platform?', 'Liana Banyan sets all prices', 'Sellers set their own prices, with Cost+20% as the floor', 'Buyers name their price', 'An algorithm determines prices', 'b', 1);

-- Category 2: HEOHO + Philosophy (Q13-Q22)
INSERT INTO treasure_map_quizzes (map_id, category, question_text, option_a, option_b, option_c, option_d, correct_answer, difficulty) VALUES
('general', 'philosophy', 'What does HEOHO stand for?', 'Help Everyone Out, Help One', 'Help Each Other, Help Ourselves', 'Have Everything Open, Have Opportunity', 'Honor Each Obligation, Help Others', 'b', 1),
('general', 'philosophy', 'What is the core principle HEOHO represents?', 'Collectivism', 'Individualism', 'Interdependence', 'Competition', 'c', 1),
('general', 'philosophy', 'What Bible verse is the scriptural foundation of HEOHO?', 'Matthew 25:40', '1 Corinthians 12:21-26', 'Proverbs 22:6', 'Luke 6:38', 'b', 2),
('general', 'philosophy', 'What is the Amplifier Principle?', 'LB extracts a percentage from creators', 'LB makes partners louder — driving audience TO them, not from them', 'Members must promote LB on social media', 'A sound engineering feature of HexIsle', 'b', 2),
('general', 'philosophy', 'What does "As You Wish" mean on Liana Banyan?', 'A greeting', 'The universal transaction confirmation phrase', 'A cancellation request', 'A customer service phrase', 'b', 1),
('general', 'philosophy', 'What is the Founder''s political philosophy label?', 'Progressive Democrat', 'Libertarian Conservative', 'Patriotic Interdependentalist', 'Democratic Socialist', 'c', 2),
('general', 'philosophy', 'Which literary character represents Mission ONE?', 'Robin Hood', 'Bishop Myriel from Les Misérables', 'Gandalf', 'Atticus Finch', 'b', 2),
('general', 'philosophy', 'What is Mission ONE''s motto?', 'No one left behind', 'EVERYONE Eats Tonight', 'Feed the world', 'Food for all', 'b', 1),
('general', 'philosophy', 'What are the three Missions in order?', 'Transport, Food, Shelter', 'Food, Shelter, Transport', 'Shelter, Food, Transport', 'Education, Food, Health', 'b', 2),
('general', 'philosophy', 'Why does LB have no ads and no venture capital?', 'Can''t afford them yet', 'Ads extract attention and VC extracts ownership — both violate interdependence', 'They haven''t been offered', 'Government regulations prevent it', 'b', 2);

-- Category 3: Sweet Sixteen Initiatives (Q23-Q33)
INSERT INTO treasure_map_quizzes (map_id, category, question_text, option_a, option_b, option_c, option_d, correct_answer, difficulty) VALUES
('general', 'initiatives', 'How many cooperative initiatives does Liana Banyan operate?', '10', '12', '16', '20', 'c', 1),
('general', 'initiatives', 'What is "Let''s Make Dinner"?', 'A cooking show', 'The food security initiative — restaurants and home cooks serving the community', 'A meal kit delivery service', 'A recipe sharing platform', 'b', 1),
('general', 'initiatives', 'What is the Harper Guild?', 'A crafting cooperative', 'Ethics checkers and truth-tellers', 'A publishing house', 'A legal defense fund', 'b', 2),
('general', 'initiatives', 'What does "Let''s Make Bread" refer to?', 'A bakery chain', 'The business incubator', 'A bread-making tutorial', 'A financial literacy program', 'b', 1),
('general', 'initiatives', 'What is the JukeBox initiative?', 'An entertainment venue', 'Music licensing and One Take Wonders', 'A streaming service', 'A jukebox rental business', 'b', 2),
('general', 'initiatives', 'What is Defense Klaus?', 'A military program', 'Legal defense and community protection', 'A security company', 'An insurance product', 'b', 2),
('general', 'initiatives', 'What does Rally Group handle?', 'Political rallies', 'Transportation — Local Wheels, Lemon Lot, Rideshare Routes', 'Fundraising events', 'Sports teams', 'b', 1),
('general', 'initiatives', 'What is Didasko?', 'A Greek restaurant', 'The education initiative', 'A tech company', 'A fitness program', 'b', 1),
('general', 'initiatives', 'What is VSL?', 'Veteran Service League', 'Voucher Short Loans', 'Virtual Shopping List', 'Volunteer Service Line', 'b', 2),
('general', 'initiatives', 'What does the Household Concierge do?', 'Manages a neighborhood', 'Provides shared butler service for YOUR household', 'Runs a hotel front desk', 'Organizes community events', 'b', 2),
('general', 'initiatives', 'What is Lifeline Medications?', 'An emergency room service', 'Medical Savings Accounts and healthcare access', 'A pharmacy chain', 'A prescription delivery service', 'b', 2);

-- Category 4: Platform Features + Systems (Q34-Q45)
INSERT INTO treasure_map_quizzes (map_id, category, question_text, option_a, option_b, option_c, option_d, correct_answer, difficulty) VALUES
('general', 'features', 'What is the Star Chamber?', 'A secret society', 'A multi-AI governance system that reviews disputes with 4 judges', 'A VIP lounge', 'A dark room for photography', 'b', 1),
('general', 'features', 'What are the four Star Chamber judges?', 'Judge, Jury, Bailiff, Clerk', 'Oracle, Morpheus, Red Queen, Dredd', 'North, South, East, West', 'Fire, Water, Earth, Air', 'b', 1),
('general', 'features', 'What is a Treasure Map?', 'A scavenger hunt for prizes', 'A progressive skill-building pathway from Starter to Network level', 'A GPS navigation tool', 'A treasure hunt game', 'b', 1),
('general', 'features', 'What are the four Treasure Map levels?', 'Bronze, Silver, Gold, Platinum', 'Starter, Apprentice, Journeyman, Network', 'Beginner, Intermediate, Advanced, Expert', 'Level 1, 2, 3, 4', 'b', 1),
('general', 'features', 'What is a Crew Call?', 'A phone conference', 'A bounty for a specific task that assembles a team around a Round Table', 'A staff meeting', 'An emergency alert', 'b', 2),
('general', 'features', 'What is the Lemon Lot?', 'A parking lot', 'Peer-to-peer vehicle sharing — named after army base used-car lots', 'A fruit stand', 'A lemon farm', 'b', 2),
('general', 'features', 'What is a Beacon?', 'A lighthouse', 'A guided discovery tour that teaches platform features through interaction', 'A Wi-Fi hotspot', 'A signal flare', 'b', 1),
('general', 'features', 'What is Six Degrees?', 'Kevin Bacon''s game', 'A bounty-driven connection engine to reach specific people through referral chains', 'A temperature measurement', 'A degree program', 'b', 2),
('general', 'features', 'What does the Safety Ledger record?', 'Vehicle condition', 'Photos of PEOPLE (driver and passenger) with timestamps and GPS for evidentiary purposes', 'Financial transactions', 'Safety inspection results', 'b', 2),
('general', 'features', 'What is the Bridge?', 'A card game', 'The Node Captain''s command interface', 'A river crossing', 'A networking event', 'b', 2),
('general', 'features', 'What are Multipliers?', 'Math operations', 'Node role slots — NOT "helpers" or "workers"', 'Investment returns', 'Marketing strategies', 'b', 2),
('general', 'features', 'What is a Keeper?', 'A goalkeeper', 'A Freezer Babysitter — the role that manages food storage', 'A security guard', 'A record keeper', 'b', 3);

-- Category 5: Innovation + IP (Q46-Q55)
INSERT INTO treasure_map_quizzes (map_id, category, question_text, option_a, option_b, option_c, option_d, correct_answer, difficulty) VALUES
('general', 'innovation', 'How many innovations has Liana Banyan documented?', '500', '1,000', '1,935', '2,500', 'c', 1),
('general', 'innovation', 'How many provisional patent applications has LB filed?', '2', '5', '8', '12', 'c', 1),
('general', 'innovation', 'What is a STAMP?', 'A postage label', 'A verified completion marker that proves work was done and value delivered', 'A tax document', 'A membership badge', 'b', 2),
('general', 'innovation', 'What is the Boaz Principle?', 'A leadership style', 'Fractional ownership cascade — biblical gleaning concept applied to cooperative economics', 'A farming technique', 'A negotiation strategy', 'b', 3),
('general', 'innovation', 'What does SAA stand for in the context of governance?', 'Standard Administrative Agreement', 'Service Allocation Authority — earned by backing successful projects', 'Social Activity Award', 'Shareholder Approval Act', 'b', 2),
('general', 'innovation', 'What is the WaterWheel?', 'A hydroelectric generator', 'A self-reinforcing economic cycle where surplus from one system funds the next', 'A water conservation program', 'A spinning wheel ride', 'b', 2),
('general', 'innovation', 'What is the Housing WaterWheel specifically?', 'A plumbing system', 'Surplus AirBnB revenue flows into Housing Fund to acquire the next property', 'A water heater', 'A housing loan program', 'b', 3),
('general', 'innovation', 'What are Backed Marks?', 'Government-backed currency', 'Joule-collateral backed marks for project sponsorship ONLY', 'Dollar-backed tokens', 'Cryptocurrency', 'b', 2),
('general', 'innovation', 'What is the "No Atomo" principle?', 'Anti-nuclear policy', '"No Atomo. Superman!" — AI collaboration creates value greater than individual contributions', 'A chemistry rule', 'An anti-splitting policy', 'b', 3),
('general', 'innovation', 'What is Maker Spotlight and what are its tiers?', 'A flashlight product with Basic/Pro/Premium tiers', 'A showcase for creators with Established/Rising/Pioneer tiers', 'A factory tour with Gold/Silver/Bronze levels', 'A photography feature with Beginner/Intermediate/Advanced', 'b', 2);
