-- Task 19: Theme Suggestion & Management System
-- Allow users to suggest themes with routing to appropriate managers

-- Theme suggestions table
CREATE TABLE IF NOT EXISTS theme_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  suggested_by uuid REFERENCES auth.users(id),
  theme_name text NOT NULL,
  theme_description text,
  color_scheme jsonb NOT NULL, -- {primary, secondary, background, accent}
  preview_image_url text,
  status text DEFAULT 'pending', -- pending, approved, rejected, implemented
  assigned_to uuid REFERENCES auth.users(id),
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Theme assignment routing table
CREATE TABLE IF NOT EXISTS project_theme_managers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
  theme_manager_id uuid REFERENCES auth.users(id), -- Hired theme maker
  fallback_steward_id uuid REFERENCES auth.users(id),
  fallback_owner_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS policies for theme suggestions
ALTER TABLE theme_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved themes"
  ON theme_suggestions FOR SELECT
  USING (status = 'approved' OR status = 'implemented');

CREATE POLICY "Users can view own suggestions"
  ON theme_suggestions FOR SELECT
  USING (suggested_by = auth.uid());

CREATE POLICY "Assigned managers can view suggestions"
  ON theme_suggestions FOR SELECT
  USING (assigned_to = auth.uid());

CREATE POLICY "Authenticated users can create theme suggestions"
  ON theme_suggestions FOR INSERT
  WITH CHECK (auth.uid() = suggested_by);

CREATE POLICY "Assigned managers can update suggestions"
  ON theme_suggestions FOR UPDATE
  USING (assigned_to = auth.uid());

CREATE POLICY "Project owners can update suggestions"
  ON theme_suggestions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = theme_suggestions.project_id 
      AND projects.owner_id = auth.uid()
    )
  );

-- RLS policies for theme managers
ALTER TABLE project_theme_managers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view theme managers"
  ON project_theme_managers FOR SELECT
  USING (true);

CREATE POLICY "Project owners can manage theme managers"
  ON project_theme_managers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_theme_managers.project_id 
      AND projects.owner_id = auth.uid()
    )
  );

-- Function to automatically assign theme suggestions to appropriate manager
CREATE OR REPLACE FUNCTION auto_assign_theme_suggestion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _manager_record RECORD;
BEGIN
  -- Get project theme manager assignment
  SELECT * INTO _manager_record
  FROM project_theme_managers
  WHERE project_id = NEW.project_id;
  
  -- Assign based on hierarchy: theme_manager → steward → owner
  IF _manager_record.theme_manager_id IS NOT NULL THEN
    NEW.assigned_to := _manager_record.theme_manager_id;
  ELSIF _manager_record.fallback_steward_id IS NOT NULL THEN
    NEW.assigned_to := _manager_record.fallback_steward_id;
  ELSE
    -- Fallback to project owner
    NEW.assigned_to := (
      SELECT owner_id FROM projects WHERE id = NEW.project_id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER assign_theme_suggestion_trigger
BEFORE INSERT ON theme_suggestions
FOR EACH ROW
EXECUTE FUNCTION auto_assign_theme_suggestion();

-- Add updated_at trigger
CREATE TRIGGER update_theme_suggestions_updated_at
BEFORE UPDATE ON theme_suggestions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_theme_managers_updated_at
BEFORE UPDATE ON project_theme_managers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_theme_suggestions_project ON theme_suggestions(project_id);
CREATE INDEX idx_theme_suggestions_assigned_to ON theme_suggestions(assigned_to);
CREATE INDEX idx_theme_suggestions_status ON theme_suggestions(status);
CREATE INDEX idx_project_theme_managers_project ON project_theme_managers(project_id);