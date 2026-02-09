-- Create task log table for tracking implemented features
CREATE TABLE public.task_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_summary TEXT NOT NULL,
  task_details TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.task_log ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own task logs"
  ON public.task_log
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own task logs"
  ON public.task_log
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own task logs"
  ON public.task_log
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_task_log_user_id ON public.task_log(user_id);
CREATE INDEX idx_task_log_created_at ON public.task_log(created_at DESC);