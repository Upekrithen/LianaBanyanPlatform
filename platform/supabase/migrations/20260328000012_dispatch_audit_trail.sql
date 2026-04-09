-- Battery Dispatch audit trail + enhanced scheduled posts columns
-- K152: Adds dispatch_mode, stagger tracking, and audit log

ALTER TABLE public.member_scheduled_posts
  ADD COLUMN IF NOT EXISTS dispatch_mode text DEFAULT 'now',
  ADD COLUMN IF NOT EXISTS dispatch_batch_id uuid,
  ADD COLUMN IF NOT EXISTS platform_post_url text,
  ADD COLUMN IF NOT EXISTS error_message text,
  ADD COLUMN IF NOT EXISTS retry_count int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS disclosure_tags text[],
  ADD COLUMN IF NOT EXISTS adapted_content text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

CREATE TABLE IF NOT EXISTS public.dispatch_audit_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  batch_id uuid NOT NULL,
  dispatch_mode text NOT NULL DEFAULT 'now',
  platform_count int NOT NULL DEFAULT 0,
  platforms text[] NOT NULL DEFAULT '{}',
  base_content text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.dispatch_audit_log ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'dispatch_audit_own_read' AND tablename = 'dispatch_audit_log'
  ) THEN
    CREATE POLICY dispatch_audit_own_read ON public.dispatch_audit_log
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'dispatch_audit_own_insert' AND tablename = 'dispatch_audit_log'
  ) THEN
    CREATE POLICY dispatch_audit_own_insert ON public.dispatch_audit_log
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
