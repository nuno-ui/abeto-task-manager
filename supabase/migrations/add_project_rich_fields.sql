-- Add rich fields to projects table for COO dashboard
-- These fields support the detailed project cards in the API Dashboard

-- Human Role fields
ALTER TABLE projects ADD COLUMN IF NOT EXISTS human_role_before TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS human_role_after TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS who_is_empowered TEXT[];
ALTER TABLE projects ADD COLUMN IF NOT EXISTS new_capabilities TEXT[];

-- Data Requirements
ALTER TABLE projects ADD COLUMN IF NOT EXISTS data_required TEXT[];
ALTER TABLE projects ADD COLUMN IF NOT EXISTS data_generates TEXT[];
ALTER TABLE projects ADD COLUMN IF NOT EXISTS data_improves TEXT[];

-- Operations
ALTER TABLE projects ADD COLUMN IF NOT EXISTS ops_process TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS current_loa TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS potential_loa TEXT;

-- Resources and Dependencies
ALTER TABLE projects ADD COLUMN IF NOT EXISTS resources_used TEXT[];
ALTER TABLE projects ADD COLUMN IF NOT EXISTS api_endpoints TEXT[];
ALTER TABLE projects ADD COLUMN IF NOT EXISTS prerequisites TEXT[];
ALTER TABLE projects ADD COLUMN IF NOT EXISTS benefits TEXT[];
ALTER TABLE projects ADD COLUMN IF NOT EXISTS missing_api_data TEXT[];
ALTER TABLE projects ADD COLUMN IF NOT EXISTS integrations_needed TEXT[];

-- Dependencies as arrays of project slugs
ALTER TABLE projects ADD COLUMN IF NOT EXISTS depends_on TEXT[];
ALTER TABLE projects ADD COLUMN IF NOT EXISTS enables TEXT[];
ALTER TABLE projects ADD COLUMN IF NOT EXISTS related_to TEXT[];

-- Additional metadata
ALTER TABLE projects ADD COLUMN IF NOT EXISTS primary_users TEXT[];
ALTER TABLE projects ADD COLUMN IF NOT EXISTS data_status TEXT DEFAULT 'None';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS next_milestone TEXT;

-- Comment for documentation
COMMENT ON COLUMN projects.human_role_before IS 'What humans do today before this project';
COMMENT ON COLUMN projects.human_role_after IS 'What humans do after this project is deployed';
COMMENT ON COLUMN projects.ops_process IS 'Description of the operational process this project supports';
COMMENT ON COLUMN projects.current_loa IS 'Current Level of Automation';
COMMENT ON COLUMN projects.potential_loa IS 'Potential Level of Automation after project';
