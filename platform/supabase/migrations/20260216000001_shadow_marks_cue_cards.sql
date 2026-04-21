-- SHADOW MARKS CUE CARDS
-- ======================
-- Insert the 6 Shadow Marks cue cards into cue_card_templates
-- for minting via Hofund Studio.

-- Card 1: Shadow Marks Intro
INSERT INTO public.cue_card_templates (
  template_type, initiative_slug, title, subtitle, body_text, hashtags,
  background_type, background_value, card_style, is_active, sort_order
) VALUES (
  'initiative', 'pantry', 'Shadow Marks', 'Seeds That Grow Into Real Marks',
  E'🌱 SHADOW MARKS\n\nPost a recipe in an empty category\n→ Earn 50 Shadow Marks\n\nGet 10 votes → They crystallize\nNo votes? They wither.\n\nlianabanyan.com/pantry',
  ARRAY['shadow-marks', 'vesting', 'recipes', 'reputation', 'LianaBanyan'],
  'gradient', 'from-green-900/80 to-emerald-800/80', 'bold', true, 1
) ON CONFLICT DO NOTHING;

-- Card 2: Escape Velocity
INSERT INTO public.cue_card_templates (
  template_type, initiative_slug, title, subtitle, body_text, hashtags,
  background_type, background_value, card_style, is_active, sort_order
) VALUES (
  'initiative', 'pantry', 'Escape Velocity', '100 Votes = Permanent Protection',
  E'🚀 ESCAPE VELOCITY\n\nYour recipe reaches 100 votes?\nIt earns IP Ledger protection:\n\n• SHA-256 hash (permanent record)\n• Hot Pepper 🌶️ badge\n• Cannot be removed\n• +50 bonus MARKS\n\nlianabanyan.com/pantry',
  ARRAY['escape-velocity', 'ip-ledger', 'protection', 'recipes', 'LianaBanyan'],
  'gradient', 'from-orange-900/80 to-red-800/80', 'bold', true, 2
) ON CONFLICT DO NOTHING;

-- Card 3: Makers & Tasters
INSERT INTO public.cue_card_templates (
  template_type, initiative_slug, title, subtitle, body_text, hashtags,
  background_type, background_value, card_style, is_active, sort_order
) VALUES (
  'initiative', 'pantry', 'Makers & Tasters', '100 Makers : 1,000 Tasters',
  E'🍳 MAKERS & TASTERS\n\nMAKERS post recipes.\nTASTERS order, cook, and vote.\n\nBoth earn rewards.\nBoth build reputation.\nQuality decides who thrives.\n\nFirst 100 Makers: 50 Shadow Marks\nFirst 1,000 Tasters: 5 MARKS/order\n\nlianabanyan.com/pantry',
  ARRAY['makers', 'tasters', 'early-adopter', 'rewards', 'LianaBanyan'],
  'gradient', 'from-blue-900/80 to-indigo-800/80', 'bold', true, 3
) ON CONFLICT DO NOTHING;

-- Card 4: Category Bounties
INSERT INTO public.cue_card_templates (
  template_type, initiative_slug, title, subtitle, body_text, hashtags,
  background_type, background_value, card_style, is_active, sort_order
) VALUES (
  'initiative', 'pantry', 'Fill the Shelves', 'Empty Categories Pay More',
  E'📚 FILL THE SHELVES\n\nCategory Bounties:\n\nEMPTY (0 recipes): 50 Shadow Marks\nSPARSE (1-4): 30 Shadow Marks\nGROWING (5-9): 15 Shadow Marks\nESTABLISHED (10-19): 5 Shadow Marks\nFULL (20+): Standard credits only\n\nBe the FIRST! 🏆\n\nlianabanyan.com/pantry',
  ARRAY['bounties', 'categories', 'shadow-marks', 'fairness', 'LianaBanyan'],
  'gradient', 'from-purple-900/80 to-violet-800/80', 'bold', true, 4
) ON CONFLICT DO NOTHING;

-- Card 5: Vesting & Decay
INSERT INTO public.cue_card_templates (
  template_type, initiative_slug, title, subtitle, body_text, hashtags,
  background_type, background_value, card_style, is_active, sort_order
) VALUES (
  'initiative', 'pantry', 'Vesting & Decay', 'Use It or Lose It',
  E'⏳ VESTING & DECAY\n\nDay 0: Submit recipe → Shadow Marks\nDay 3: Decay starts (no votes)\nEvery 4 days: -20% uncrystallized\n\n10 votes: 100% crystallized\n30 days: Fully expired if unused\n\nGood recipes grow.\nBad recipes wither.',
  ARRAY['vesting', 'decay', 'crystallization', 'timeline', 'LianaBanyan'],
  'gradient', 'from-slate-800/80 to-zinc-700/80', 'bold', true, 5
) ON CONFLICT DO NOTHING;

-- Card 6: Platform Economics
INSERT INTO public.cue_card_templates (
  template_type, initiative_slug, title, subtitle, body_text, hashtags,
  background_type, background_value, card_style, is_active, sort_order
) VALUES (
  'initiative', 'pantry', 'How Money Flows', 'Cost + 20% Explained',
  E'💰 HOW MONEY FLOWS\n\n$15 Meal Order:\n├── Chef: $12.50 (83.3%)\n└── Platform: $2.50 (16.7%)\n\nFrom platform''s share:\n├── Recipe creator: $0.05-$0.25\n├── Delivery worker: 83.3% of fee\n└── Operations + initiatives\n\nCan you buy your own meal? YES.\nPlatform still functions.',
  ARRAY['economics', 'pricing', 'credits', 'platform', 'LianaBanyan'],
  'gradient', 'from-emerald-900/80 to-teal-800/80', 'bold', true, 6
) ON CONFLICT DO NOTHING;

-- Add Twitter/LinkedIn/Facebook text variants for each card
UPDATE public.cue_card_templates
SET
  twitter_text = body_text || E'\n\n#LianaBanyan #WorkerOwned',
  linkedin_text = E'Exciting innovation in cooperative economics:\n\n' || body_text,
  facebook_text = body_text
WHERE initiative_slug = 'pantry'
  AND title IN ('Shadow Marks', 'Escape Velocity', 'Makers & Tasters', 'Fill the Shelves', 'Vesting & Decay', 'How Money Flows')
  AND twitter_text IS NULL;

-- Log the insertions
DO $$
BEGIN
  RAISE NOTICE 'Shadow Marks cue cards inserted: 6 templates for Pantry initiative';
END $$;
