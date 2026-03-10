-- ============================================================
-- REPAIR: Seed beacon points data
-- Migration 20260310000015 created the tables but the INSERT
-- failed due to a trailing comma. This migration seeds the data.
-- ============================================================

-- Only insert if the table is empty (idempotent)
INSERT INTO beacon_points (beacon_number, name, description, icon, challenge_type, challenge_description, challenge_requirement, joules_reward, marks_reward, snowflake_key_name, latitude_hint, lore_text)
SELECT * FROM (VALUES
  (1,
   'Founder''s Keep',
   'The starting point of the Northern Path. A warm fire burns in the hearth.',
   '🏰',
   'snow_door_unlock',
   'Unlock the Snow Door with any "North" password in any language.',
   '{"type": "snow_door_unlock", "door_id": "snow-door"}'::jsonb,
   12, 0,
   'Snowflake of Entry',
   '90°N — The Hearthstone',
   'The journey of a thousand miles begins with a single step through frost. The Keep has stood here since the platform''s founding, waiting for those who know the way North.'),

  (2,
   'The Standing Stones',
   'Ancient markers in a clearing. Each stone bears a word in a different language.',
   '🪨',
   'quiz_complete',
   'Complete any Paper Quiz on the Golden Key Quest (score 3/5 or higher).',
   '{"type": "quiz_complete", "min_score": 3, "min_total": 5}'::jsonb,
   8, 5,
   'Snowflake of Knowledge',
   '80°N — The Learning Circle',
   'The Standing Stones were placed by the first readers — those who proved they understood before they judged. Each stone represents a different paper, a different idea, a different way of seeing.'),

  (3,
   'The Frozen Bridge',
   'An ice bridge spans a deep ravine. Words carved into the railing shimmer in many scripts.',
   '🌉',
   'translation',
   'Visit the Friend Page and select any language that needs translators.',
   '{"type": "friend_page_visit", "action": "select_language"}'::jsonb,
   8, 5,
   'Snowflake of Tongues',
   '70°N — The Bridge of Words',
   'This bridge was built word by word, language by language. Every translation is a plank laid for the next traveler. The bridge grows stronger with every tongue spoken across it.'),

  (4,
   'The Watchtower',
   'A tall stone tower with a spiral stair. From the top, you can see the whole platform.',
   '🗼',
   'engagement',
   'Explore the Crow''s Nest — add at least one item to your To-Go Bag.',
   '{"type": "crows_nest_engage", "action": "add_to_bag"}'::jsonb,
   10, 5,
   'Snowflake of Sight',
   '60°N — The Observer''s Perch',
   'From the Watchtower, you see not just what IS, but what COULD BE. Every initiative, every innovation, every person working toward something better. The view changes you.'),

  (5,
   'The Ice Library',
   'Books frozen in crystal. Touch one and it thaws, releasing knowledge.',
   '📚',
   'exploration',
   'Visit the Academic Papers Directory and read any paper on Cephas (open a paper link).',
   '{"type": "paper_visit", "action": "open_paper"}'::jsonb,
   10, 5,
   'Snowflake of Depth',
   '50°N — The Crystal Stacks',
   'The Ice Library preserves every idea. Not behind glass — in ice. You must bring your own warmth to thaw what you want to read. The effort is the point.'),

  (6,
   'The Northern Forge',
   'Blue flames dance on an anvil. The air smells of ozone and possibility.',
   '🔥',
   'creation',
   'Visit the Help Wanted page or submit a Golden Key answer — create or contribute something.',
   '{"type": "creation_act", "actions": ["golden_key_submit", "help_wanted_visit"]}'::jsonb,
   12, 10,
   'Snowflake of Making',
   '40°N — The Blue Anvil',
   'The Northern Forge burns cold. Cold fire is harder to master than hot. But what you make here lasts longer — tempered by patience, not just heat.'),

  (7,
   'The Beacon Summit',
   'The final beacon. A pillar of light shoots into the aurora. The Teleportation Deck Card awaits.',
   '✨',
   'final_challenge',
   'Complete all 6 previous beacons. Claim your Teleportation Deck Card.',
   '{"type": "all_beacons_complete", "required_beacons": 6}'::jsonb,
   25, 15,
   'Snowflake of the Northern Wind',
   '0°N — The Crown of the World',
   'You walked the entire path. Every step earned. Every beacon lit by your effort. The Northern Wind now carries you — anywhere on the platform, instantly. This is what it means to have explored.')
) AS v(beacon_number, name, description, icon, challenge_type, challenge_description, challenge_requirement, joules_reward, marks_reward, snowflake_key_name, latitude_hint, lore_text)
WHERE NOT EXISTS (SELECT 1 FROM beacon_points LIMIT 1);
