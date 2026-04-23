-- MoneyPenny Q&A — Question Signatures (novelty detection)
-- Stores normalized hashes of questions to detect duplicates

CREATE TABLE IF NOT EXISTS qa_question_signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_hash text NOT NULL UNIQUE,
  first_asked_by uuid REFERENCES auth.users(id),
  first_qa_entry_id uuid NOT NULL REFERENCES qa_entries(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE qa_question_signatures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage question signatures"
  ON qa_question_signatures FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);
