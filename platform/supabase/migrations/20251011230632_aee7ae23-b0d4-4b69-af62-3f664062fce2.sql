-- Add stage designation to project tasks
ALTER TABLE project_tasks ADD COLUMN stage text NOT NULL DEFAULT 'stage_1' CHECK (stage IN ('stage_1', 'stage_2'));

-- Add comment for clarity
COMMENT ON COLUMN project_tasks.stage IS 'Designates whether task is for Stage 1 (current development) or Stage 2 (post-Stage 1 features)';
