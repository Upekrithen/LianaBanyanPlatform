-- ============================================================================
-- Session 52: Golden Key Quiz Seeding — 8 Crown Letters × 8 Questions
-- ============================================================================
-- Adds comprehension quizzes for 8 Crown Initiative letters.
-- Each quiz has 8 questions (2 easy, 2 medium, 1 hard selection per attempt).
-- Also back-fills paper_id on Scott/Buffett quizzes so they appear in
-- getQuizByPaperId() frontend lookup.
-- ============================================================================

-- ═══════════════════════════════════════════════════════════════════════════
-- FIX: Back-fill paper_id on existing Scott/Buffett quizzes
-- ═══════════════════════════════════════════════════════════════════════════

UPDATE paper_quizzes
SET paper_id = 'letters-mackenzie-scott-md',
    paper_title = COALESCE(paper_title, title),
    paper_url = 'https://cephas.lianabanyan.com/letters/open-letters/mackenzie-scott/'
WHERE id = '11111111-1111-1111-1111-111111111111'
  AND (paper_id IS NULL OR paper_id = '');

UPDATE paper_quizzes
SET paper_id = 'letters-warren-buffett-md',
    paper_title = COALESCE(paper_title, title),
    paper_url = 'https://cephas.lianabanyan.com/letters/open-letters/warren-buffett/'
WHERE id = '22222222-2222-2222-2222-222222222222'
  AND (paper_id IS NULL OR paper_id = '');

-- ═══════════════════════════════════════════════════════════════════════════
-- QUIZ 1: Maneet Chauhan — Let's Make Dinner
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO paper_quizzes (paper_id, paper_title, paper_url)
VALUES (
  'crown-maneet-chauhan',
  'Crown Letter: Maneet Chauhan — Let''s Make Dinner',
  'https://cephas.lianabanyan.com/letters/crown-initiative/maneet-chauhan/'
) ON CONFLICT (paper_id) DO NOTHING;

INSERT INTO paper_quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty, explanation, sort_order)
SELECT pq.id,
  q.question_text, q.option_a, q.option_b, q.option_c, q.option_d,
  q.correct_option, q.difficulty, q.explanation, q.sort_order
FROM paper_quizzes pq,
(VALUES
  ('What is the Crown title offered to Maneet Chauhan?',
   'First Chef of the Kitchen Guild',
   'Grand Chef Mentor, Lady Banyan of the Table',
   'Head Cook of Let''s Make Dinner',
   'Culinary Director of Liana Banyan',
   'b', 1,
   'The letter specifically offers the title "Grand Chef Mentor Maneet Chauhan, Lady Banyan of the Table" with additional titles Spice Queen and Empress of Cuisine.',
   1),
  ('What is the annual membership cost for a home cook to join Let''s Make Dinner?',
   '$50/year',
   '$25/year',
   '$5/year',
   'Free',
   'c', 1,
   'LMD uses the platform-wide $5/year membership fee — low barrier to entry is a core Liana Banyan principle.',
   2),
  ('How much does a Standard meal cost per serving in Let''s Make Dinner?',
   '$3 per serving',
   '$5 per serving',
   '$10 per serving',
   'Market price per serving',
   'b', 2,
   'The pricing table lists Standard at $5/serving, Convenience at $10+20%, and Charitable at $0 (funded by the other tiers).',
   3),
  ('What is The Larder in the context of Let''s Make Dinner?',
   'A physical pantry at each local chapter',
   'A recipe repository with tested dishes from every culture, costing sheets, and technique videos',
   'A food delivery truck fleet',
   'A meal planning mobile app',
   'b', 2,
   'The Larder — Recipes from our Heritage contains tested recipes from every culture/region/time period plus costing sheets, technique videos, equipment guides, dietary adaptations, cultural notes, and scaling guides.',
   4),
  ('Who does the letter identify as a natural partner for Maneet Chauhan?',
   'Taylor Swift',
   'Muhammad Yunus',
   'José Andrés for Let''s Get Groceries',
   'Warren Buffett',
   'c', 2,
   'The letter states: "I''ve also written to José Andrés for Let''s Get Groceries. You and José would be natural partners — you''re building the meal preparation side, he''d be building the grocery sourcing side."',
   5),
  ('What does the Charitable meal tier cost per serving?',
   '$1 per serving',
   '$2.50 per serving',
   'Half the Standard price',
   '$0 — funded by Standard/Convenience orders plus Liana Banyan Corporation',
   'd', 2,
   'The Charitable tier costs $0 per serving and is funded by revenue from Standard and Convenience orders plus Liana Banyan Corporation — sustainable charity by design.',
   6),
  ('What guild operates under Let''s Make Dinner?',
   'The Cooking Guild',
   'The Hearth Guild',
   'The Table Guild',
   'The Kitchen Guild',
   'b', 3,
   'The Hearth Guild operates under LMD with roles from Grand Chef (Crown) down through Hearth Master, Head Cook, Line Cook, Prep Cook, and Kitchen Helper.',
   7),
  ('How did the founder discover Maneet Chauhan?',
   'Through a mutual friend in the food industry',
   'From the latest season of Master of Cue, then researching from there',
   'At a restaurant in Nashville',
   'Through a Liana Banyan member recommendation',
   'b', 3,
   'The letter opens with: "My wife and I discovered you from the latest season of Master of Cue, and rabbit-holed from there."',
   8)
) AS q(question_text, option_a, option_b, option_c, option_d, correct_option, difficulty, explanation, sort_order)
WHERE pq.paper_id = 'crown-maneet-chauhan';

-- ═══════════════════════════════════════════════════════════════════════════
-- QUIZ 2: Mary Beth Laughton — Let's Go Shopping
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO paper_quizzes (paper_id, paper_title, paper_url)
VALUES (
  'crown-mary-beth-laughton',
  'Crown Letter: Mary Beth Laughton — Let''s Go Shopping',
  'https://cephas.lianabanyan.com/letters/crown-initiative/mary-beth-laughton/'
) ON CONFLICT (paper_id) DO NOTHING;

INSERT INTO paper_quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty, explanation, sort_order)
SELECT pq.id,
  q.question_text, q.option_a, q.option_b, q.option_c, q.option_d,
  q.correct_option, q.difficulty, q.explanation, q.sort_order
FROM paper_quizzes pq,
(VALUES
  ('What organization does Mary Beth Laughton lead according to the letter?',
   'Sephora',
   'Ulta',
   'REI',
   'Walmart Cooperative',
   'c', 1,
   'The letter opens: "You lead America''s largest consumer cooperative" — referring to REI, which has 25 million members.',
   1),
  ('What is the Crown title offered to Mary Beth Laughton?',
   'Shopping Director, Lady Banyan of Commerce',
   'Retail Chancellor, Lady Banyan of the Store',
   'Merchant Mentor, Lady Banyan of the Marketplace',
   'Chief Merchant of Cooperative Retail',
   'c', 1,
   'The permanent title is "Merchant Mentor Mary Beth Laughton, Lady Banyan of the Marketplace" with the subtitle "First Steward of Let''s Go Shopping."',
   2),
  ('What rule does Liana Banyan operate under regarding politics and religion?',
   'The Neutrality Act',
   'The Switzerland Rule',
   'The Fair Play Doctrine',
   'The Apolitical Standard',
   'b', 2,
   'The letter states: "We operate under what we call the Switzerland Rule: no politics, no religion. We incorporate principles that work — practical, not ideological."',
   3),
  ('How many members does REI have according to the letter?',
   '10 million',
   '15 million',
   '25 million',
   '50 million',
   'c', 2,
   'Referenced multiple times: "REI has 25 million members who believe that outdoor recreation should be accessible, sustainable, and member-owned."',
   4),
  ('What quality of Mary Beth Laughton''s leadership most impressed the founder?',
   'Her ability to grow revenue',
   'Her course correction when members pushed back on political endorsements',
   'Her expansion of REI''s product lines',
   'Her background in luxury retail',
   'b', 2,
   'The letter says: "When members pushed back on political endorsements, you listened. You course-corrected. You said: ''If we don''t get the culture right, the rest doesn''t matter.''"',
   5),
  ('How many documents are enclosed with Mary Beth Laughton''s letter?',
   'Two',
   'Three',
   'Four',
   'Five',
   'c', 2,
   'Four enclosures: The Considered Approach, Let''s Go Shopping Overview, The 300 Framework, and The Connected Keep.',
   6),
  ('What is the core design goal of Let''s Go Shopping?',
   'To replace Amazon with a cooperative marketplace',
   'To connect consumers with ethical producers and eliminate retail extraction',
   'To sell outdoor gear at cost',
   'To franchise REI stores globally',
   'b', 3,
   'The letter lists four goals: connect consumers with ethical producers, eliminate extraction, build community-benefiting supply chains, and create a member-owned marketplace.',
   7),
  ('What year was REI founded as a member-owned cooperative according to the letter?',
   '1920',
   '1938',
   '1945',
   '1952',
   'b', 3,
   'The letter states: "25 million members. $3+ billion in revenue. Member-owned since 1938."',
   8)
) AS q(question_text, option_a, option_b, option_c, option_d, correct_option, difficulty, explanation, sort_order)
WHERE pq.paper_id = 'crown-mary-beth-laughton';

-- ═══════════════════════════════════════════════════════════════════════════
-- QUIZ 3: Kimberly A. Williams — Rally Group
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO paper_quizzes (paper_id, paper_title, paper_url)
VALUES (
  'crown-kimberly-williams',
  'Crown Letter: Kimberly A. Williams — Rally Group',
  'https://cephas.lianabanyan.com/letters/crown-initiative/kimberly-williams/'
) ON CONFLICT (paper_id) DO NOTHING;

INSERT INTO paper_quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty, explanation, sort_order)
SELECT pq.id,
  q.question_text, q.option_a, q.option_b, q.option_c, q.option_d,
  q.correct_option, q.difficulty, q.explanation, q.sort_order
FROM paper_quizzes pq,
(VALUES
  ('What national system does Kimberly A. Williams run?',
   'The National Domestic Violence Hotline',
   'The 988 Suicide & Crisis Lifeline',
   'FEMA Emergency Response',
   'The National Poison Control Center',
   'b', 1,
   'The letter opens: "You run the largest crisis response system in America. The 988 Suicide & Crisis Lifeline — 5 million calls, texts, and chats in its first year."',
   1),
  ('What is the Crown title offered to Kimberly A. Williams?',
   'Crisis Director, Lady Banyan of Safety',
   'Responder General, Lady Banyan of the Lifeline',
   'Safety Chief, Lady Banyan of the Signal',
   'First Conductor of the Rally Line',
   'b', 1,
   'The permanent title is "Responder General Kimberly A. Williams, Lady Banyan of the Lifeline."',
   2),
  ('What is the Rally Group''s core philosophy?',
   '"Be prepared for anything"',
   '"We''d rather check on you 100 times for nothing than miss the one time you need us"',
   '"Safety first, always"',
   '"Every life is worth saving"',
   'b', 2,
   'This philosophy is quoted directly in the letter and repeated at the end as the signature line.',
   3),
  ('What is the "Oops" Code System?',
   'An error reporting system for software bugs',
   'Automatic false positives to keep responders trained and normalize the system',
   'A system for reporting accidental 911 calls',
   'A code name for internal communication',
   'b', 2,
   'The letter describes the Oops system as generating "automatic false positives to keep responders trained and normalize the system — built-in pizza codes, etc."',
   4),
  ('How many calls, texts, and chats did the 988 Lifeline handle in its first year?',
   '1 million',
   '3 million',
   '5 million',
   '10 million',
   'c', 2,
   'The letter states: "5 million calls, texts, and chats in its first year. Over 200 crisis centers nationwide."',
   5),
  ('Who is identified as Kimberly Williams'' natural partner in the platform?',
   'Maneet Chauhan for Let''s Make Dinner',
   'Ruth M. Glenn for Defense Klaus',
   'Cathie Mahon for VSL',
   'Taylor Swift for JukeBox',
   'b', 2,
   'The letter states: "I''ve also written to Ruth M. Glenn for Defense Klaus. You and Ruth would be natural partners — she''s building the personal safety initiative for domestic abuse survivors."',
   6),
  ('What railroad imagery does the Rally Group use?',
   'The Transcontinental Railroad — connecting communities coast to coast',
   'Underground Railroad for discreet safety, Railroad Crossing Signal for visibility, Conductors guide to safety',
   'The Freedom Train — moving people to safe locations',
   'The Express Line — rapid crisis response',
   'b', 3,
   'The Rally Group uses three railroad metaphors: Underground Railroad (discreet safety network), Railroad Crossing Signal (universal help-available icon on every page), and Conductors (who guide people to safety).',
   7),
  ('What role do Harpers play in the Rally Group ecosystem?',
   'They are financial auditors for each guild',
   'HR/ethics people in every guild, trained in crisis recognition, who answer to the Crown — not the business',
   'They manage the technology infrastructure',
   'They serve as legal advisors',
   'b', 3,
   'The letter states: "Every Guild has a Harper (our HR/ethics person). Every Harper is trained in crisis recognition." And critically: "Harpers answer to the Crown, not Liana Banyan, and not the business."',
   8)
) AS q(question_text, option_a, option_b, option_c, option_d, correct_option, difficulty, explanation, sort_order)
WHERE pq.paper_id = 'crown-kimberly-williams';

-- ═══════════════════════════════════════════════════════════════════════════
-- QUIZ 4: Cathie Mahon — MSA (Member Service Account)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO paper_quizzes (paper_id, paper_title, paper_url)
VALUES (
  'crown-cathie-mahon',
  'Crown Letter: Cathie Mahon — MSA',
  'https://cephas.lianabanyan.com/letters/crown-initiative/cathie-mahon/'
) ON CONFLICT (paper_id) DO NOTHING;

INSERT INTO paper_quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty, explanation, sort_order)
SELECT pq.id,
  q.question_text, q.option_a, q.option_b, q.option_c, q.option_d,
  q.correct_option, q.difficulty, q.explanation, q.sort_order
FROM paper_quizzes pq,
(VALUES
  ('What organization does Cathie Mahon lead?',
   'The National Credit Union Association',
   'Inclusiv — the national federation of community development credit unions',
   'The Federal Reserve Bank of New York',
   'The World Savings and Loans Forum',
   'b', 1,
   'The letter states: "Inclusiv represents over 500 community development credit unions serving 20 million people in low-income and underserved communities."',
   1),
  ('What initiative is Cathie Mahon being asked to lead?',
   'VSL — Village Savings and Loans',
   'MSA — the Member Service Account',
   'The Financial Transparency Initiative',
   'The Cooperative Banking Initiative',
   'b', 1,
   'The letter states: "I want you to lead the MSA Council" — MSA is the cooperative banking initiative.',
   2),
  ('What are the three currencies in the Three-Gear Currency System?',
   'Dollars, Euros, and Bitcoin',
   'Platform Credits, Platform Marks, and Platform Joules',
   'Cash, Credit, and Equity',
   'Trade Points, Reward Points, and Loyalty Points',
   'b', 2,
   'The Three-Gear Currency table lists: Platform Credits (immediate spending), Platform Marks (internal trade/cost-basis exchange), and Platform Joules (stored value/long-term ownership).',
   3),
  ('How many community development credit unions does Inclusiv represent?',
   '100+',
   '250+',
   '500+',
   '1,000+',
   'c', 2,
   'The letter states Inclusiv represents "over 500 community development credit unions."',
   4),
  ('How many people are served by the credit unions Inclusiv represents?',
   '5 million',
   '10 million',
   '20 million',
   '50 million',
   'c', 2,
   'The letter states Inclusiv''s credit unions serve "20 million people in low-income and underserved communities."',
   5),
  ('What is the MSA designed to do according to the letter?',
   'Replace traditional banking with cryptocurrency',
   'Provide financial services at cost and eliminate banking extraction',
   'Create a new stock exchange for cooperative businesses',
   'Provide free checking accounts to all Americans',
   'b', 2,
   'The letter lists MSA''s goals: provide financial services at cost, eliminate extraction, build member-governed financial infrastructure, and create accounts where members govern the rules.',
   6),
  ('What is the function of Platform Joules?',
   'Immediate spending for daily transactions',
   'Cost-basis exchange between members',
   'Long-term stored value representing ownership stake in the platform',
   'Converting cryptocurrency to cash',
   'c', 3,
   'In the Three-Gear table, Joules are described as "Stored value — Long-term ownership stake in the platform." Credits are for immediate spending, and Marks are for internal trade.',
   7),
  ('Why does the letter say credit unions exist?',
   'Because traditional banks are too slow for modern transactions',
   'Because traditional banks wouldn''t serve certain communities',
   'Because the government mandated cooperative financial institutions',
   'Because international trade required locally-owned banks',
   'b', 3,
   'The letter states: "Credit unions exist because traditional banks wouldn''t serve certain communities. They''re member-owned. They''re democratically governed. They put people over profit."',
   8)
) AS q(question_text, option_a, option_b, option_c, option_d, correct_option, difficulty, explanation, sort_order)
WHERE pq.paper_id = 'crown-cathie-mahon';

-- ═══════════════════════════════════════════════════════════════════════════
-- QUIZ 5: Dale Dougherty — Let's Make Bread
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO paper_quizzes (paper_id, paper_title, paper_url)
VALUES (
  'crown-dale-dougherty',
  'Crown Letter: Dale Dougherty — Let''s Make Bread',
  'https://cephas.lianabanyan.com/letters/crown-initiative/dale-dougherty/'
) ON CONFLICT (paper_id) DO NOTHING;

INSERT INTO paper_quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty, explanation, sort_order)
SELECT pq.id,
  q.question_text, q.option_a, q.option_b, q.option_c, q.option_d,
  q.correct_option, q.difficulty, q.explanation, q.sort_order
FROM paper_quizzes pq,
(VALUES
  ('What does the letter say Dale Dougherty coined?',
   'The term "DIY revolution"',
   'The word "makers"',
   'The phrase "open source hardware"',
   'The concept of "hacker spaces"',
   'b', 1,
   'The letter opens: "You coined the word ''makers.'' I''ve spent 47 years being one."',
   1),
  ('What is Let''s Make Bread?',
   'A cooperative bakery chain',
   'A business incubator for makers to turn ideas into sustainable enterprises',
   'A bread delivery service',
   'A cooking class platform',
   'b', 1,
   'The letter describes Let''s Make Bread as a business incubation initiative that helps makers turn ideas into prototypes, prototypes into products, products into businesses, and businesses into cooperatives.',
   2),
  ('What is HexIsle as described in the letter?',
   'A video game created by the founder',
   'A modular hydraulic gaming table system with 34 utility patents',
   'A hexagonal housing project',
   'A social media platform for makers',
   'b', 2,
   'The letter describes HexIsle as "a modular hydraulic gaming table system with 34 utility patents filed, designed to be manufactured at scale while remaining accessible to makers."',
   3),
  ('What does the founder call the decentralization of manufacturing?',
   'The Digital Revolution',
   'The Open Source Revolution',
   'The 2nd Second Industrial Revolution',
   'The Maker Renaissance',
   'c', 2,
   'The founder states: "I call it the 2nd Second Industrial Revolution. Not because I invented the concept — but because I''m building the rails."',
   4),
  ('How many Fusion 360 diagrams has the founder created for HexIsle?',
   '500+',
   '800+',
   '1,200+',
   '2,000+',
   'c', 2,
   'A stat callout in the letter states: "1,200+ Fusion 360 Diagrams — For HexIsle alone."',
   5),
  ('What did Dale Dougherty create that the letter describes as a showcase?',
   'TechCrunch Disrupt',
   'Maker Faire',
   'CES Consumer Electronics Show',
   'SXSW Interactive',
   'b', 2,
   'The letter states: "You''ve already built Maker Faire — a showcase. Let''s Make Bread is the next step: an incubator that turns showcase projects into sustainable enterprises."',
   6),
  ('What school project does the founder describe from sixth grade?',
   'A model rocket that won the science fair',
   'Floating modular cities that made the local newspaper',
   'A robotic arm controlled by computer',
   'A working miniature steam engine',
   'b', 3,
   'The letter recounts: "In sixth grade, I designed floating modular cities for a school project. The local newspaper ran a headline: ''Wave of the Future.''"',
   7),
  ('How many countries have hosted Maker Faire events according to the letter?',
   '20',
   '30',
   '40',
   '50',
   'c', 3,
   'The letter references: "200 events in 40 countries. 1.5 million attendees."',
   8)
) AS q(question_text, option_a, option_b, option_c, option_d, correct_option, difficulty, explanation, sort_order)
WHERE pq.paper_id = 'crown-dale-dougherty';

-- ═══════════════════════════════════════════════════════════════════════════
-- QUIZ 6: José Andrés — Let's Get Groceries
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO paper_quizzes (paper_id, paper_title, paper_url)
VALUES (
  'crown-jose-andres',
  'Crown Letter: José Andrés — Let''s Get Groceries',
  'https://cephas.lianabanyan.com/letters/crown-initiative/jose-andres/'
) ON CONFLICT (paper_id) DO NOTHING;

INSERT INTO paper_quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty, explanation, sort_order)
SELECT pq.id,
  q.question_text, q.option_a, q.option_b, q.option_c, q.option_d,
  q.correct_option, q.difficulty, q.explanation, q.sort_order
FROM paper_quizzes pq,
(VALUES
  ('What is José Andrés famous for founding?',
   'The Food Network',
   'World Central Kitchen',
   'Feeding America',
   'The James Beard Foundation',
   'b', 1,
   'The letter references WCK throughout: "WCK has now served over 350 million meals across more than 30 countries."',
   1),
  ('What initiative is José Andrés being asked to lead?',
   'Let''s Make Dinner',
   'Let''s Make Bread',
   'Let''s Get Groceries',
   'The Family Table',
   'c', 1,
   'The letter states: "I want you to be the Provisioner Mentor — the Crown of Let''s Get Groceries."',
   2),
  ('How many meals did WCK serve after Hurricane Maria in Puerto Rico?',
   '1 million',
   '2.5 million',
   '3.7 million',
   '5 million',
   'c', 2,
   'The letter opens: "When Puerto Rico lost power after Hurricane Maria, you and your team served 3.7 million meals."',
   3),
  ('What philosophy does the letter say Let''s Get Groceries shares with José Andrés?',
   'Technology will solve hunger',
   'Food is infrastructure, not charity',
   'Government programs are the answer to food insecurity',
   'International trade is the key to food access',
   'b', 2,
   'The shared philosophy begins with: "Food is infrastructure, not charity — Local kitchens can do what centralized systems can''t."',
   4),
  ('How many total meals has WCK served across how many countries?',
   '100 million in 15 countries',
   '250 million in 25 countries',
   'Over 350 million in 30+ countries',
   '500 million in 50 countries',
   'c', 2,
   'The letter states: "WCK has now served over 350 million meals across more than 30 countries."',
   5),
  ('What does the letter identify as everyday hunger that doesn''t make headlines?',
   'People in developing countries without food aid',
   'The family that runs out of food three days before payday',
   'Soldiers in combat zones without supply lines',
   'Children in school without lunch programs',
   'b', 2,
   'The letter describes: "The family that runs out of food three days before payday. The elderly person who can''t get to a grocery store. The neighborhood where the only options are dollar stores and fast food."',
   6),
  ('What Crown medallion serial number is offered to José Andrés?',
   'CROWN-FOOD-001',
   'CROWN-LGG-001',
   'CROWN-GROCERIES-001',
   'CROWN-WCK-001',
   'c', 3,
   'The benefits table lists: "Medallion — CROWN-GROCERIES-001 — first and only."',
   7),
  ('What insight from WCK does the letter say Let''s Get Groceries applies to everyday hunger?',
   'Government grants can scale food programs',
   'Restaurants already have kitchens, cooks, and distribution networks that can mobilize faster than any government agency',
   'Volunteers can replace professional food service workers',
   'Social media campaigns are the best way to raise awareness',
   'b', 3,
   'The letter states: "You built World Central Kitchen on a simple insight: restaurants already have kitchens, cooks, and distribution networks. In a crisis, they can mobilize faster than any government agency."',
   8)
) AS q(question_text, option_a, option_b, option_c, option_d, correct_option, difficulty, explanation, sort_order)
WHERE pq.paper_id = 'crown-jose-andres';

-- ═══════════════════════════════════════════════════════════════════════════
-- QUIZ 7: Taylor Swift — JukeBox
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO paper_quizzes (paper_id, paper_title, paper_url)
VALUES (
  'crown-taylor-swift',
  'Crown Letter: Taylor Swift — JukeBox',
  'https://cephas.lianabanyan.com/letters/crown-initiative/taylor-swift/'
) ON CONFLICT (paper_id) DO NOTHING;

INSERT INTO paper_quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty, explanation, sort_order)
SELECT pq.id,
  q.question_text, q.option_a, q.option_b, q.option_c, q.option_d,
  q.correct_option, q.difficulty, q.explanation, q.sort_order
FROM paper_quizzes pq,
(VALUES
  ('What initiative is Taylor Swift being asked to lead?',
   'The Sound Guild',
   'JukeBox — cooperative music licensing',
   'Let''s Make Music',
   'The Harmonic Initiative',
   'b', 1,
   'The letter opens: "A founding leadership position in JukeBox, one of fourteen initiatives within Liana Banyan."',
   1),
  ('What is the Crown title offered to Taylor Swift?',
   'Music Director, Lady Banyan of the Song',
   'Maestro Mentor, Lady Banyan of the Stage',
   'First Voice of Sound, Lady Banyan of Harmony',
   'Grand Conductor of the JukeBox',
   'b', 1,
   'The permanent title is "Maestro Mentor Taylor Swift, Lady Banyan of the Stage" with the additional title "First Voice of the JukeBox."',
   2),
  ('Why does the letter reference Taylor Swift re-recording her catalog?',
   'To criticize the music industry''s pricing',
   'Because someone else owned her work, demonstrating the ownership problem JukeBox solves',
   'To promote her new albums',
   'To suggest she donate recordings to the platform',
   'b', 2,
   'The letter states: "You''re re-recording your entire catalog because someone else owned your work." This illustrates why JukeBox''s principle of "Ownership stays with creators" matters.',
   3),
  ('What artist''s song was licensed as JukeBox''s proof of concept?',
   'Taylor Swift''s "Shake It Off"',
   'Bruck''lyn''s "Moonshot"',
   'Ed Sheeran''s "Shape of You"',
   'Beyoncé''s "Lemonade"',
   'b', 2,
   'The letter states: "We licensed Bruck''lyn''s ''Moonshot'' for our launch materials. They kept 83%+ of the transaction."',
   4),
  ('What percentage of each transaction do creators keep through JukeBox?',
   '60%+',
   '70%+',
   '80%+',
   '90%+',
   'c', 2,
   'The letter states: "creators keep 80%+ of every transaction. No label skimming. No distributor cuts. No administrative fees." (The exact figure is 83.3%.)',
   5),
  ('What guild operates under JukeBox?',
   'The Music Guild',
   'The Sound Guild',
   'The Rhythm Guild',
   'The Harmony Guild',
   'b', 2,
   'The letter lists "The Sound Guild operates under JukeBox" with roles from Maestro down through Sound Master, First Chair, Session Player, Studio Apprentice, and Roadie.',
   6),
  ('What song does the founder specifically ask to license for the launch video?',
   '"Shake It Off (Taylor''s Version)"',
   '"Anti-Hero"',
   '"Out of the Woods (Taylor''s Version)"',
   '"Blank Space (Taylor''s Version)"',
   'c', 3,
   'The letter says: "I''d still like to license ''Out of the Woods (Taylor''s Version)'' for our launch video. Through the system, at whatever rate you set, with terms you control."',
   7),
  ('What makes JukeBox fundamentally different from traditional music licensing?',
   'It uses AI to generate music',
   'Every license is blockchain-verified, ownership never transfers, and artists set their own rates',
   'It only licenses indie music',
   'It offers subscription-based unlimited licensing',
   'b', 3,
   'The letter lists four pillars: transparent pricing (artists set rates), automatic splits, ownership never transfers, and blockchain verification of every license/payment/use.',
   8)
) AS q(question_text, option_a, option_b, option_c, option_d, correct_option, difficulty, explanation, sort_order)
WHERE pq.paper_id = 'crown-taylor-swift';

-- ═══════════════════════════════════════════════════════════════════════════
-- QUIZ 8: Muhammad Yunus — International Initiative
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO paper_quizzes (paper_id, paper_title, paper_url)
VALUES (
  'crown-muhammad-yunus',
  'Crown Letter: Muhammad Yunus — International Initiative',
  'https://cephas.lianabanyan.com/letters/crown-initiative/muhammad-yunus/'
) ON CONFLICT (paper_id) DO NOTHING;

INSERT INTO paper_quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty, explanation, sort_order)
SELECT pq.id,
  q.question_text, q.option_a, q.option_b, q.option_c, q.option_d,
  q.correct_option, q.difficulty, q.explanation, q.sort_order
FROM paper_quizzes pq,
(VALUES
  ('What did Muhammad Yunus prove according to the opening of the letter?',
   'That technology can solve poverty',
   'That the poor are creditworthy',
   'That globalization benefits everyone equally',
   'That international trade reduces inequality',
   'b', 1,
   'The letter opens: "You proved that the poor are creditworthy. You proved that lending to women changes communities. You proved that social business can solve problems that charity cannot."',
   1),
  ('What initiative is Muhammad Yunus being asked to lead?',
   'VSL — Village Savings and Loans',
   'The Global Commerce Initiative',
   'The International Initiative',
   'The Microfinance Initiative',
   'c', 1,
   'The letter states: "I want you to lead the International Initiative Council."',
   2),
  ('What did Yunus found that the letter discusses extensively?',
   'The World Bank',
   'Grameen Bank',
   'The International Monetary Fund',
   'Kiva',
   'b', 2,
   'The letter states: "I first learned about Grameen Bank in college" and discusses how Grameen''s principles shaped Liana Banyan''s design.',
   3),
  ('What event involving 40,000 people does the letter reference?',
   'A refugee crisis in Southeast Asia',
   'Canada cancelling 40,000 startup visas, stranding entrepreneurs',
   'An earthquake affecting 40,000 people',
   'A mass layoff affecting 40,000 tech workers',
   'b', 2,
   'The letter describes: "In late 2024, Canada canceled 40,000 startup visas — stranding entrepreneurs from around the world who had built businesses expecting Canadian residency."',
   4),
  ('What does the letter say Grameen Bank proved about lending to women?',
   'Women are more risk-averse than men',
   'Lending to women changes communities',
   'Women default less than corporations',
   'Microloans work better for individual women than groups',
   'b', 2,
   'The letter opens with: "You proved that lending to women changes communities."',
   5),
  ('What Crown title is offered to Muhammad Yunus?',
   'Finance Minister, Lord Banyan of Commerce',
   'Global Director, Lord Banyan of Trade',
   'Commerce Secretary, Lord Banyan of the World',
   'International Chancellor, Lord Banyan of Peace',
   'c', 2,
   'The permanent title is "Commerce Secretary Muhammad Yunus, Lord Banyan of the World."',
   6),
  ('What distinction does the letter draw between charity, traditional business, and social business?',
   'Social business gives products away for free',
   'Charity gives resources away; traditional business maximizes shareholder profit; social business uses commerce to solve problems and reinvests profits',
   'Social business is a nonprofit that sells products',
   'There is no meaningful difference between the three',
   'b', 3,
   'The letter explicitly lists all three: "Charity: Gives away resources; requires continuous fundraising. Traditional business: Maximizes profit for shareholders. Social business: Uses commerce to solve problems; reinvests profits in the mission."',
   7),
  ('What does the letter say Grameen Bank proved about repayment rates?',
   'Poor communities repay loans faster than rich ones',
   'Poor women repay loans at higher rates than rich men',
   'Microloans have the highest repayment rates of any loan category',
   'Community pressure ensures 100% repayment',
   'b', 3,
   'The letter states: "It proved that poor women repay loans at higher rates than rich men. It proved that small amounts of capital, deployed at the right moment, can transform lives."',
   8)
) AS q(question_text, option_a, option_b, option_c, option_d, correct_option, difficulty, explanation, sort_order)
WHERE pq.paper_id = 'crown-muhammad-yunus';
