-- Little Red Hen Story - Social Media Posts
-- 26 posts across 3 acts, building up cumulatively within each act
-- Posts to all platforms: twitter, linkedin, bluesky, threads, facebook, instagram, tiktok

-- Image mapping (display order -> actual file):
-- Act 1 (Village): 1-13 -> hen1-hen13
-- Act 2 (Ants/Dream): 14-18 -> hen24, hen19, hen20, hen21, hen22
-- Act 3 (Grasshoppers): 19-25 -> hen14, hen15, hen16, hen17, hen18, hen25, hen26

-- Base URL for images
-- Images are at: https://lianabanyan.com/fabled/hen{N}.png

-- Captions for each scene
-- 1: "The Little Red Hen finds some wheat seeds..."
-- 2: "'Who will help me plant this wheat?' 'Not I!' said the others."
-- 3: "So she planted, harvested, ground, and baked it herself."
-- 4: "'Let's do it TOGETHER next time!' She packs bread and seeds."
-- 5: "The Hen arrives at a village, carrying her basket and a stone."
-- 6: "'Soup from a STONE?' The villagers watch, confused."
-- 7: "Each villager adds something small: salt, a potato, herbs, an onion..."
-- 8: "Soup is ready! But the bread runs out before everyone gets some."
-- 9: "The Hen holds up wheat seeds. 'To have more bread, we need to GROW more wheat.'"
-- 10: "In the fields, ants pile up seeds while grasshoppers take the piles."
-- 11: "The Hen and villagers approach the ants."
-- 12: "The Hen shows the ants: 'Plant wheat, don't just pile seeds!'"
-- 13: "Together they plant, harvest, grind, and bake as ONE team."
-- 14: "The Hen turns to the ants: 'You're gonna rattle the stars.'" (hen24)
-- 15: "'How did you know what to do?' asks a young ant." (hen19)
-- 16: "The Hen daydreams of a Viking ship while cooking in the city." (hen20)
-- 17: "She sees hungry animals outside a locked building full of bread." (hen21)
-- 18: "She reaches into her dream and grabs an oar — the same as her spoon." (hen22)
-- 19: "The grasshoppers watch, angry. Hopper points at the ants." (hen14)
-- 20: "Two groups face each other. Tension in the air." (hen15)
-- 21: "The ants realize: 'Wait... WE outnumber THEM!'" (hen16)
-- 22: "The ants link arms in army ant formation." (hen17)
-- 23: "'WE ARE THE ANTS' — Standing firm together." (hen18)
-- 24: "Hopper sits alone, defeated. Cold and sad." (hen25)
-- 25: "..." (hen26)

-- Create a temporary table to hold the post data
CREATE TEMP TABLE lrh_posts (
  post_number int,
  act int,
  content text,
  media_urls text[]
);

-- ACT 1: Village Story (Posts 1-13)
-- Each post builds on the previous, showing cumulative images

INSERT INTO lrh_posts (post_number, act, content, media_urls) VALUES
(1, 1, 'The Little Red Hen finds some wheat seeds...

🌾 Part 1 of our story: "Help Each Other Help Ourselves"

#LianaBanyan #LittleRedHen #Cooperation', 
ARRAY['https://lianabanyan.com/fabled/hen1.png']),

(2, 1, 'The Little Red Hen finds some wheat seeds...
"Who will help me plant this wheat?" "Not I!" said the others.

🌾 Part 2 of our story

#LianaBanyan #LittleRedHen #Cooperation', 
ARRAY['https://lianabanyan.com/fabled/hen1.png', 'https://lianabanyan.com/fabled/hen2.png']),

(3, 1, 'The Little Red Hen finds some wheat seeds...
"Who will help me plant this wheat?" "Not I!" said the others.
So she planted, harvested, ground, and baked it herself.

🌾 Part 3 of our story

#LianaBanyan #LittleRedHen #Cooperation', 
ARRAY['https://lianabanyan.com/fabled/hen1.png', 'https://lianabanyan.com/fabled/hen2.png', 'https://lianabanyan.com/fabled/hen3.png']),

(4, 1, 'The Little Red Hen finds some wheat seeds...
"Who will help me plant this wheat?" "Not I!" said the others.
So she planted, harvested, ground, and baked it herself.
"Let''s do it TOGETHER next time!" She packs bread and seeds.

🌾 Part 4 of our story

#LianaBanyan #LittleRedHen #Cooperation', 
ARRAY['https://lianabanyan.com/fabled/hen1.png', 'https://lianabanyan.com/fabled/hen2.png', 'https://lianabanyan.com/fabled/hen3.png', 'https://lianabanyan.com/fabled/hen4.png']),

(5, 1, 'ACT 1: The Village
The Hen arrives at a village, carrying her basket and a stone.

🌾 Part 5 of our story

#LianaBanyan #LittleRedHen #StoneSoup', 
ARRAY['https://lianabanyan.com/fabled/hen1.png', 'https://lianabanyan.com/fabled/hen2.png', 'https://lianabanyan.com/fabled/hen3.png', 'https://lianabanyan.com/fabled/hen4.png', 'https://lianabanyan.com/fabled/hen5.png']),

(6, 1, 'ACT 1: The Village
"Soup from a STONE?" The villagers watch, confused.

🌾 Part 6 of our story

#LianaBanyan #LittleRedHen #StoneSoup', 
ARRAY['https://lianabanyan.com/fabled/hen1.png', 'https://lianabanyan.com/fabled/hen2.png', 'https://lianabanyan.com/fabled/hen3.png', 'https://lianabanyan.com/fabled/hen4.png', 'https://lianabanyan.com/fabled/hen5.png', 'https://lianabanyan.com/fabled/hen6.png']),

(7, 1, 'ACT 1: The Village
Each villager adds something small: salt, a potato, herbs, an onion...

🌾 Part 7 of our story

#LianaBanyan #LittleRedHen #StoneSoup #Together', 
ARRAY['https://lianabanyan.com/fabled/hen1.png', 'https://lianabanyan.com/fabled/hen2.png', 'https://lianabanyan.com/fabled/hen3.png', 'https://lianabanyan.com/fabled/hen4.png', 'https://lianabanyan.com/fabled/hen5.png', 'https://lianabanyan.com/fabled/hen6.png', 'https://lianabanyan.com/fabled/hen7.png']),

(8, 1, 'ACT 1: The Village
Soup is ready! But the bread runs out before everyone gets some.

🌾 Part 8 of our story

#LianaBanyan #LittleRedHen #StoneSoup', 
ARRAY['https://lianabanyan.com/fabled/hen1.png', 'https://lianabanyan.com/fabled/hen2.png', 'https://lianabanyan.com/fabled/hen3.png', 'https://lianabanyan.com/fabled/hen4.png', 'https://lianabanyan.com/fabled/hen5.png', 'https://lianabanyan.com/fabled/hen6.png', 'https://lianabanyan.com/fabled/hen7.png', 'https://lianabanyan.com/fabled/hen8.png']),

(9, 1, 'ACT 1: The Village
The Hen holds up wheat seeds. "To have more bread, we need to GROW more wheat."

🌾 Part 9 of our story

#LianaBanyan #LittleRedHen #GrowTogether', 
ARRAY['https://lianabanyan.com/fabled/hen1.png', 'https://lianabanyan.com/fabled/hen2.png', 'https://lianabanyan.com/fabled/hen3.png', 'https://lianabanyan.com/fabled/hen4.png', 'https://lianabanyan.com/fabled/hen5.png', 'https://lianabanyan.com/fabled/hen6.png', 'https://lianabanyan.com/fabled/hen7.png', 'https://lianabanyan.com/fabled/hen8.png', 'https://lianabanyan.com/fabled/hen9.png']),

(10, 1, 'ACT 1: The Village
In the fields, ants pile up seeds while grasshoppers take the piles.

🌾 Part 10 of our story

#LianaBanyan #LittleRedHen #ABugsLife', 
ARRAY['https://lianabanyan.com/fabled/hen1.png', 'https://lianabanyan.com/fabled/hen2.png', 'https://lianabanyan.com/fabled/hen3.png', 'https://lianabanyan.com/fabled/hen4.png', 'https://lianabanyan.com/fabled/hen5.png', 'https://lianabanyan.com/fabled/hen6.png', 'https://lianabanyan.com/fabled/hen7.png', 'https://lianabanyan.com/fabled/hen8.png', 'https://lianabanyan.com/fabled/hen9.png', 'https://lianabanyan.com/fabled/hen10.png']),

(11, 1, 'ACT 1: The Village
The Hen and villagers approach the ants.

🌾 Part 11 of our story

#LianaBanyan #LittleRedHen #ABugsLife', 
ARRAY['https://lianabanyan.com/fabled/hen1.png', 'https://lianabanyan.com/fabled/hen2.png', 'https://lianabanyan.com/fabled/hen3.png', 'https://lianabanyan.com/fabled/hen4.png', 'https://lianabanyan.com/fabled/hen5.png', 'https://lianabanyan.com/fabled/hen6.png', 'https://lianabanyan.com/fabled/hen7.png', 'https://lianabanyan.com/fabled/hen8.png', 'https://lianabanyan.com/fabled/hen9.png', 'https://lianabanyan.com/fabled/hen10.png', 'https://lianabanyan.com/fabled/hen11.png']),

(12, 1, 'ACT 1: The Village
The Hen shows the ants: "Plant wheat, don''t just pile seeds!"

🌾 Part 12 of our story

#LianaBanyan #LittleRedHen #PlantSeeds', 
ARRAY['https://lianabanyan.com/fabled/hen1.png', 'https://lianabanyan.com/fabled/hen2.png', 'https://lianabanyan.com/fabled/hen3.png', 'https://lianabanyan.com/fabled/hen4.png', 'https://lianabanyan.com/fabled/hen5.png', 'https://lianabanyan.com/fabled/hen6.png', 'https://lianabanyan.com/fabled/hen7.png', 'https://lianabanyan.com/fabled/hen8.png', 'https://lianabanyan.com/fabled/hen9.png', 'https://lianabanyan.com/fabled/hen10.png', 'https://lianabanyan.com/fabled/hen11.png', 'https://lianabanyan.com/fabled/hen12.png']),

(13, 1, 'ACT 1 FINALE: The Village
Together they plant, harvest, grind, and bake as ONE team.

🌾 End of Act 1 — The village learned to work together!

#LianaBanyan #LittleRedHen #Together #OneTeam', 
ARRAY['https://lianabanyan.com/fabled/hen1.png', 'https://lianabanyan.com/fabled/hen2.png', 'https://lianabanyan.com/fabled/hen3.png', 'https://lianabanyan.com/fabled/hen4.png', 'https://lianabanyan.com/fabled/hen5.png', 'https://lianabanyan.com/fabled/hen6.png', 'https://lianabanyan.com/fabled/hen7.png', 'https://lianabanyan.com/fabled/hen8.png', 'https://lianabanyan.com/fabled/hen9.png', 'https://lianabanyan.com/fabled/hen10.png', 'https://lianabanyan.com/fabled/hen11.png', 'https://lianabanyan.com/fabled/hen12.png', 'https://lianabanyan.com/fabled/hen13.png']);

-- ACT 2: The Ants & Dream Sequence (Posts 14-18)
-- Images: hen24, hen19, hen20, hen21, hen22

INSERT INTO lrh_posts (post_number, act, content, media_urls) VALUES
(14, 2, 'ACT 2: The Dream
The Hen turns to the ants: "You''re gonna rattle the stars."

⭐ Part 14 of our story — A new chapter begins

#LianaBanyan #LittleRedHen #RattleTheStars #ABugsLife', 
ARRAY['https://lianabanyan.com/fabled/hen24.png']),

(15, 2, 'ACT 2: The Dream
The Hen turns to the ants: "You''re gonna rattle the stars."
"How did you know what to do?" asks a young ant.

⭐ Part 15 of our story

#LianaBanyan #LittleRedHen #RattleTheStars', 
ARRAY['https://lianabanyan.com/fabled/hen24.png', 'https://lianabanyan.com/fabled/hen19.png']),

(16, 2, 'ACT 2: The Dream
"How did you know what to do?" asks a young ant.
The Hen daydreams of a Viking ship while cooking in the city.

⭐ Part 16 of our story

#LianaBanyan #LittleRedHen #Dreams #Vikings', 
ARRAY['https://lianabanyan.com/fabled/hen24.png', 'https://lianabanyan.com/fabled/hen19.png', 'https://lianabanyan.com/fabled/hen20.png']),

(17, 2, 'ACT 2: The Dream
The Hen daydreams of a Viking ship while cooking in the city.
She sees hungry animals outside a locked building full of bread.

⭐ Part 17 of our story

#LianaBanyan #LittleRedHen #Dreams #Vision', 
ARRAY['https://lianabanyan.com/fabled/hen24.png', 'https://lianabanyan.com/fabled/hen19.png', 'https://lianabanyan.com/fabled/hen20.png', 'https://lianabanyan.com/fabled/hen21.png']),

(18, 2, 'ACT 2 FINALE: The Dream
She reaches into her dream and grabs an oar — the same as her spoon.

⭐ End of Act 2 — Dreams become tools for change

#LianaBanyan #LittleRedHen #Dreams #TakeAction', 
ARRAY['https://lianabanyan.com/fabled/hen24.png', 'https://lianabanyan.com/fabled/hen19.png', 'https://lianabanyan.com/fabled/hen20.png', 'https://lianabanyan.com/fabled/hen21.png', 'https://lianabanyan.com/fabled/hen22.png']);

-- ACT 3: The Grasshoppers & Resolution (Posts 19-25)
-- Images: hen14, hen15, hen16, hen17, hen18, hen25, hen26

INSERT INTO lrh_posts (post_number, act, content, media_urls) VALUES
(19, 3, 'ACT 3: The Stand
The grasshoppers watch, angry. Hopper points at the ants.

🦗 Part 19 of our story — Conflict arrives

#LianaBanyan #LittleRedHen #ABugsLife #StandUp', 
ARRAY['https://lianabanyan.com/fabled/hen14.png']),

(20, 3, 'ACT 3: The Stand
The grasshoppers watch, angry. Hopper points at the ants.
Two groups face each other. Tension in the air.

🦗 Part 20 of our story

#LianaBanyan #LittleRedHen #ABugsLife #Tension', 
ARRAY['https://lianabanyan.com/fabled/hen14.png', 'https://lianabanyan.com/fabled/hen15.png']),

(21, 3, 'ACT 3: The Stand
Two groups face each other. Tension in the air.
The ants realize: "Wait... WE outnumber THEM!"

🦗 Part 21 of our story

#LianaBanyan #LittleRedHen #ABugsLife #Realization', 
ARRAY['https://lianabanyan.com/fabled/hen14.png', 'https://lianabanyan.com/fabled/hen15.png', 'https://lianabanyan.com/fabled/hen16.png']),

(22, 3, 'ACT 3: The Stand
The ants realize: "Wait... WE outnumber THEM!"
The ants link arms in army ant formation.

🦗 Part 22 of our story

#LianaBanyan #LittleRedHen #ABugsLife #Unity', 
ARRAY['https://lianabanyan.com/fabled/hen14.png', 'https://lianabanyan.com/fabled/hen15.png', 'https://lianabanyan.com/fabled/hen16.png', 'https://lianabanyan.com/fabled/hen17.png']),

(23, 3, 'ACT 3: The Stand
The ants link arms in army ant formation.
"WE ARE THE ANTS" — Standing firm together.

🦗 Part 23 of our story

#LianaBanyan #LittleRedHen #ABugsLife #WeAreTheAnts #Solidarity', 
ARRAY['https://lianabanyan.com/fabled/hen14.png', 'https://lianabanyan.com/fabled/hen15.png', 'https://lianabanyan.com/fabled/hen16.png', 'https://lianabanyan.com/fabled/hen17.png', 'https://lianabanyan.com/fabled/hen18.png']),

(24, 3, 'ACT 3: The Stand
"WE ARE THE ANTS" — Standing firm together.
Hopper sits alone, defeated. Cold and sad.

🦗 Part 24 of our story

#LianaBanyan #LittleRedHen #ABugsLife #Victory', 
ARRAY['https://lianabanyan.com/fabled/hen14.png', 'https://lianabanyan.com/fabled/hen15.png', 'https://lianabanyan.com/fabled/hen16.png', 'https://lianabanyan.com/fabled/hen17.png', 'https://lianabanyan.com/fabled/hen18.png', 'https://lianabanyan.com/fabled/hen25.png']),

(25, 3, 'ACT 3 FINALE: Grace
...

🕊️ The End — "Help each other help ourselves"

Full story: lianabanyan.com/get-a-job

#LianaBanyan #LittleRedHen #HelpEachOther #Grace #TheEnd', 
ARRAY['https://lianabanyan.com/fabled/hen14.png', 'https://lianabanyan.com/fabled/hen15.png', 'https://lianabanyan.com/fabled/hen16.png', 'https://lianabanyan.com/fabled/hen17.png', 'https://lianabanyan.com/fabled/hen18.png', 'https://lianabanyan.com/fabled/hen25.png', 'https://lianabanyan.com/fabled/hen26.png']);

-- Now insert into member_scheduled_posts for each platform
-- Using the founder's user_id (will need to be set)
-- Scheduling posts 1 hour apart starting from now

DO $$
DECLARE
  founder_id uuid;
  post_rec RECORD;
  platform_name text;
  platforms text[] := ARRAY['twitter', 'linkedin', 'bluesky', 'threads', 'facebook', 'instagram'];
  schedule_time timestamptz;
  post_interval interval := '1 hour';
BEGIN
  -- Get the founder's user_id (first admin user or specific email)
  SELECT id INTO founder_id 
  FROM auth.users 
  WHERE email = 'jonathan@lianabanyan.com'
  LIMIT 1;
  
  -- If no founder found, try to get any user (for testing)
  IF founder_id IS NULL THEN
    SELECT id INTO founder_id 
    FROM auth.users 
    LIMIT 1;
  END IF;
  
  -- If still no user, skip insertion
  IF founder_id IS NULL THEN
    RAISE NOTICE 'No user found to assign posts to. Skipping insertion.';
    RETURN;
  END IF;
  
  -- Start scheduling from now
  schedule_time := now();
  
  -- Loop through each post
  FOR post_rec IN SELECT * FROM lrh_posts ORDER BY post_number LOOP
    -- Loop through each platform
    FOREACH platform_name IN ARRAY platforms LOOP
      INSERT INTO public.member_scheduled_posts (
        user_id,
        content,
        media_urls,
        scheduled_for,
        status,
        platform
      ) VALUES (
        founder_id,
        post_rec.content,
        post_rec.media_urls,
        schedule_time,
        'scheduled',
        platform_name
      );
    END LOOP;
    
    -- Increment schedule time for next post
    schedule_time := schedule_time + post_interval;
  END LOOP;
  
  RAISE NOTICE 'Successfully scheduled % posts across % platforms', 
    (SELECT COUNT(*) FROM lrh_posts), 
    array_length(platforms, 1);
END $$;

-- Clean up temp table
DROP TABLE lrh_posts;

-- Summary comment
COMMENT ON TABLE public.member_scheduled_posts IS 
'Social media posts queue. Little Red Hen story (25 posts) added Feb 25, 2026.';
