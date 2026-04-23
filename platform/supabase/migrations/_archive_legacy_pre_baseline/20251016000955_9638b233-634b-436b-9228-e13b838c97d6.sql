-- Task 18: Domain-Based Language Defaults
-- Add domain and default language tracking to projects

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS primary_domain text,
ADD COLUMN IF NOT EXISTS default_language text DEFAULT 'en';

-- Add language preference to project member contracts
ALTER TABLE project_member_contracts
ADD COLUMN IF NOT EXISTS preferred_language text;

-- Create index for domain lookups
CREATE INDEX IF NOT EXISTS idx_projects_primary_domain ON projects(primary_domain);

-- Add comment explaining the feature
COMMENT ON COLUMN projects.primary_domain IS 'Primary domain for the project (e.g., hexislo.com, defenseclaws.com)';
COMMENT ON COLUMN projects.default_language IS 'Default language for project based on domain (en, es, fr, etc.)';
COMMENT ON COLUMN project_member_contracts.preferred_language IS 'Member can override project default language';
