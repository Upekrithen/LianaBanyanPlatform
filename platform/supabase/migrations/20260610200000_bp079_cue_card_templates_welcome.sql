-- BP079 SEG-V0145-2 — cue_card_templates: add 'welcome' node_type + seed row
-- 2026-06-10
-- Extends the node_type CHECK constraint to include 'welcome' and inserts the
-- canonical welcome-screen cue deck template row.
--
-- The existing constraint was: IN ('food','local-business','service','tribe',
--   'manufacturing','guild','broadcast','hexisle')
-- This migration widens it to also accept 'welcome' (app-level onboarding card).

-- Step 1: drop old constraint, recreate with 'welcome' added
ALTER TABLE public.cue_card_templates
  DROP CONSTRAINT IF EXISTS cue_card_templates_node_type_check;

ALTER TABLE public.cue_card_templates
  ADD CONSTRAINT cue_card_templates_node_type_check
  CHECK (node_type IN (
    'food',
    'local-business',
    'service',
    'tribe',
    'manufacturing',
    'guild',
    'broadcast',
    'hexisle',
    'welcome'
  ));

-- Step 2: upsert the canonical welcome template row
-- Uses a unique index on (node_type, system_owned) would conflict; since there
-- is no unique constraint we use a DO-NOTHING guard via a sub-select check.
INSERT INTO public.cue_card_templates (
  node_type,
  template_name,
  template_payload,
  system_owned
)
SELECT
  'welcome',
  'MnemosyneC Welcome Screen',
  '{
    "hero": "Your AI has Amnesia. Dr. MnemosyneC has the Cure.",
    "subhead": "Private AI memory and retrieval on your own computer. Free Forever (SSPL). No Ads, No Strings. Great to use, better to join. Test it first or start using it now.",
    "bullets": [
      "Free AI that remembers, runs locally, belongs to you.",
      "Private AI memory on your computer.",
      "Learn how it works"
    ],
    "highlight_cards": [
      "HOT/COLD Banyan Metric Results",
      "Google Gemma 4 12B MMLU-Pro Benchmark",
      "BP074 Sound Barrier — Cohen's Kappa 1.000 Trophy"
    ],
    "ctas": [
      {"label": "Prove it with a test", "color": "green", "description": "See benchmark results before you decide."},
      {"label": "Just use it", "color": "blue", "description": "Start with the AI that fits your computer."}
    ]
  }'::jsonb,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.cue_card_templates
  WHERE node_type = 'welcome' AND system_owned = true
);
