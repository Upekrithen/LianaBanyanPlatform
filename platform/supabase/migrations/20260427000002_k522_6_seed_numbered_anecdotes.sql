-- K522.6 Phase A.5: Seed 10 numbered Hugo Founder anecdotes into anecdotes table
-- These were in Hugo anecdotes.md (Relic) but missing from Supabase (canonical).
-- Executed live via REST API 2026-04-27; this migration is the formal record.
-- Source: Cephas/cephas-hugo/content/founder/anecdotes.md (ANECDOTE 1-10)
-- Author UUID: [REDACTED — fetched at runtime via auth.users lookup]
-- Post-migration anecdotes count: 13 (ids 1-13)

INSERT INTO anecdotes (author_id, title, body_markdown, privacy_level, when_it_happened, where_it_happened)
SELECT u.id, 'The Paper Route',
  E'**Montana, Age 13**\n\n> "I learned what extraction feels like delivering newspapers in Montana when I was thirteen. Labor laws wouldn''t let me wash dishes until I was sixteen, but I could ''own my own business.'' So twice a week, after school until after dark, I walked five hours through freezing temperatures in jeans. Buy the paper for sixteen cents, sell it for twenty-five cents. The newspaper company set the terms. I had no leverage to negotiate."\n\n**Key Lesson:** Don''t exploit other people, even when you have been exploited.',
  'public', '1986-01-01', 'Montana'
FROM auth.users u WHERE u.email = 'upekrithen@gmail.com' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO anecdotes (author_id, title, body_markdown, privacy_level, when_it_happened, where_it_happened)
SELECT u.id, 'The Intramural Giants',
  E'**College**\n\n> "One of my favorite memories is from college when I represented my social club in intramural games... I, 5''6, feinted left — they both shifted left. I feinted right; again, they shifted to block me... I dropped my right shoulder and plowed INTO AND THROUGH THEM.\n>\n> But my TEAMMATE? In the time I kept the giants busy, he walked over and dropped 6 balls into the goal, 1 more than the other team.\n>\n> **And that''s how we win.**"\n\n**Key Lesson:** You don''t have to win. You have to create the opening for someone else to win.',
  'public', '1991-01-01', 'College — Intramural Gym'
FROM auth.users u WHERE u.email = 'upekrithen@gmail.com' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO anecdotes (author_id, title, body_markdown, privacy_level, when_it_happened, where_it_happened)
SELECT u.id, 'The Roommate Suit',
  E'**College**\n\n> "When I was in college, at one point I had two roommates at one time. One, we''ll call him R, was rich... The other we''ll call S, was poor like me.\n>\n> At one point, when I needed a suit and didn''t have the money to get one, **S gave me one of the two that he owned.** R offered one of his 15 after S gave me the one.\n>\n> That sacrifice has stuck with me for the last 30 years and still makes me cry."\n\n**Key Lesson:** A little generosity from someone with little means everything. This is why the $5 membership matters.',
  'public', '1992-01-01', 'College'
FROM auth.users u WHERE u.email = 'upekrithen@gmail.com' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO anecdotes (author_id, title, body_markdown, privacy_level, when_it_happened, where_it_happened)
SELECT u.id, 'Pizza for Ice Cream',
  E'**College**\n\n> "I was the assistant manager at a pizza place across the parking lot from a Dairy Queen. I knew the cost of our pizzas was about 10% of what we charged. So I called Dairy Queen and asked if they would be interested in pizza for dinner in exchange for ice cream for dessert."\n\n**Key Lesson:** When you trade at cost instead of retail, everyone wins massively. **This insight became the Localcy Currency Program, which became Cost+20%.**',
  'public', '1993-01-01', 'College — Pizza Place'
FROM auth.users u WHERE u.email = 'upekrithen@gmail.com' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO anecdotes (author_id, title, body_markdown, privacy_level, when_it_happened, where_it_happened)
SELECT u.id, 'The USAA Lifeline',
  E'**Throughout Adult Life**\n\n> "I have been in so many circumstances that I needed a mini-loan. And I thank God for USAA... they seriously saved my life.\n>\n> **A little generosity, just a tiny little bit, made ALL the difference in my life, and my wife and children''s lives.**"\n\n**Key Lesson:** This is WHY Village Savings & Loans exists. This is WHY the $50 microloans matter.',
  'public', NULL, 'Adult Life — Various Locations'
FROM auth.users u WHERE u.email = 'upekrithen@gmail.com' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO anecdotes (author_id, title, body_markdown, privacy_level, when_it_happened, where_it_happened)
SELECT u.id, 'The Bridge Builder',
  E'**Dad''s Story**\n\n> "My dad referenced a story of a young man hiking a harrowing trail... The old man replied: ''Yes, you are strong enough to make it on your own, for now. **But behind you, there is someone even younger that doesn''t have your strength or experience yet, and I''m building this bridge for them.**''"\n\n**Key Lesson:** I''m the old man now. And Liana Banyan is the bridge.',
  'public', NULL, 'Dad''s Story — Parable'
FROM auth.users u WHERE u.email = 'upekrithen@gmail.com' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO anecdotes (author_id, title, body_markdown, privacy_level, when_it_happened, where_it_happened)
SELECT u.id, 'The Kurt Ikard Confrontation',
  E'**High School Freshman**\n\n> "Faced with daily misery from a bully two feet taller, I told him:\n>\n> ''Until you stop, I will fight you every single time I see you. And we both know I will lose... I will not ever give up. Ever. One way, or another, you WILL stop.''\n>\n> That''s when he stopped. Not because I could beat him—I clearly could not. But because he realized I would NEVER stop trying."\n\n**Key Lesson:** Whatever your hand finds to do, do it with your might.',
  'public', '1984-01-01', 'High School'
FROM auth.users u WHERE u.email = 'upekrithen@gmail.com' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO anecdotes (author_id, title, body_markdown, privacy_level, when_it_happened, where_it_happened)
SELECT u.id, 'The Golden Eagle''s Head',
  E'**High School Pep Band**\n\n> "Suddenly two audience members from the opposing side ran across the court during a timeout and grabbed the Golden Eagles head off of our cheerleader mascot.\n>\n> Seeing this, I unclipped my saxophone and laid it down, then jumped over two rows down the stands, then to the floor, and ran across with the football team, and then crowd, behind me.\n>\n> They cancelled the game. We got our Eagle''s head back."\n\n**Key Lesson:** When something wrong happens, ACT. Don''t wait for someone else. The crowd will follow if you lead.',
  'public', '1985-01-01', 'High School — Gymnasium'
FROM auth.users u WHERE u.email = 'upekrithen@gmail.com' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO anecdotes (author_id, title, body_markdown, privacy_level, when_it_happened, where_it_happened)
SELECT u.id, 'Pet Antibiotics',
  E'**Adulthood**\n\n> "If you have ever gone to the pet supply store to buy antibiotics for your dog because you can''t afford to take your daughter to the doctor, then we have something in common.\n>\n> **So I know the hustle it takes to stay alive and take care of our loved ones. And I want a better way, and I can''t find one, so we''ll just have to make it ourselves.**"\n\n**Key Lesson:** This is why LifeLine Medications exists. This is why LB MSA exists. Because the hustle shouldn''t be required just to breathe.',
  'public', NULL, 'Adulthood — Various'
FROM auth.users u WHERE u.email = 'upekrithen@gmail.com' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO anecdotes (author_id, title, body_markdown, privacy_level, when_it_happened, where_it_happened)
SELECT u.id, 'The Squad Car Mannequin',
  E'**Military Police Encounter**\n\n> "I was on base and needed directions. I saw a squad car parked at an intersection... There was a mannequin in the driver''s seat.\n>\n> **People slowed down at that intersection even though no cop was there. The UNCERTAINTY of whether someone was watching created the behavior.**\n>\n> This is how the Haruchai system works. Banner (our AI moderation) is always watching."\n\n**Key Lesson:** The perception of watchfulness is often as effective as actual watchfulness.',
  'public', NULL, 'Military Base — MP Intersection'
FROM auth.users u WHERE u.email = 'upekrithen@gmail.com' LIMIT 1
ON CONFLICT DO NOTHING;
