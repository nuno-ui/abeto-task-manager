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
export type AIPotential = 'high' | 'medium' | 'low';

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
