// =============================================================================
// DATABASE TYPES
// Auto-generated types for Supabase tables
// =============================================================================

export type UserRole = 'admin' | 'manager' | 'member' | 'viewer';
export type ProjectStatus = 'idea' | 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
export type ProjectPriority = 'critical' | 'high' | 'medium' | 'low';
export type TaskStatus = 'not_started' | 'in_progress' | 'blocked' | 'in_review' | 'completed' | 'cancelled';
export type TaskPhase = 'discovery' | 'planning' | 'development' | 'testing' | 'training' | 'rollout' | 'monitoring';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type AIPotential = 'none' | 'high' | 'medium' | 'low';

// =============================================================================
// AGENTIFICATION TYPES
// Based on Agent-Native Architecture principles
// =============================================================================

export type AgentRole =
  | 'orchestrator'      // Controls other agents (e.g., Cortex)
  | 'specialist'        // Does one thing well (e.g., Quote Generator)
  | 'data_collector'    // Gathers data for Cortex (e.g., Installer Feedback)
  | 'interface'         // Human-agent interaction (e.g., SDR Portal)
  | 'enabler'           // Enables other agents (e.g., Unified Data Layer)
  | 'not_agent';        // Traditional software

export type AutonomyLevel =
  | 'manual'            // Humans do everything
  | 'assisted'          // AI assists humans
  | 'autonomous'        // AI does most, humans review
  | 'fully_autonomous'; // AI does everything autonomously

export type DataMoatType =
  | 'workflow_patterns'    // How installers work
  | 'customer_insights'    // Customer behavior/preferences
  | 'market_intelligence'  // Pricing, competition
  | 'performance_data'     // What works/doesn't
  | 'relationship_data'    // Connections, history
  | 'none';                // No data moat

export type DefensibilityScore = 1 | 2 | 3 | 4 | 5;

// Vision Alignment
export type VisionAlignment = 'strong' | 'moderate' | 'weak' | 'misaligned';
export type VisionCategory = 'thesis' | 'principle' | 'pillar' | 'imperative' | 'pattern';

// Agentification Profile for Projects
export interface AgentificationProfile {
  // Agent Identity
  can_be_agent: boolean;
  role: AgentRole;
  name: string | null;

  // Atomic Tools (Granularity Principle)
  tools_provided: string[];
  tools_required: string[];

  // Autonomous Outcomes
  autonomous_outcomes: string[];
  autonomy_current: AutonomyLevel;
  autonomy_target: AutonomyLevel;

  // Cortex Connection
  cortex_feeds: string[];
  cortex_consumes: string[];

  // Composability
  delegates_to: string[];
  called_by: string[];
  shares_context_with: string[];

  // Strategic Value
  generates_proprietary_data: boolean;
  data_moat: DataMoatType;
  defensibility_score: DefensibilityScore;

  // Implementation Readiness
  tools_defined: boolean;
  ui_parity_possible: boolean;
}

// =============================================================================
// TABLE TYPES
// =============================================================================

export interface Team {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  team_id: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined
  team?: Team;
}

export interface Pillar {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  icon: string | null;
  order_index: number;
  created_at: string;
}

// Vision Document - Strategic vision knowledge base accessible to agents
export interface VisionDocument {
  id: string;
  slug: string;
  title: string;
  category: VisionCategory;
  content: string;
  summary: string | null;
  order_index: number;
  parent_slug: string | null;
  metadata: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  why_it_matters: string | null;
  pillar_id: string | null;
  category: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  difficulty: DifficultyLevel;
  owner_team_id: string | null;
  created_by: string | null;
  estimated_hours_min: number | null;
  estimated_hours_max: number | null;
  actual_hours: number;
  start_date: string | null;
  target_date: string | null;
  completed_date: string | null;
  progress_percentage: number;
  prototype_url: string | null;
  notion_url: string | null;
  github_url: string | null;
  tags: string[];
  is_archived: boolean;
  created_at: string;
  updated_at: string;

  // =============================================================================
  // RICH FIELDS (COO Dashboard Critical)
  // =============================================================================

  // Human Role fields
  human_role_before: string | null;
  human_role_after: string | null;
  who_is_empowered: string[];
  new_capabilities: string[];

  // Data Requirements
  data_required: string[];
  data_generates: string[];
  data_improves: string[];

  // Operations context
  ops_process: string | null;
  current_loa: string | null;
  potential_loa: string | null;

  // Resources and dependencies
  resources_used: string[];
  api_endpoints: string[];
  prerequisites: string[];
  benefits: string[];
  missing_api_data: string[];
  integrations_needed: string[];

  // Project relationships (as arrays of slugs)
  depends_on: string[];
  enables: string[];
  related_to: string[];

  // Additional metadata
  primary_users: string[];
  data_status: string | null;
  next_milestone: string | null;

  // Problem & Deliverables
  problem_statement: string | null;
  deliverables: string[];

  // Review Assessment Fields (pre-set values that reviewers vote on)
  pain_point_level: string | null;
  adoption_risk: string | null;
  roi_confidence: string | null;
  time_horizon: string | null;
  task_list_quality: string | null;
  strategic_alignment: string | null;
  resource_justified: string | null;
  timeline_realistic: string | null;
  tech_debt_risk: string | null;
  data_readiness: string | null;

  // Demo/Document Link
  demo_link: string | null;

  // AI Predicted Project Flag
  is_predicted: boolean;

  // =============================================================================
  // AGENTIFICATION FIELDS
  // Agent-Native Architecture profile
  // =============================================================================

  // Agent Identity
  agent_can_be_agent: boolean;
  agent_role: AgentRole;
  agent_name: string | null;

  // Atomic Tools (Granularity Principle)
  agent_tools_provided: string[];
  agent_tools_required: string[];

  // Autonomous Outcomes
  agent_autonomous_outcomes: string[];
  agent_autonomy_current: AutonomyLevel;
  agent_autonomy_target: AutonomyLevel;

  // Cortex Connection (The Shared Brain)
  agent_cortex_feeds: string[];
  agent_cortex_consumes: string[];

  // Composability (Agent Relationships)
  agent_delegates_to: string[];
  agent_called_by: string[];
  agent_shares_context_with: string[];

  // Strategic Value (Data Defensibility)
  agent_generates_proprietary_data: boolean;
  agent_data_moat: DataMoatType;
  agent_defensibility_score: DefensibilityScore;

  // Implementation Readiness
  agent_tools_defined: boolean;
  agent_ui_parity_possible: boolean;

  // =============================================================================
  // VISION ALIGNMENT FIELDS
  // Connects project to strategic vision
  // =============================================================================
  vision_alignment: VisionAlignment | null;
  vision_alignment_reason: string | null;

  // Joined
  pillar?: Pillar;
  owner_team?: Team;
  created_by_user?: User;
  tasks?: Task[];
  comments?: Comment[];
  total_tasks?: number;
  completed_tasks?: number;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  phase: TaskPhase;
  status: TaskStatus;
  priority: ProjectPriority; // Added: was missing
  difficulty: DifficultyLevel;
  owner_team_id: string | null;
  assignee_id: string | null;
  created_by: string | null;
  estimated_hours: string | null;
  actual_hours: number | null;
  ai_potential: AIPotential;
  ai_assist_description: string | null;
  tools_needed: string[];
  knowledge_areas: string[];
  acceptance_criteria: string[];
  success_metrics: string[];
  risks: string[];
  blocked_by: string[];
  progress_percentage: number;
  due_date: string | null;
  completed_date: string | null;
  order_index: number;
  is_foundational: boolean;
  is_critical_path: boolean;
  // Problem & Deliverables
  problem_statement: string | null;
  deliverables: string[];

  // Demo/Document Link
  demo_link: string | null;

  // Google Drive Integration
  google_drive_folder_url: string | null;
  google_drive_folder_id: string | null;

  // Agentification - Task-level tool definition
  agent_tool_name: string | null;
  agent_tool_signature: string | null;
  agent_tool_description: string | null;

  created_at: string;
  updated_at: string;
  // Joined
  project?: Project;
  owner_team?: Team;
  assignee?: User;
  created_by_user?: User;
  comments?: Comment[];
}

export interface Comment {
  id: string;
  project_id: string | null;
  task_id: string | null;
  content: string;
  author_id: string;
  parent_comment_id: string | null;
  mentioned_user_ids: string[];
  is_edited: boolean;
  edited_at: string | null;
  created_at: string;
  // Joined
  author?: User;
  replies?: Comment[];
}

export interface ActivityLog {
  id: string;
  project_id: string | null;
  task_id: string | null;
  comment_id: string | null;
  user_id: string | null;
  action: string;
  entity_type: string;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  description: string | null;
  created_at: string;
  // Joined
  user?: User;
  project?: Project;
  task?: Task;
}

export interface ProjectStakeholder {
  id: string;
  project_id: string;
  team_id: string | null;
  user_id: string | null;
  role: string | null;
  created_at: string;
  // Joined
  team?: Team;
  user?: User;
}

export interface TaskStakeholder {
  id: string;
  task_id: string;
  team_id: string | null;
  user_id: string | null;
  created_at: string;
  // Joined
  team?: Team;
  user?: User;
}

export interface ProjectDependency {
  id: string;
  project_id: string;
  depends_on_project_id: string;
  dependency_type: string;
  created_at: string;
  // Joined
  depends_on_project?: Project;
}

export interface TaskDependency {
  id: string;
  task_id: string;
  depends_on_task_id: string;
  created_at: string;
  // Joined
  depends_on_task?: Task;
}

// =============================================================================
// FORM TYPES (for creating/updating)
// =============================================================================

export interface CreateProjectInput {
  title: string;
  slug?: string;
  description?: string;
  why_it_matters?: string;
  pillar_id?: string;
  category?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  difficulty?: DifficultyLevel;
  owner_team_id?: string;
  estimated_hours_min?: number;
  estimated_hours_max?: number;
  start_date?: string;
  target_date?: string;
  prototype_url?: string;
  notion_url?: string;
  github_url?: string;
  tags?: string[];

  // Rich fields for COO Dashboard
  human_role_before?: string;
  human_role_after?: string;
  who_is_empowered?: string[];
  new_capabilities?: string[];
  data_required?: string[];
  data_generates?: string[];
  data_improves?: string[];
  ops_process?: string;
  current_loa?: string;
  potential_loa?: string;
  resources_used?: string[];
  api_endpoints?: string[];
  prerequisites?: string[];
  benefits?: string[];
  missing_api_data?: string[];
  integrations_needed?: string[];
  depends_on?: string[];
  enables?: string[];
  related_to?: string[];
  primary_users?: string[];
  data_status?: string;
  next_milestone?: string;
  problem_statement?: string;
  deliverables?: string[];

  // Review Assessment Fields
  pain_point_level?: string;
  adoption_risk?: string;
  roi_confidence?: string;
  time_horizon?: string;
  task_list_quality?: string;
  strategic_alignment?: string;
  resource_justified?: string;
  timeline_realistic?: string;
  tech_debt_risk?: string;
  data_readiness?: string;

  // Demo/Document Link
  demo_link?: string;

  // AI Predicted Project Flag
  is_predicted?: boolean;

  // Agentification fields
  agent_can_be_agent?: boolean;
  agent_role?: AgentRole;
  agent_name?: string;
  agent_tools_provided?: string[];
  agent_tools_required?: string[];
  agent_autonomous_outcomes?: string[];
  agent_autonomy_current?: AutonomyLevel;
  agent_autonomy_target?: AutonomyLevel;
  agent_cortex_feeds?: string[];
  agent_cortex_consumes?: string[];
  agent_delegates_to?: string[];
  agent_called_by?: string[];
  agent_shares_context_with?: string[];
  agent_generates_proprietary_data?: boolean;
  agent_data_moat?: DataMoatType;
  agent_defensibility_score?: DefensibilityScore;
  agent_tools_defined?: boolean;
  agent_ui_parity_possible?: boolean;

  // Vision alignment
  vision_alignment?: VisionAlignment;
  vision_alignment_reason?: string;
}

export interface UpdateProjectInput extends Partial<CreateProjectInput> {
  id: string;
  progress_percentage?: number;
  actual_hours?: number;
  completed_date?: string;
  is_archived?: boolean;
}

export interface CreateTaskInput {
  project_id: string;
  title: string;
  description?: string;
  phase?: TaskPhase;
  status?: TaskStatus;
  priority?: ProjectPriority; // Added: was missing
  difficulty?: DifficultyLevel;
  owner_team_id?: string;
  assignee_id?: string;
  estimated_hours?: string;
  ai_potential?: AIPotential;
  ai_assist_description?: string;
  tools_needed?: string[];
  knowledge_areas?: string[];
  acceptance_criteria?: string[];
  success_metrics?: string[];
  risks?: string[];
  blocked_by?: string[];
  due_date?: string;
  is_foundational?: boolean;
  is_critical_path?: boolean;
  problem_statement?: string;
  deliverables?: string[];
  demo_link?: string;
  google_drive_folder_url?: string;
  // Agentification - Task-level tool definition
  agent_tool_name?: string;
  agent_tool_signature?: string;
  agent_tool_description?: string;
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  id: string;
  progress_percentage?: number;
  actual_hours?: number;
  completed_date?: string;
}

export interface CreateCommentInput {
  project_id?: string;
  task_id?: string;
  content: string;
  parent_comment_id?: string;
  mentioned_user_ids?: string[];
}

export interface UpdateCommentInput {
  id: string;
  content: string;
}

// =============================================================================
// FILTER/SORT TYPES
// =============================================================================

export interface ProjectFilters {
  status?: ProjectStatus[];
  priority?: ProjectPriority[];
  pillar_id?: string[];
  owner_team_id?: string[];
  search?: string;
  is_archived?: boolean;
}

export interface TaskFilters {
  project_id?: string;
  status?: TaskStatus[];
  phase?: TaskPhase[];
  owner_team_id?: string[];
  assignee_id?: string[];
  search?: string;
}

export type SortDirection = 'asc' | 'desc';

export interface SortOption {
  field: string;
  direction: SortDirection;
}

// =============================================================================
// REVIEW SYSTEM TYPES
// =============================================================================

// Simplified: ReviewerArea kept for backward compatibility but not enforced
export type ReviewerArea = 'management' | 'operations_sales' | 'product_tech';
export type ReviewSessionStatus = 'pending' | 'in_progress' | 'completed';

export interface ProjectReviewSession {
  id: string;
  project_id: string;
  reviewer_id: string;
  reviewer_area?: ReviewerArea | null; // Optional - kept for backward compatibility
  status: ReviewSessionStatus;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  project?: Project;
  reviewer?: User;
  feedback?: ReviewFeedback[];
}

export interface ReviewFeedback {
  id: string;
  review_session_id: string;
  field_name: string;
  current_value: string | null;
  proposed_value: string | null;
  comment: string | null;
  created_at: string;
}

export interface ReviewComment {
  id: string;
  review_session_id: string;
  project_id: string;
  task_id: string | null;
  content: string;
  created_at: string;
  // Joined
  reviewer?: User;
  task?: Task;
}

export interface ProjectReviewStatus {
  id: string;
  project_id: string;
  review_count: number; // Simplified: just count total reviews (need 3)
  all_reviewed: boolean; // True when review_count >= 3
  alignment_score: number | null;
  created_at: string;
  updated_at: string;
  // Backward compat - kept but deprecated
  management_reviewed?: boolean;
  operations_sales_reviewed?: boolean;
  product_tech_reviewed?: boolean;
}

// Review Input Types
export interface CreateReviewSessionInput {
  project_id: string;
  reviewer_id: string;
}

export interface CreateReviewFeedbackInput {
  review_session_id: string;
  field_name: string;
  current_value?: string;
  proposed_value?: string;
  comment?: string;
}

export interface CreateReviewCommentInput {
  review_session_id: string;
  project_id: string;
  task_id?: string;
  content: string;
}
