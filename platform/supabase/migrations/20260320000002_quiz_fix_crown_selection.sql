-- ============================================================================
-- Session 53: Fix Crown Quiz Selection
-- Replace Taylor Swift + Muhammad Yunus with Alex Oshmyansky + Ruth Glenn
-- per Bishop's BA spec (correct 8 Crown ambassadors)
-- ============================================================================

-- Delete Taylor Swift questions first (FK cascade would handle this, but explicit is safer)
DELETE FROM paper_quiz_questions
WHERE quiz_id = (SELECT id FROM paper_quizzes WHERE paper_id = 'crown-taylor-swift');

DELETE FROM paper_quizzes WHERE paper_id = 'crown-taylor-swift';

-- Delete Muhammad Yunus questions
DELETE FROM paper_quiz_questions
WHERE quiz_id = (SELECT id FROM paper_quizzes WHERE paper_id = 'crown-muhammad-yunus');

DELETE FROM paper_quizzes WHERE paper_id = 'crown-muhammad-yunus';

-- ═══════════════════════════════════════════════════════════════════════════
-- QUIZ: Alex Oshmyansky — Lifeline Medications
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO paper_quizzes (paper_id, paper_title, paper_url)
VALUES (
  'crown-alex-oshmyansky',
  'Crown Letter: Alex Oshmyansky — Lifeline Medications',
  'https://cephas.lianabanyan.com/letters/crown-initiative/alex-oshmyansky/'
) ON CONFLICT (paper_id) DO NOTHING;

INSERT INTO paper_quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty, explanation, sort_order)
SELECT pq.id,
  q.question_text, q.option_a, q.option_b, q.option_c, q.option_d,
  q.correct_option, q.difficulty, q.explanation, q.sort_order
FROM paper_quizzes pq,
(VALUES
  ('What motivated Alex Oshmyansky to build Cost Plus Drugs?',
   'He wanted to become a billionaire in pharma',
   'Two patients died because they couldn''t navigate red tape for heart medication',
   'He was frustrated with hospital billing practices',
   'His medical school professor challenged him to fix pricing',
   'b', 1,
   'The letter opens: "Two patients died that weekend because they couldn''t navigate the red tape to get $10,000-per-month heart medication. You saw it happen. You couldn''t unsee it."',
   1),
  ('What Crown title is offered to Alex Oshmyansky?',
   'Pharmacy Director, Lord Banyan of Medicine',
   'Health Chancellor, Lord Banyan of Prescriptions',
   'Apothecary Mentor, Lord Banyan of Lifeline Medications',
   'Chief Pharmacist of the Cooperative',
   'c', 1,
   'The letter states: "I want you to be the Apothecary Mentor — the Crown of Lifeline Medications" with the title "Apothecary Mentor, Lord Banyan of Lifeline Medications."',
   2),
  ('How did Alex Oshmyansky get funding for Cost Plus Drugs?',
   'He applied for a government grant',
   'He launched a Kickstarter campaign',
   'He cold-emailed Mark Cuban with a "cold pitch" subject line',
   'He took out personal loans from his bank',
   'c', 2,
   'The letter recounts: "You cold-emailed Mark Cuban with a ''cold pitch'' subject line. He funded the whole thing."',
   3),
  ('What does the letter say Cost Plus Drugs and Liana Banyan share?',
   'The same investors and board members',
   'The transparent pricing philosophy — Cost Plus Drugs uses Cost + 15%, Liana Banyan uses Cost + 20%',
   'The same pharmaceutical suppliers',
   'The same nonprofit tax structure',
   'b', 2,
   'The letter states: "You''ve proven Cost + 15% works for drugs. I''ve designed Cost + 20% to work for everything."',
   4),
  ('What academic credentials does Alex Oshmyansky hold according to the letter?',
   'MIT, Stanford, and Yale',
   'Hopkins, Harvard, Oxford, and Duke',
   'Princeton, Cambridge, and Columbia',
   'Berkeley, Johns Hopkins, and Mayo Clinic',
   'b', 2,
   'The letter references: "You had the credentials — Hopkins, Harvard, Oxford, Duke."',
   5),
  ('What did Oshmyansky build after pivoting from his nonprofit?',
   'A mobile pharmacy app',
   'A 22,000 square-foot manufacturing facility producing epinephrine and norepinephrine',
   'A chain of discount pharmacies',
   'A prescription price comparison website',
   'b', 2,
   'The letter states: "You built a 22,000 square-foot manufacturing facility. You''re producing epinephrine and norepinephrine to address shortages."',
   6),
  ('What Crown medallion serial is offered to Oshmyansky?',
   'CROWN-DRUGS-001',
   'CROWN-PHARMA-001',
   'CROWN-MEDS-001',
   'CROWN-HEALTH-001',
   'c', 3,
   'The benefits table lists: "Medallion — CROWN-MEDS-001 — first and only."',
   7),
  ('What quote about transparency does the letter attribute to Oshmyansky?',
   '"Pricing should be public for every drug in America"',
   '"Transparency is not a panacea solution to everything, but it''s certainly a prerequisite before we can get anywhere"',
   '"The cure for high prices is transparency"',
   '"Cost plus is the only honest pricing model"',
   'b', 3,
   'The letter quotes Oshmyansky: "Transparency is not a panacea solution to everything, but it''s certainly a prerequisite before we can get anywhere."',
   8)
) AS q(question_text, option_a, option_b, option_c, option_d, correct_option, difficulty, explanation, sort_order)
WHERE pq.paper_id = 'crown-alex-oshmyansky';

-- ═══════════════════════════════════════════════════════════════════════════
-- QUIZ: Ruth M. Glenn — Defense Klaus
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO paper_quizzes (paper_id, paper_title, paper_url)
VALUES (
  'crown-ruth-glenn',
  'Crown Letter: Ruth M. Glenn — Defense Klaus',
  'https://cephas.lianabanyan.com/letters/crown-initiative/ruth-glenn/'
) ON CONFLICT (paper_id) DO NOTHING;

INSERT INTO paper_quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty, explanation, sort_order)
SELECT pq.id,
  q.question_text, q.option_a, q.option_b, q.option_c, q.option_d,
  q.correct_option, q.difficulty, q.explanation, q.sort_order
FROM paper_quizzes pq,
(VALUES
  ('What organization does Ruth M. Glenn run?',
   'The National Center for Missing & Exploited Children',
   'The National Domestic Violence Hotline',
   'The National Sexual Assault Hotline',
   'The Polaris Project',
   'b', 1,
   'The letter states: "You run the National Domestic Violence Hotline — the voice on the other end when someone is hiding in a closet, whispering into their phone, terrified."',
   1),
  ('What initiative is Ruth Glenn being asked to lead?',
   'Rally Group — crisis response',
   'Harper Guild — HR and ethics',
   'Defense Klaus — protection for domestic abuse survivors',
   'The Family Table — intergenerational connection',
   'c', 1,
   'The letter states: "One of those fourteen initiatives is called Defense Klaus. And I need someone who actually knows what they''re doing to lead it. That''s you."',
   2),
  ('How is Defense Klaus''s leadership structure different from other initiatives?',
   'It has no leader — it''s fully automated',
   'Instead of a Crown, it has a Shield Table with a Knight for every country',
   'It reports directly to the Board with no council',
   'It uses a rotating leadership model',
   'b', 2,
   'The letter states: "Most of our initiatives have a Crown — one leader who guides one domain. Defense Klaus is different. Instead of a Crown, Defense Klaus has a Shield Table — a council of Knights, one for every country, protecting their own."',
   3),
  ('What physical product does Defense Klaus start with?',
   'A smart home security system',
   'A personal alarm keychain',
   'A wearable wrist bangle that converts for self-defense and evidence collection, costing less than $6',
   'A GPS tracking device disguised as jewelry',
   'c', 2,
   'The letter describes: "a physical, personal, wearable wrist bangle that converts for self-defense and evidence collection — costs less than $6."',
   4),
  ('Who does the letter identify as Ruth Glenn''s partner at the Shield Table?',
   'Kimberly A. Williams from the Rally Group',
   'Robert Kaiser, a UK criminology researcher who studies violence prediction',
   'Jessica Jackley from Kiva',
   'The founder himself',
   'b', 2,
   'The letter describes Robert Kaiser: "a PhD researcher in criminology who''s spent three decades studying violence against women" with expertise in "Escalation Pattern Analysis — the ability to predict when intimate partner violence will turn lethal."',
   5),
  ('What title is offered to Ruth Glenn?',
   'Shield Director, Lady Banyan of Safety',
   'First Shield Mentor, Lady Banyan of Protection, Guardian of the Shield Table',
   'Defense Minister, Lady Banyan of the Bangle',
   'Crisis Commander, Lady Banyan of the Hotline',
   'b', 2,
   'The title listed is: "First Shield Mentor Ruth M. Glenn, Lady Banyan of Protection, Guardian of the Shield Table."',
   6),
  ('What unique power does the First Seat of the Shield Table receive that other Crowns do not?',
   'Unlimited budget authority',
   'The ability to hire and fire any platform employee',
   'Veto power — final say on Defense Klaus direction for the first two years',
   'Direct access to law enforcement databases',
   'c', 3,
   'The benefits table includes "Veto Power — Final say on Defense Klaus direction for the first two years" — a benefit unique to this initiative.',
   7),
  ('What does the letter say Ruth Glenn''s memoir reveals that statistics cannot?',
   'How to build advocacy organizations',
   'What it actually feels like, what it takes to survive, and what comes after',
   'The economic cost of domestic violence to society',
   'How government programs fail abuse survivors',
   'b', 3,
   'The letter states: "Your memoir tells the story that statistics can''t — what it actually feels like, and what it takes to survive, and what comes after."',
   8)
) AS q(question_text, option_a, option_b, option_c, option_d, correct_option, difficulty, explanation, sort_order)
WHERE pq.paper_id = 'crown-ruth-glenn';
