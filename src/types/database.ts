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

export type ReviewerArea = 'management' | 'operations_sales' | 'product_tech';
export type ReviewSessionStatus = 'pending' | 'in_progress' | 'completed';

export interface ProjectReviewSession {
  id: string;
  project_id: string;
  reviewer_id: string;
  reviewer_area: ReviewerArea;
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
  is_area_specific: boolean;
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
  management_reviewed: boolean;
  operations_sales_reviewed: boolean;
  product_tech_reviewed: boolean;
  all_reviewed: boolean;
  alignment_score: number | null;
  created_at: string;
  updated_at: string;
}

// Review Input Types
export interface CreateReviewSessionInput {
  project_id: string;
  reviewer_id: string;
  reviewer_area: ReviewerArea;
}

export interface CreateReviewFeedbackInput {
  review_session_id: string;
  field_name: string;
  current_value?: string;
  proposed_value?: string;
  comment?: string;
  is_area_specific?: boolean;
}

export interface CreateReviewCommentInput {
  review_session_id: string;
  project_id: string;
  task_id?: string;
  content: string;
}
