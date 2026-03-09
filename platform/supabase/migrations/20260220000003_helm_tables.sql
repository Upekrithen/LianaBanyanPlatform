-- ═══════════════════════════════════════════════════════════════════════════
-- THE HELM — Card Slots and Input Preferences Tables
-- Applied: Feb 20, 2026 to ruuxzilgmuwddcofqecc (LianaBanyan direct Supabase)
-- ═══════════════════════════════════════════════════════════════════════════

-- STEP 1: Create helm_card_slots table
-- 12 card slots (clock positions) for channel selection
CREATE TABLE IF NOT EXISTS public.helm_card_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Slot position (1-12, like a clock face)
  slot_position INTEGER NOT NULL CHECK (slot_position BETWEEN 1 AND 12),
  
  -- What's in this slot
  deck_card_id UUID, -- Reference to deck_cards table if using a deck card
  slot_name TEXT NOT NULL DEFAULT 'Empty',
  slot_icon TEXT NOT NULL DEFAULT '➕',
  destination_url TEXT,
  destination_type TEXT NOT NULL DEFAULT 'empty' CHECK (destination_type IN ('platform', 'external', 'custom', 'empty')),
  
  -- Lock mechanics
  is_locked BOOLEAN DEFAULT false,
  lock_type TEXT CHECK (lock_type IN ('onboarding', 'achievement', 'beacon', NULL)),
  required_beacon_color TEXT, -- For special unlock requirements (e.g., 'purple', 'gold')
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- One slot per position per user
  UNIQUE(user_id, slot_position)
);

-- STEP 2: Create helm_input_preferences table
-- Tracks user's preferences for each INPUT mode
CREATE TABLE IF NOT EXISTS public.helm_input_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Which INPUT mode
  input_mode TEXT NOT NULL CHECK (input_mode IN (
    'my_stuff', 'create', 'browse', 'play', 
    'community', 'govern', 'initiatives', 'settings'
  )),
  
  -- User's position within this mode
  sub_channel INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ DEFAULT now(),
  
  -- Custom ordering of items within this mode
  custom_order JSONB DEFAULT '[]',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- One preference per mode per user
  UNIQUE(user_id, input_mode)
);

-- STEP 3: Create indexes
CREATE INDEX IF NOT EXISTS idx_helm_card_slots_user ON public.helm_card_slots(user_id);
CREATE INDEX IF NOT EXISTS idx_helm_card_slots_position ON public.helm_card_slots(slot_position);
CREATE INDEX IF NOT EXISTS idx_helm_input_preferences_user ON public.helm_input_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_helm_input_preferences_mode ON public.helm_input_preferences(input_mode);

-- STEP 4: Enable RLS
ALTER TABLE public.helm_card_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.helm_input_preferences ENABLE ROW LEVEL SECURITY;

-- STEP 5: RLS Policies for helm_card_slots
CREATE POLICY "Users can view their own card slots"
  ON public.helm_card_slots FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own card slots"
  ON public.helm_card_slots FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own card slots"
  ON public.helm_card_slots FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own card slots"
  ON public.helm_card_slots FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- STEP 6: RLS Policies for helm_input_preferences
CREATE POLICY "Users can view their own input preferences"
  ON public.helm_input_preferences FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own input preferences"
  ON public.helm_input_preferences FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own input preferences"
  ON public.helm_input_preferences FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own input preferences"
  ON public.helm_input_preferences FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- STEP 7: Function to initialize default card slots for new users
CREATE OR REPLACE FUNCTION initialize_helm_card_slots()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert 6 pre-filled slots (onboarding milestones)
  INSERT INTO public.helm_card_slots (user_id, slot_position, slot_name, slot_icon, destination_url, destination_type, is_locked, lock_type)
  VALUES
    (NEW.id, 12, 'Home', '🏠', '/', 'platform', true, 'onboarding'),
    (NEW.id, 1, 'Portfolio', '📂', '/portfolio', 'platform', true, 'onboarding'),
    (NEW.id, 2, 'Projects', '🚀', '/projects', 'platform', true, 'onboarding'),
    (NEW.id, 3, 'Play', '🎮', '/hexisle', 'platform', true, 'onboarding'),
    (NEW.id, 4, 'Create', '🎨', '/workshop', 'platform', true, 'onboarding'),
    (NEW.id, 5, 'Factory', '🏭', '/factory', 'platform', true, 'onboarding'),
    -- 6 empty customizable slots
    (NEW.id, 6, 'Empty', '➕', NULL, 'empty', false, NULL),
    (NEW.id, 7, 'Empty', '➕', NULL, 'empty', false, NULL),
    (NEW.id, 8, 'Empty', '➕', NULL, 'empty', false, NULL),
    (NEW.id, 9, 'Empty', '➕', NULL, 'empty', false, NULL),
    (NEW.id, 10, 'Empty', '➕', NULL, 'empty', false, NULL),
    (NEW.id, 11, 'Empty', '➕', NULL, 'empty', false, NULL)
  ON CONFLICT (user_id, slot_position) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- STEP 8: Trigger to initialize slots on user creation
-- Note: This assumes there's a profiles or members table that gets created on signup
-- If using auth.users directly, this would need to be called differently
DROP TRIGGER IF EXISTS on_user_created_init_helm ON auth.users;
-- CREATE TRIGGER on_user_created_init_helm
--   AFTER INSERT ON auth.users
--   FOR EACH ROW
--   EXECUTE FUNCTION initialize_helm_card_slots();

-- STEP 9: Function to update timestamps
CREATE OR REPLACE FUNCTION update_helm_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- STEP 10: Triggers for updated_at
DROP TRIGGER IF EXISTS update_helm_card_slots_updated_at ON public.helm_card_slots;
CREATE TRIGGER update_helm_card_slots_updated_at
  BEFORE UPDATE ON public.helm_card_slots
  FOR EACH ROW
  EXECUTE FUNCTION update_helm_updated_at();

DROP TRIGGER IF EXISTS update_helm_input_preferences_updated_at ON public.helm_input_preferences;
CREATE TRIGGER update_helm_input_preferences_updated_at
  BEFORE UPDATE ON public.helm_input_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_helm_updated_at();

-- STEP 11: Comments
COMMENT ON TABLE public.helm_card_slots IS 'The Helm: 12 card slots (clock positions) for channel selection';
COMMENT ON TABLE public.helm_input_preferences IS 'The Helm: User preferences for each of the 8 INPUT modes';
COMMENT ON COLUMN public.helm_card_slots.slot_position IS 'Clock position 1-12 (12 at top, clockwise)';
COMMENT ON COLUMN public.helm_card_slots.lock_type IS 'onboarding=milestone, achievement=badge, beacon=colored key';
COMMENT ON COLUMN public.helm_card_slots.required_beacon_color IS 'Color of beacon required to unlock (e.g., purple, gold)';
