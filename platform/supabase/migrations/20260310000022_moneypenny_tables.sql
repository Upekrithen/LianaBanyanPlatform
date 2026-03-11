-- Migration: MoneyPenny Virtual Assistant (Innovation #1556)
-- Creates tables for publication submissions, communication logs, and tasks.

-- 1. Publication Submissions
CREATE TABLE IF NOT EXISTS publication_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  publication_name TEXT NOT NULL,
  submission_type TEXT NOT NULL,  -- 'academic_paper', 'press_release', 'letter', 'article'
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  response_status TEXT DEFAULT 'pending',  -- 'pending', 'rejected', 'interested', 'accepted', 'published'
  response_received_at TIMESTAMPTZ,
  response_category TEXT,  -- 'form_rejection', 'personal_rejection', 'request_more_info', 'acceptance', 'revision_requested'
  notes TEXT,
  document_ref TEXT  -- path or ID of the submitted document
);

ALTER TABLE publication_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own publication submissions"
  ON publication_submissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own publication submissions"
  ON publication_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own publication submissions"
  ON publication_submissions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own publication submissions"
  ON publication_submissions FOR DELETE
  USING (auth.uid() = user_id);

-- 2. Communication Categories
CREATE TABLE IF NOT EXISTS communication_categories (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  color TEXT,
  sort_order INT DEFAULT 0,
  UNIQUE(user_id, name)
);

ALTER TABLE communication_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own communication categories"
  ON communication_categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own communication categories"
  ON communication_categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own communication categories"
  ON communication_categories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own communication categories"
  ON communication_categories FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Communication Log
CREATE TABLE IF NOT EXISTS communication_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  channel TEXT NOT NULL,  -- 'email', 'phone', 'text', 'linkedin', 'discord', 'other'
  direction TEXT NOT NULL DEFAULT 'inbound',  -- 'inbound', 'outbound'
  category_id INT REFERENCES communication_categories(id),
  sender TEXT,
  subject TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  summary TEXT,
  action_required BOOLEAN DEFAULT false,
  action_taken BOOLEAN DEFAULT false
);

ALTER TABLE communication_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own communication logs"
  ON communication_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own communication logs"
  ON communication_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own communication logs"
  ON communication_log FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own communication logs"
  ON communication_log FOR DELETE
  USING (auth.uid() = user_id);

-- 4. MoneyPenny Tasks
CREATE TABLE IF NOT EXISTS moneypenny_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  priority TEXT DEFAULT 'medium',  -- 'low', 'medium', 'high', 'urgent'
  status TEXT DEFAULT 'pending',  -- 'pending', 'in_progress', 'completed', 'deferred'
  source TEXT DEFAULT 'manual',  -- 'manual', 'bounty', 'guild', 'beacon', 'auto'
  source_ref TEXT,  -- ID of the source bounty/guild task/beacon
  category TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE moneypenny_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tasks"
  ON moneypenny_tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks"
  ON moneypenny_tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
  ON moneypenny_tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
  ON moneypenny_tasks FOR DELETE
  USING (auth.uid() = user_id);
