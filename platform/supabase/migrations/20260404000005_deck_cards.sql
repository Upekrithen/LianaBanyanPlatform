-- K244: Deck Card Deep-Link Pipeline (#2135)
-- NOTE: public.deck_cards already exists in legacy systems. This migration is additive
-- and keeps prior rows valid while enabling BST + Skipping Stone deep-link cards.

CREATE TABLE IF NOT EXISTS public.deck_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_type TEXT NOT NULL CHECK (card_type IN ('bst_episode', 'skipping_stone')),
  episode_id UUID REFERENCES public.crewman_episodes(id),
  paper_key TEXT,
  section_anchor TEXT,
  title TEXT NOT NULL,
  hook_text TEXT NOT NULL,
  deep_link_url TEXT NOT NULL,
  qr_code_data TEXT,
  card_template TEXT NOT NULL DEFAULT 'default',
  logo_variant TEXT NOT NULL DEFAULT 'standard' CHECK (logo_variant IN ('standard', 'skipping_stone')),
  scan_count INTEGER NOT NULL DEFAULT 0,
  signup_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'generated' CHECK (status IN ('generated', 'printed', 'distributed', 'retired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.deck_cards ADD COLUMN IF NOT EXISTS episode_id UUID REFERENCES public.crewman_episodes(id);
ALTER TABLE public.deck_cards ADD COLUMN IF NOT EXISTS paper_key TEXT;
ALTER TABLE public.deck_cards ADD COLUMN IF NOT EXISTS section_anchor TEXT;
ALTER TABLE public.deck_cards ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.deck_cards ADD COLUMN IF NOT EXISTS hook_text TEXT;
ALTER TABLE public.deck_cards ADD COLUMN IF NOT EXISTS deep_link_url TEXT;
ALTER TABLE public.deck_cards ADD COLUMN IF NOT EXISTS qr_code_data TEXT;
ALTER TABLE public.deck_cards ADD COLUMN IF NOT EXISTS card_template TEXT DEFAULT 'default';
ALTER TABLE public.deck_cards ADD COLUMN IF NOT EXISTS logo_variant TEXT DEFAULT 'standard';
ALTER TABLE public.deck_cards ADD COLUMN IF NOT EXISTS scan_count INTEGER DEFAULT 0;
ALTER TABLE public.deck_cards ADD COLUMN IF NOT EXISTS signup_count INTEGER DEFAULT 0;
ALTER TABLE public.deck_cards ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'generated';
ALTER TABLE public.deck_cards ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

UPDATE public.deck_cards
SET
  title = COALESCE(title, front_title, name, 'Deck Card'),
  hook_text = COALESCE(hook_text, description, back_instructions, 'Scan to continue'),
  deep_link_url = COALESCE(deep_link_url, back_destination, '/read'),
  card_template = COALESCE(card_template, 'default'),
  logo_variant = COALESCE(logo_variant, 'standard'),
  scan_count = COALESCE(scan_count, 0),
  signup_count = COALESCE(signup_count, 0),
  status = COALESCE(status, 'generated');

-- Normalize legacy rows so the additive pipeline check can be applied safely.
UPDATE public.deck_cards
SET card_type = 'navigation'
WHERE card_type IS NULL
   OR card_type NOT IN (
     'navigation', 'access', 'gift', 'social', 'economic', 'governance', 'secret',
     'bst_episode', 'skipping_stone'
   );

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'deck_cards_logo_variant_check'
  ) THEN
    ALTER TABLE public.deck_cards
      ADD CONSTRAINT deck_cards_logo_variant_check
      CHECK (logo_variant IS NULL OR logo_variant IN ('standard', 'skipping_stone'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'deck_cards_status_check'
  ) THEN
    ALTER TABLE public.deck_cards
      ADD CONSTRAINT deck_cards_status_check
      CHECK (status IS NULL OR status IN ('generated', 'printed', 'distributed', 'retired'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'deck_cards_card_type_pipeline_check'
  ) THEN
    ALTER TABLE public.deck_cards
      ADD CONSTRAINT deck_cards_card_type_pipeline_check
      CHECK (
        card_type IN (
          'navigation', 'access', 'gift', 'social', 'economic', 'governance', 'secret',
          'bst_episode', 'skipping_stone'
        )
      );
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.set_deck_cards_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_deck_cards_set_updated_at ON public.deck_cards;
CREATE TRIGGER tr_deck_cards_set_updated_at
  BEFORE UPDATE ON public.deck_cards
  FOR EACH ROW
  EXECUTE FUNCTION public.set_deck_cards_updated_at();

ALTER TABLE public.deck_cards ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'deck_cards'
      AND policyname = 'Public read deck cards'
  ) THEN
    CREATE POLICY "Public read deck cards"
      ON public.deck_cards
      FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'deck_cards'
      AND policyname = 'Service role manage deck cards'
  ) THEN
    CREATE POLICY "Service role manage deck cards"
      ON public.deck_cards
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_deck_cards_type ON public.deck_cards (card_type);
CREATE INDEX IF NOT EXISTS idx_deck_cards_episode ON public.deck_cards (episode_id) WHERE episode_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_deck_cards_paper ON public.deck_cards (paper_key) WHERE paper_key IS NOT NULL;
