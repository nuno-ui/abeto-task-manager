-- =============================================================================
-- COMPLETE SCHEMA FIX FOR ABETO TASK MANAGER
-- Run this in Supabase SQL Editor to fix all enum and schema issues
-- =============================================================================

-- 1. Add 'none' to ai_potential enum (CRITICAL FIX)
ALTER TYPE ai_potential ADD VALUE IF NOT EXISTS 'none';

-- 2. Ensure all rich fields exist on projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS human_role_before TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS human_role_after TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS who_is_empowered TEXT[] DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS new_capabilities TEXT[] DEFAULT '{}';

ALTER TABLE projects ADD COLUMN IF NOT EXISTS data_required TEXT[] DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS data_generates TEXT[] DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS data_improves TEXT[] DEFAULT '{}';

ALTER TABLE projects ADD COLUMN IF NOT EXISTS ops_process TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS current_loa TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS potential_loa TEXT;

ALTER TABLE projects ADD COLUMN IF NOT EXISTS resources_used TEXT[] DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS api_endpoints TEXT[] DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS prerequisites TEXT[] DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS benefits TEXT[] DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS missing_api_data TEXT[] DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS integrations_needed TEXT[] DEFAULT '{}';

ALTER TABLE projects ADD COLUMN IF NOT EXISTS depends_on TEXT[] DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS enables TEXT[] DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS related_to TEXT[] DEFAULT '{}';

ALTER TABLE projects ADD COLUMN IF NOT EXISTS primary_users TEXT[] DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS data_status TEXT DEFAULT 'None';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS next_milestone TEXT;

-- 3. Add comments for documentation
COMMENT ON COLUMN projects.human_role_before IS 'What humans do today before this project';
COMMENT ON COLUMN projects.human_role_after IS 'What humans do after this project is deployed';
COMMENT ON COLUMN projects.ops_process IS 'Description of the operational process this project supports';
COMMENT ON COLUMN projects.current_loa IS 'Current Level of Automation';
COMMENT ON COLUMN projects.potential_loa IS 'Potential Level of Automation after project';

-- 4. Ensure service role can bypass RLS for API operations
-- This allows our Next.js API routes to work with service_role key

-- Create policy for service role on projects
DROP POLICY IF EXISTS "Service role has full access to projects" ON projects;
CREATE POLICY "Service role has full access to projects" ON projects
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Create policy for service role on tasks
DROP POLICY IF EXISTS "Service role has full access to tasks" ON tasks;
CREATE POLICY "Service role has full access to tasks" ON tasks
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Create policy for service role on comments
DROP POLICY IF EXISTS "Service role has full access to comments" ON comments;
CREATE POLICY "Service role has full access to comments" ON comments
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Create policy for service role on activity_log
DROP POLICY IF EXISTS "Service role has full access to activity_log" ON activity_log;
CREATE POLICY "Service role has full access to activity_log" ON activity_log
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Create policy for service role on users
DROP POLICY IF EXISTS "Service role has full access to users" ON users;
CREATE POLICY "Service role has full access to users" ON users
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- 5. Allow public read access to teams and pillars (for dropdowns)
DROP POLICY IF EXISTS "Public read access to teams" ON teams;
CREATE POLICY "Public read access to teams" ON teams
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read access to pillars" ON pillars;
CREATE POLICY "Public read access to pillars" ON pillars
  FOR SELECT USING (true);

-- 6. Create updated view with rich fields
DROP VIEW IF EXISTS project_summary;
CREATE OR REPLACE VIEW project_summary AS
SELECT
  p.*,
  pi.name as pillar_name,
  pi.color as pillar_color,
  t.name as owner_team_name,
  t.color as owner_team_color,
  (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as total_tasks,
  (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'completed') as completed_tasks,
  (SELECT COUNT(*) FROM comments WHERE project_id = p.id) as comment_count
FROM projects p
LEFT JOIN pillars pi ON p.pillar_id = pi.id
LEFT JOIN teams t ON p.owner_team_id = t.id
WHERE p.is_archived = false;

-- Done!
SELECT 'Schema fix complete! You can now use ai_potential = none and all rich fields are available.' as status;
