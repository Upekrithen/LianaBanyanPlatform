-- K389: Helm Card Dashboard layout persistence
-- Innovation #2236 (Crown Jewel #209)

CREATE TABLE IF NOT EXISTS helm_card_layout (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  layout_json jsonb DEFAULT '[]'::jsonb,
  display_mode text NOT NULL DEFAULT 'grid' CHECK (display_mode IN ('grid', 'theater', 'deck')),
  category_filter text DEFAULT 'all',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE helm_card_layout ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own layout"
  ON helm_card_layout FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_helm_card_layout_user ON helm_card_layout(user_id);
