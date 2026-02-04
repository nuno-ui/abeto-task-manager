-- =============================================================================
-- ABETO TASK MANAGER - DATABASE SCHEMA
-- A comprehensive task management system for Operations teams
-- =============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- ENUMS
-- =============================================================================

CREATE TYPE user_role AS ENUM ('admin', 'manager', 'member', 'viewer');
CREATE TYPE project_status AS ENUM ('idea', 'planning', 'in_progress', 'on_hold', 'completed', 'cancelled');
CREATE TYPE project_priority AS ENUM ('critical', 'high', 'medium', 'low');
CREATE TYPE task_status AS ENUM ('not_started', 'in_progress', 'blocked', 'in_review', 'completed', 'cancelled');
CREATE TYPE task_phase AS ENUM ('discovery', 'planning', 'development', 'testing', 'training', 'rollout', 'monitoring');
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE ai_potential AS ENUM ('high', 'medium', 'low');

-- =============================================================================
-- TEAMS TABLE
-- =============================================================================

CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3b82f6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default teams
INSERT INTO teams (name, slug, color) VALUES
  ('Operations', 'operations', '#22c55e'),
  ('Technology', 'technology', '#3b82f6'),
  ('Sales', 'sales', '#f97316'),
  ('Marketing', 'marketing', '#a855f7'),
  ('Finance', 'finance', '#eab308'),
  ('Product', 'product', '#06b6d4'),
  ('Legal', 'legal', '#6366f1');

-- =============================================================================
-- USERS TABLE (extends Supabase auth.users)
-- =============================================================================

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  role user_role DEFAULT 'member',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- PILLARS TABLE (Project categorization)
-- =============================================================================

CREATE TABLE pillars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3b82f6',
  icon VARCHAR(50),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default pillars
INSERT INTO pillars (name, slug, description, color, icon, order_index) VALUES
  ('Data Foundation', 'data-foundation', 'Core data infrastructure and API layer', '#22c55e', 'database', 1),
  ('Knowledge Generation', 'knowledge-generation', 'AI, analytics, and insights', '#3b82f6', 'brain', 2),
  ('Human Empowerment', 'human-empowerment', 'Tools that make teams more effective', '#a855f7', 'users', 3);

-- =============================================================================
-- PROJECTS TABLE
-- =============================================================================

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Basic Info
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  why_it_matters TEXT,

  -- Classification
  pillar_id UUID REFERENCES pillars(id) ON DELETE SET NULL,
  category VARCHAR(100),
  status project_status DEFAULT 'idea',
  priority project_priority DEFAULT 'medium',
  difficulty difficulty_level DEFAULT 'medium',

  -- Ownership
  owner_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Estimates
  estimated_hours_min INTEGER,
  estimated_hours_max INTEGER,
  actual_hours INTEGER DEFAULT 0,

  -- Dates
  start_date DATE,
  target_date DATE,
  completed_date DATE,

  -- Progress
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),

  -- Links
  prototype_url TEXT,
  notion_url TEXT,
  github_url TEXT,

  -- Metadata
  tags TEXT[] DEFAULT '{}',
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- PROJECT DEPENDENCIES (for tracking project relationships)
-- =============================================================================

CREATE TABLE project_dependencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  depends_on_project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  dependency_type VARCHAR(50) DEFAULT 'blocks', -- blocks, enables, relates_to
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, depends_on_project_id)
);

-- =============================================================================
-- TASKS (Sub-tasks within projects)
-- =============================================================================

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- Basic Info
  title VARCHAR(255) NOT NULL,
  description TEXT,

  -- Classification
  phase task_phase DEFAULT 'planning',
  status task_status DEFAULT 'not_started',
  difficulty difficulty_level DEFAULT 'medium',

  -- Ownership
  owner_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Estimates
  estimated_hours VARCHAR(20), -- e.g., "8-12h"
  actual_hours DECIMAL(10, 2),

  -- AI Assessment
  ai_potential ai_potential DEFAULT 'medium',
  ai_assist_description TEXT,

  -- Requirements
  tools_needed TEXT[] DEFAULT '{}',
  knowledge_areas TEXT[] DEFAULT '{}',
  acceptance_criteria TEXT[] DEFAULT '{}',
  success_metrics TEXT[] DEFAULT '{}',
  risks TEXT[] DEFAULT '{}',

  -- Dependencies
  blocked_by TEXT[] DEFAULT '{}',

  -- Progress
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),

  -- Dates
  due_date DATE,
  completed_date DATE,

  -- Ordering
  order_index INTEGER DEFAULT 0,

  -- Flags
  is_foundational BOOLEAN DEFAULT false,
  is_critical_path BOOLEAN DEFAULT false,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- TASK DEPENDENCIES
-- =============================================================================

CREATE TABLE task_dependencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  depends_on_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(task_id, depends_on_task_id)
);

-- =============================================================================
-- SHARED TASKS (Tasks shared across multiple projects)
-- =============================================================================

CREATE TABLE shared_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(task_id, project_id)
);

-- =============================================================================
-- COMMENTS (on projects and tasks)
-- =============================================================================

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Polymorphic relation
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,

  -- Content
  content TEXT NOT NULL,

  -- Author
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Threading
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,

  -- Mentions
  mentioned_user_ids UUID[] DEFAULT '{}',

  -- Metadata
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure comment belongs to either project or task
  CONSTRAINT comment_belongs_to_one CHECK (
    (project_id IS NOT NULL AND task_id IS NULL) OR
    (project_id IS NULL AND task_id IS NOT NULL)
  )
);

-- =============================================================================
-- ACTIVITY LOG (Audit trail)
-- =============================================================================

CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- What was affected
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,

  -- Who did it
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- What happened
  action VARCHAR(50) NOT NULL, -- created, updated, deleted, status_changed, assigned, commented
  entity_type VARCHAR(50) NOT NULL, -- project, task, comment

  -- Change details
  old_value JSONB,
  new_value JSONB,
  description TEXT,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- STAKEHOLDERS (Who is involved in a project)
-- =============================================================================

CREATE TABLE project_stakeholders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(100), -- e.g., "Lead", "Contributor", "Reviewer"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT stakeholder_is_team_or_user CHECK (
    (team_id IS NOT NULL AND user_id IS NULL) OR
    (team_id IS NULL AND user_id IS NOT NULL)
  )
);

-- =============================================================================
-- TASK STAKEHOLDERS
-- =============================================================================

CREATE TABLE task_stakeholders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT task_stakeholder_is_team_or_user CHECK (
    (team_id IS NOT NULL AND user_id IS NULL) OR
    (team_id IS NULL AND user_id IS NOT NULL)
  )
);

-- =============================================================================
-- VIEWS
-- =============================================================================

-- Project summary view with task counts
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

-- Task summary view
CREATE OR REPLACE VIEW task_summary AS
SELECT
  t.*,
  p.title as project_title,
  p.slug as project_slug,
  tm.name as owner_team_name,
  tm.color as owner_team_color,
  u.full_name as assignee_name,
  u.avatar_url as assignee_avatar,
  (SELECT COUNT(*) FROM comments WHERE task_id = t.id) as comment_count
FROM tasks t
LEFT JOIN projects p ON t.project_id = p.id
LEFT JOIN teams tm ON t.owner_team_id = tm.id
LEFT JOIN users u ON t.assignee_id = u.id;

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_priority ON projects(priority);
CREATE INDEX idx_projects_pillar ON projects(pillar_id);
CREATE INDEX idx_projects_owner_team ON projects(owner_team_id);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);

CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_phase ON tasks(phase);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_tasks_owner_team ON tasks(owner_team_id);

CREATE INDEX idx_comments_project ON comments(project_id);
CREATE INDEX idx_comments_task ON comments(task_id);
CREATE INDEX idx_comments_author ON comments(author_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

CREATE INDEX idx_activity_project ON activity_log(project_id);
CREATE INDEX idx_activity_task ON activity_log(task_id);
CREATE INDEX idx_activity_user ON activity_log(user_id);
CREATE INDEX idx_activity_created_at ON activity_log(created_at DESC);

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Calculate project progress based on tasks
CREATE OR REPLACE FUNCTION calculate_project_progress(project_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  total_tasks INTEGER;
  completed_tasks INTEGER;
BEGIN
  SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'completed')
  INTO total_tasks, completed_tasks
  FROM tasks
  WHERE project_id = project_uuid;

  IF total_tasks = 0 THEN
    RETURN 0;
  END IF;

  RETURN ROUND((completed_tasks::DECIMAL / total_tasks::DECIMAL) * 100);
END;
$$ LANGUAGE plpgsql;

-- Log activity
CREATE OR REPLACE FUNCTION log_activity(
  p_project_id UUID,
  p_task_id UUID,
  p_user_id UUID,
  p_action VARCHAR,
  p_entity_type VARCHAR,
  p_old_value JSONB,
  p_new_value JSONB,
  p_description TEXT
)
RETURNS UUID AS $$
DECLARE
  activity_id UUID;
BEGIN
  INSERT INTO activity_log (project_id, task_id, user_id, action, entity_type, old_value, new_value, description)
  VALUES (p_project_id, p_task_id, p_user_id, p_action, p_entity_type, p_old_value, p_new_value, p_description)
  RETURNING id INTO activity_id;

  RETURN activity_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TRIGGERS
-- =============================================================================

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE pillars ENABLE ROW LEVEL SECURITY;

-- Everyone can view teams and pillars
CREATE POLICY "Teams are viewable by everyone" ON teams FOR SELECT USING (true);
CREATE POLICY "Pillars are viewable by everyone" ON pillars FOR SELECT USING (true);

-- Users can view all users
CREATE POLICY "Users are viewable by authenticated users" ON users FOR SELECT USING (auth.role() = 'authenticated');

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Projects are viewable by all authenticated users
CREATE POLICY "Projects are viewable by authenticated users" ON projects FOR SELECT USING (auth.role() = 'authenticated');

-- Projects can be created by authenticated users
CREATE POLICY "Projects can be created by authenticated users" ON projects FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Projects can be updated by authenticated users
CREATE POLICY "Projects can be updated by authenticated users" ON projects FOR UPDATE USING (auth.role() = 'authenticated');

-- Tasks are viewable by authenticated users
CREATE POLICY "Tasks are viewable by authenticated users" ON tasks FOR SELECT USING (auth.role() = 'authenticated');

-- Tasks can be created by authenticated users
CREATE POLICY "Tasks can be created by authenticated users" ON tasks FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Tasks can be updated by authenticated users
CREATE POLICY "Tasks can be updated by authenticated users" ON tasks FOR UPDATE USING (auth.role() = 'authenticated');

-- Comments are viewable by authenticated users
CREATE POLICY "Comments are viewable by authenticated users" ON comments FOR SELECT USING (auth.role() = 'authenticated');

-- Comments can be created by authenticated users
CREATE POLICY "Comments can be created by authenticated users" ON comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Users can update their own comments
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE USING (auth.uid() = author_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = author_id);

-- Activity log is viewable by authenticated users
CREATE POLICY "Activity log is viewable by authenticated users" ON activity_log FOR SELECT USING (auth.role() = 'authenticated');

-- Activity log can be created by authenticated users
CREATE POLICY "Activity log can be created by authenticated users" ON activity_log FOR INSERT WITH CHECK (auth.role() = 'authenticated');
