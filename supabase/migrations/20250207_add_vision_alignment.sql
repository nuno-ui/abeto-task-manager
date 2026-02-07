-- =============================================================================
-- VISION ALIGNMENT FIELDS
-- Connects projects to the strategic vision for agent/companion accessibility
-- =============================================================================

-- Add vision alignment fields to projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS vision_alignment TEXT CHECK (vision_alignment IN ('strong', 'moderate', 'weak', 'misaligned'));
ALTER TABLE projects ADD COLUMN IF NOT EXISTS vision_alignment_reason TEXT;

-- =============================================================================
-- VISION DOCUMENTS TABLE
-- Stores the strategic vision as structured data accessible to agents
-- =============================================================================

CREATE TABLE IF NOT EXISTS vision_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL, -- 'thesis', 'principle', 'pillar', 'imperative', 'pattern'
  content TEXT NOT NULL,
  summary TEXT, -- Short version for quick agent access
  order_index INTEGER DEFAULT 0,
  parent_slug TEXT REFERENCES vision_documents(slug),
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE vision_documents ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read vision documents
CREATE POLICY "Users can read vision documents"
  ON vision_documents FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can modify vision documents
CREATE POLICY "Admins can modify vision documents"
  ON vision_documents FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- =============================================================================
-- SEED VISION CONTENT
-- The strategic vision knowledge base
-- =============================================================================

-- Clear existing data
DELETE FROM vision_documents;

-- THE CORE THESIS
INSERT INTO vision_documents (slug, title, category, content, summary, order_index) VALUES
(
  'core-thesis',
  'The Thin Middle Squeeze',
  'thesis',
  'SaaS isn''t dead. The easy SaaS moat is dead. The value is moving — from companies that captured value by being the middleman, to companies that capture value through execution, data, and infrastructure.

Value is getting sucked upward into the agent layer (AI that executes workflows autonomously) and downward into the data layer (proprietary data that agents need to act on). Everything in the thin middle — traditional UI/SaaS dashboards — gets crushed.

The strategic response: Move up into the agent layer AND down into the data layer simultaneously. Build agents that do real work, collect proprietary data through those agents, and make the data moat defensible.',
  'Value moves to agent layer (execution) and data layer (proprietary data). The UI/SaaS "thin middle" gets crushed.',
  1
),
(
  'strategic-imperative',
  'Strategic Imperative',
  'thesis',
  'We need to get access to the disparate data across SME installers as fast as we can to build the Cortex and enhance defensibility of our business.

The value is that we understand intimately the solar installer processes and workflows — so we can build better agents. Pricing should just enable us to cover costs and build the Cortex as fast as possible.

Key insight: Every interaction with installers is an opportunity to collect proprietary data about how solar installation businesses actually work. This data feeds Cortex, which makes our agents better, which provides more value to installers, which gives us more data. The flywheel.',
  'Get access to SME installer data fast to build Cortex. Pricing covers costs; data is the real value.',
  2
);

-- THE THREE PILLARS
INSERT INTO vision_documents (slug, title, category, content, summary, order_index, metadata) VALUES
(
  'pillar-data-foundation',
  'Data Foundation',
  'pillar',
  'Building Now: Reliable APIs, unified data layer, quality monitoring.

Why: Every AI feature, every dashboard, every automation depends on this. No foundation = no building.

Example: Without knowing which installer is available and their performance history, we can''t route leads intelligently.

Key Projects: Unified Data Layer, API Health Monitoring, Data Quality Monitor

Success Criteria:
- All data sources have reliable API access
- Single source of truth for business data
- Real-time quality monitoring and alerts',
  'Core data infrastructure and API layer. No foundation = no building.',
  3,
  '{"color": "#10b981", "icon": "database"}'
),
(
  'pillar-knowledge-generation',
  'Knowledge Generation',
  'pillar',
  'Next Phase: Tools that CREATE data while doing their job.

Why: The more leads we generate, the more data we have, the smarter our systems become. Growth feeds intelligence.

Example: SDR Portal captures call outcomes → AI learns which questions close deals → Future calls improve.

Key Projects: AI Cortex, SDR Portal, Campaign OS, Reporting Hub

Success Criteria:
- Every tool generates learning data
- Patterns emerge from usage
- Systems improve without code changes',
  'AI, analytics, and insights. Tools that create data while doing their job.',
  4,
  '{"color": "#8b5cf6", "icon": "brain"}'
),
(
  'pillar-human-empowerment',
  'Human Empowerment',
  'pillar',
  'The Goal: AI copilots that amplify human capability.

Why: SDRs focus on relationships, not data entry. Managers see trends, not spreadsheets. Humans do what humans do best.

Example: Cortex summarizes 10 WhatsApp messages into 2-line context before the call. SDR walks in prepared.

Key Projects: SDR Portal, Installer Portal, AI Voice Agent, Omnichannel Chatbot

Success Criteria:
- Humans handle relationships, AI handles repetition
- 3x productivity without burnout
- Informed decisions, not guesswork',
  'AI copilots that amplify human capability. Humans do relationships, AI does repetition.',
  5,
  '{"color": "#f59e0b", "icon": "users"}'
);

-- AGENT-NATIVE PRINCIPLES
INSERT INTO vision_documents (slug, title, category, content, summary, order_index, parent_slug) VALUES
(
  'principle-parity',
  'Parity',
  'principle',
  'Whatever the user can do through the UI, the agent should be able to achieve through tools.

This is the foundational principle. Without it, nothing else matters. Ensure the agent has tools that can accomplish anything the UI can do.

The test: Pick any UI action. Can the agent accomplish it?

Implementation: For every UI capability added, ask: Can the agent achieve this outcome? If not, add the necessary tools or primitives.',
  'Agents must accomplish whatever users can do through the interface.',
  10,
  NULL
),
(
  'principle-granularity',
  'Granularity',
  'principle',
  'Tools should be atomic primitives. Features are outcomes achieved by an agent operating in a loop.

A tool is a primitive capability. A feature is an outcome described in a prompt, achieved by an agent with tools, operating in a loop until the outcome is reached.

The agent makes the decisions; prompts describe the outcome. Keep tools simple and composable.

The test: To change behavior, do you edit prompts or refactor code?

Less granular (wrong): classify_and_organize_files(files) — you wrote the decision logic
More granular (right): read_file, write_file, move_file + prompt — agent makes the decisions',
  'Tools are atomic primitives. Features are outcomes achieved by agents in a loop.',
  11,
  NULL
),
(
  'principle-composability',
  'Composability',
  'principle',
  'With atomic tools and parity, you can create new features just by writing new prompts.

Want a "weekly review" feature? That''s just a prompt: "Review files modified this week. Summarize key changes. Based on incomplete items and approaching deadlines, suggest three priorities for next week."

The agent uses list_files, read_file, and its judgment. You described an outcome; the agent loops until it''s achieved.

This works for developers and users. You can ship new features by adding prompts. Users can customize behavior by modifying prompts or creating their own.',
  'New features emerge by writing new prompts, not shipping code.',
  12,
  NULL
),
(
  'principle-emergence',
  'Emergent Capability',
  'principle',
  'The agent can accomplish things you didn''t explicitly design for.

The flywheel:
1. Build with atomic tools and parity
2. Users ask for things you didn''t anticipate
3. Agent composes tools to accomplish them (or fails, revealing a gap)
4. You observe patterns in what''s being requested
5. Add domain tools or prompts to make common patterns efficient
6. Repeat

This changes how you build products. You''re not trying to imagine every feature upfront. You''re creating a capable foundation and learning from what emerges.

Example: "Cross-reference my meeting notes with my task list and tell me what I''ve committed to but haven''t scheduled." You didn''t build a commitment tracker, but if the agent can read notes and tasks, it can accomplish this.',
  'Agents accomplish unanticipated tasks by combining tools creatively.',
  13,
  NULL
),
(
  'principle-improvement',
  'Continuous Improvement',
  'principle',
  'Agent-native applications get better through accumulated context and prompt refinement.

Unlike traditional software, agent-native applications can improve without shipping code.

Accumulated context: State persists across sessions via context files
Developer-level refinement: Ship updated prompts for all users
User-level customization: Users modify prompts for their workflow

The system learns and adapts through use. Every interaction makes it smarter.',
  'Applications improve through accumulated context and refined prompts.',
  14,
  NULL
);

-- IMPLEMENTATION PATTERNS
INSERT INTO vision_documents (slug, title, category, content, summary, order_index, parent_slug) VALUES
(
  'pattern-shared-workspace',
  'Shared Workspace',
  'pattern',
  'Agents and users should work in the same data space, not separate sandboxes.

Benefits:
- Users can inspect and modify agent work
- Agents can build on what users create
- No synchronization layer needed
- Complete transparency

This should be the default. Sandbox only when there''s a specific need (security, preventing corruption of critical data).',
  'Agents and users work in the same data space. Transparency enables collaboration.',
  20,
  NULL
),
(
  'pattern-context-management',
  'Context Management',
  'pattern',
  'The agent needs to know what it''s working with. System prompts should include:

Available resources: What data exists and where
Capabilities: What tools are available
Recent activity: What happened recently

For long sessions, provide a way to refresh context so the agent stays current.

The context.md pattern: A file the agent reads at session start and updates as state changes — portable working memory without code changes.',
  'Maintain persistent state through context files that agents read and update.',
  21,
  NULL
),
(
  'pattern-atomic-tools',
  'Atomic Tools',
  'pattern',
  'Tools are simple primitives. The agent decides how to combine them to achieve outcomes.

Start with pure primitives: bash, file operations, basic storage. This proves the architecture works and reveals what the agent actually needs.

As patterns emerge, add domain-specific tools deliberately:
- Vocabulary: A create_note tool teaches the agent what "note" means
- Guardrails: Some operations need validation that shouldn''t be left to agent judgment
- Efficiency: Common operations can be bundled for speed and cost

Keep primitives available. Domain tools are shortcuts, not gates.',
  'Tools are simple primitives. Agent decides how to combine them.',
  22,
  NULL
),
(
  'pattern-explicit-completion',
  'Explicit Completion',
  'pattern',
  'Agents need an explicit way to say "I''m done." Don''t detect completion through heuristics.

Completion is separate from success/failure: A tool can succeed and stop the loop, or fail and signal continue for recovery.

What''s not yet standard: Richer control flow signals like pause (needs user input), escalate (needs human decision), retry (transient failure).

Silent agents feel broken. Visible progress builds trust.',
  'Agents must declare "I''m done" rather than relying on heuristic detection.',
  23,
  NULL
);

-- VALUE SHIFTS
INSERT INTO vision_documents (slug, title, category, content, summary, order_index) VALUES
(
  'value-shift-pricing',
  'From Per-Seat to Outcome-Based Pricing',
  'imperative',
  'Old model: $X per user per month
New model: $Y per contract reviewed, $Z per ticket resolved

The shift: You''re not selling access to a tool. You''re selling completed work. Pricing aligns with value delivered.',
  '$5 per contract reviewed, $2 per ticket resolved — not per-seat.',
  30
),
(
  'value-shift-execution',
  'From UI to Execution as Product',
  'imperative',
  'Old model: Show a dashboard with data
New model: Do the work, show results

Don''t show a dashboard — do the work. The product is outcomes achieved, not screens to look at.',
  'Don''t show a dashboard — do the work.',
  31
),
(
  'value-shift-features',
  'From Roadmaps to Emergent Capabilities',
  'imperative',
  'Old model: Plan features, build features, ship features
New model: Build capable foundation, observe what users ask for, formalize patterns

Discover what users need through agent behavior. Features emerge from usage, not prediction.',
  'Discover what users need through agent behavior, not roadmaps.',
  32
),
(
  'value-shift-moat',
  'From Switching Costs to Data Ownership',
  'imperative',
  'Old model: Lock users in with integrations and workflows
New model: Accumulate proprietary data that improves the system

The moat is the data, not the interface. Data compounds; UI doesn''t.',
  'The moat is the data, not the interface.',
  33
),
(
  'value-shift-scale',
  'From Headcount to Agent Efficiency',
  'imperative',
  'Old model: Growth = more employees
New model: 10 agents do the work of 100 employees

Agents scale without linear cost increase. Human effort is reserved for what humans do best.',
  '10 agents do the work of 100 employees.',
  34
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_vision_documents_category ON vision_documents(category);
CREATE INDEX IF NOT EXISTS idx_vision_documents_parent ON vision_documents(parent_slug);
CREATE INDEX IF NOT EXISTS idx_vision_documents_active ON vision_documents(is_active);
CREATE INDEX IF NOT EXISTS idx_projects_vision_alignment ON projects(vision_alignment);
