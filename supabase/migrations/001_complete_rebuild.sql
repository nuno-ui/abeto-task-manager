-- =============================================================================
-- ABETO COMPLETE DATABASE REBUILD
-- Run this in Supabase SQL Editor to fix ALL issues
-- =============================================================================

-- ============================================================================
-- STEP 1: FIX ENUMS
-- ============================================================================

-- Add 'none' to ai_potential enum (CRITICAL FIX)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'none' AND enumtypid = 'ai_potential'::regtype) THEN
        ALTER TYPE ai_potential ADD VALUE 'none';
    END IF;
END $$;

-- Add 'in_review' to task_status if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'in_review' AND enumtypid = 'task_status'::regtype) THEN
        ALTER TYPE task_status ADD VALUE 'in_review';
    END IF;
END $$;

-- ============================================================================
-- STEP 2: ADD ALL RICH FIELDS TO PROJECTS
-- ============================================================================

-- Human Role fields (COO Dashboard critical)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS human_role_before TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS human_role_after TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS who_is_empowered TEXT[] DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS new_capabilities TEXT[] DEFAULT '{}';

-- Data Requirements (COO Dashboard critical)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS data_required TEXT[] DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS data_generates TEXT[] DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS data_improves TEXT[] DEFAULT '{}';

-- Operations context
ALTER TABLE projects ADD COLUMN IF NOT EXISTS ops_process TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS current_loa TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS potential_loa TEXT;

-- Resources and dependencies
ALTER TABLE projects ADD COLUMN IF NOT EXISTS resources_used TEXT[] DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS api_endpoints TEXT[] DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS prerequisites TEXT[] DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS benefits TEXT[] DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS missing_api_data TEXT[] DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS integrations_needed TEXT[] DEFAULT '{}';

-- Project relationships (as arrays of slugs)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS depends_on TEXT[] DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS enables TEXT[] DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS related_to TEXT[] DEFAULT '{}';

-- Additional metadata
ALTER TABLE projects ADD COLUMN IF NOT EXISTS primary_users TEXT[] DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS data_status TEXT DEFAULT 'None';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS next_milestone TEXT;

-- ============================================================================
-- STEP 3: ADD PRIORITY TO TASKS (was missing!)
-- ============================================================================

-- First check if it exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'tasks' AND column_name = 'priority') THEN
        ALTER TABLE tasks ADD COLUMN priority project_priority DEFAULT 'medium';
    END IF;
END $$;

-- ============================================================================
-- STEP 4: FIX RLS POLICIES FOR SERVICE ROLE
-- ============================================================================

-- Drop existing service role policies if they exist
DROP POLICY IF EXISTS "Service role has full access to projects" ON projects;
DROP POLICY IF EXISTS "Service role has full access to tasks" ON tasks;
DROP POLICY IF EXISTS "Service role has full access to comments" ON comments;
DROP POLICY IF EXISTS "Service role has full access to activity_log" ON activity_log;
DROP POLICY IF EXISTS "Service role has full access to users" ON users;

-- Create permissive policies for service role (using auth.role() which works with service key)
CREATE POLICY "Service role bypass for projects" ON projects
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role bypass for tasks" ON tasks
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role bypass for comments" ON comments
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role bypass for activity_log" ON activity_log
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Also allow anon for teams/pillars (needed for dropdowns without auth)
DROP POLICY IF EXISTS "Anon can read teams" ON teams;
DROP POLICY IF EXISTS "Anon can read pillars" ON pillars;

CREATE POLICY "Anon can read teams" ON teams FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can read pillars" ON pillars FOR SELECT TO anon USING (true);

-- ============================================================================
-- STEP 5: CREATE HELPER VIEWS
-- ============================================================================

-- Drop and recreate project summary view with all fields
DROP VIEW IF EXISTS project_summary;
CREATE VIEW project_summary AS
SELECT
  p.*,
  pi.name as pillar_name,
  pi.color as pillar_color,
  pi.slug as pillar_slug,
  t.name as owner_team_name,
  t.color as owner_team_color,
  (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as total_tasks,
  (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'completed') as completed_tasks,
  (SELECT COUNT(*) FROM comments WHERE project_id = p.id) as comment_count
FROM projects p
LEFT JOIN pillars pi ON p.pillar_id = pi.id
LEFT JOIN teams t ON p.owner_team_id = t.id
WHERE p.is_archived = false;

-- ============================================================================
-- STEP 6: VERIFY DEFAULT DATA EXISTS
-- ============================================================================

-- Ensure teams exist
INSERT INTO teams (name, slug, color) VALUES
  ('Operations', 'operations', '#22c55e'),
  ('Technology', 'technology', '#3b82f6'),
  ('Sales', 'sales', '#f97316'),
  ('Marketing', 'marketing', '#a855f7'),
  ('Finance', 'finance', '#eab308'),
  ('Product', 'product', '#06b6d4'),
  ('Legal', 'legal', '#6366f1')
ON CONFLICT (slug) DO NOTHING;

-- Ensure pillars exist
INSERT INTO pillars (name, slug, description, color, icon, order_index) VALUES
  ('Data Foundation', 'data-foundation', 'Core data infrastructure and API layer', '#22c55e', 'database', 1),
  ('Knowledge Generation', 'knowledge-generation', 'AI, analytics, and insights', '#3b82f6', 'brain', 2),
  ('Human Empowerment', 'human-empowerment', 'Tools that make teams more effective', '#a855f7', 'users', 3)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- DONE!
-- ============================================================================

SELECT 'Database rebuild complete!' as status,
       (SELECT COUNT(*) FROM teams) as teams_count,
       (SELECT COUNT(*) FROM pillars) as pillars_count,
       (SELECT COUNT(*) FROM projects) as projects_count,
       (SELECT COUNT(*) FROM tasks) as tasks_count;
