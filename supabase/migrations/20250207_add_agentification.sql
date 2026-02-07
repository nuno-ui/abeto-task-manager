-- =============================================================================
-- AGENTIFICATION MIGRATION
-- Adds agent-native architecture fields to projects and tasks
-- Based on Agent-Native Architecture principles (Parity, Granularity, Composability)
-- =============================================================================

-- =============================================================================
-- NEW ENUMS FOR AGENTIFICATION
-- =============================================================================

-- Agent Role Type
CREATE TYPE agent_role AS ENUM (
  'orchestrator',      -- Controls other agents (e.g., Cortex)
  'specialist',        -- Does one thing well (e.g., Quote Generator)
  'data_collector',    -- Gathers data for Cortex (e.g., Installer Feedback)
  'interface',         -- Human-agent interaction (e.g., SDR Portal)
  'enabler',           -- Enables other agents (e.g., Unified Data Layer)
  'not_agent'          -- Traditional software
);

-- Autonomy Level
CREATE TYPE autonomy_level AS ENUM (
  'manual',            -- Humans do everything
  'assisted',          -- AI assists humans
  'autonomous',        -- AI does most, humans review
  'fully_autonomous'   -- AI does everything autonomously
);

-- Data Moat Type
CREATE TYPE data_moat_type AS ENUM (
  'workflow_patterns',    -- How installers work
  'customer_insights',    -- Customer behavior/preferences
  'market_intelligence',  -- Pricing, competition
  'performance_data',     -- What works/doesn't
  'relationship_data',    -- Connections, history
  'none'                  -- No data moat
);

-- =============================================================================
-- ADD AGENTIFICATION COLUMNS TO PROJECTS TABLE
-- =============================================================================

-- Section 1: Agent Identity
ALTER TABLE projects ADD COLUMN IF NOT EXISTS agent_can_be_agent BOOLEAN DEFAULT false;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS agent_role agent_role DEFAULT 'not_agent';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS agent_name VARCHAR(100);

-- Section 2: Atomic Tools (Granularity Principle)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS agent_tools_provided TEXT[] DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS agent_tools_required TEXT[] DEFAULT '{}';

-- Section 3: Autonomous Outcomes
ALTER TABLE projects ADD COLUMN IF NOT EXISTS agent_autonomous_outcomes TEXT[] DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS agent_autonomy_current autonomy_level DEFAULT 'manual';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS agent_autonomy_target autonomy_level DEFAULT 'autonomous';

-- Section 4: Cortex Connection (The Shared Brain)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS agent_cortex_feeds TEXT[] DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS agent_cortex_consumes TEXT[] DEFAULT '{}';

-- Section 5: Composability (Agent Relationships)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS agent_delegates_to TEXT[] DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS agent_called_by TEXT[] DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS agent_shares_context_with TEXT[] DEFAULT '{}';

-- Section 6: Strategic Value (Data Defensibility)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS agent_generates_proprietary_data BOOLEAN DEFAULT false;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS agent_data_moat data_moat_type DEFAULT 'none';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS agent_defensibility_score INTEGER DEFAULT 1
  CHECK (agent_defensibility_score >= 1 AND agent_defensibility_score <= 5);

-- Section 7: Implementation Readiness
ALTER TABLE projects ADD COLUMN IF NOT EXISTS agent_tools_defined BOOLEAN DEFAULT false;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS agent_ui_parity_possible BOOLEAN DEFAULT false;

-- =============================================================================
-- ADD AGENTIFICATION COLUMNS TO TASKS TABLE
-- =============================================================================

-- Task-level agent tool definition
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS agent_tool_name VARCHAR(100);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS agent_tool_signature TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS agent_tool_description TEXT;

-- =============================================================================
-- CREATE INDEXES FOR AGENTIFICATION QUERIES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_projects_agent_role ON projects(agent_role);
CREATE INDEX IF NOT EXISTS idx_projects_agent_defensibility ON projects(agent_defensibility_score);
CREATE INDEX IF NOT EXISTS idx_projects_agent_can_be_agent ON projects(agent_can_be_agent);

-- =============================================================================
-- UPDATE PROJECT_SUMMARY VIEW TO INCLUDE AGENTIFICATION
-- =============================================================================

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

-- =============================================================================
-- COMMENTS
-- =============================================================================
-- This migration adds the following agentification fields to support the
-- agent-native architecture vision:
--
-- Projects:
-- - agent_can_be_agent: Whether this project can be turned into an agent
-- - agent_role: orchestrator, specialist, data_collector, interface, enabler, not_agent
-- - agent_name: Human-friendly name for the agent (e.g., "Lead Scorer Agent")
-- - agent_tools_provided: Array of tools this agent provides to others
-- - agent_tools_required: Array of tools this agent needs from others
-- - agent_autonomous_outcomes: What outcomes can this achieve autonomously?
-- - agent_autonomy_current: Current level of autonomy
-- - agent_autonomy_target: Target level of autonomy
-- - agent_cortex_feeds: What data this feeds TO the Cortex
-- - agent_cortex_consumes: What intelligence this gets FROM the Cortex
-- - agent_delegates_to: Other agents this can call
-- - agent_called_by: Other agents that can call this
-- - agent_shares_context_with: Agents it shares memory/context with
-- - agent_generates_proprietary_data: Does this create unique data?
-- - agent_data_moat: Type of data moat it builds
-- - agent_defensibility_score: 1-5 strategic value score
-- - agent_tools_defined: Have atomic tools been defined?
-- - agent_ui_parity_possible: Can agent achieve UI parity?
--
-- Tasks:
-- - agent_tool_name: If this task creates a tool, what's it called?
-- - agent_tool_signature: Function signature (e.g., "score_lead(lead_id) → score")
-- - agent_tool_description: What the tool does
