import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client (uses ANTHROPIC_API_KEY env var automatically)
export const anthropic = new Anthropic();

// Project schema for AI to understand
export const PROJECT_SCHEMA = {
  title: { type: 'string', required: true, description: 'Short, descriptive project title' },
  slug: { type: 'string', required: true, description: 'URL-friendly version of title (lowercase, hyphens)' },
  description: { type: 'string', required: false, description: 'Detailed project description' },
  status: {
    type: 'enum',
    required: true,
    options: ['idea', 'planning', 'in_progress', 'on_hold', 'completed', 'cancelled'],
    description: 'Current project status'
  },
  priority: {
    type: 'enum',
    required: true,
    options: ['low', 'medium', 'high', 'critical'],
    description: 'Project priority level'
  },
  start_date: { type: 'date', required: false, description: 'Project start date (YYYY-MM-DD)' },
  target_date: { type: 'date', required: false, description: 'Target completion date (YYYY-MM-DD)' },
  owner_team_id: { type: 'uuid', required: false, description: 'ID of the team that owns this project' },
};

// Task schema for AI to understand
export const TASK_SCHEMA = {
  title: { type: 'string', required: true, description: 'Short task title' },
  description: { type: 'string', required: false, description: 'Detailed task description' },
  phase: {
    type: 'enum',
    required: true,
    options: ['discovery', 'planning', 'development', 'testing', 'training', 'rollout', 'monitoring'],
    description: 'Project phase this task belongs to'
  },
  status: {
    type: 'enum',
    required: true,
    options: ['not_started', 'in_progress', 'blocked', 'in_review', 'completed', 'cancelled'],
    description: 'Current task status'
  },
  difficulty: {
    type: 'enum',
    required: true,
    options: ['easy', 'medium', 'hard'],
    description: 'Task difficulty level'
  },
  ai_potential: {
    type: 'enum',
    required: false,
    options: ['none', 'low', 'medium', 'high'],
    description: 'How much AI can assist with this task'
  },
  estimated_hours: { type: 'string', required: false, description: 'Estimated hours (e.g., "2-4", "8", "16-24")' },
  is_foundational: { type: 'boolean', required: false, description: 'Is this a foundational task that others depend on?' },
  is_critical_path: { type: 'boolean', required: false, description: 'Is this on the critical path?' },
};

export interface ProjectData {
  title?: string;
  slug?: string;
  description?: string;
  status?: string;
  priority?: string;
  start_date?: string;
  target_date?: string;
  owner_team_id?: string;
}

export interface AIQuestion {
  field: string;
  question: string;
  options?: string[];
  type?: 'text' | 'select' | 'date' | 'number';
}

export interface CreateProjectResponse {
  project: ProjectData;
  questions: AIQuestion[];
  complete: boolean;
  summary?: string;
}

export interface UpdateSuggestion {
  type: 'project' | 'task';
  id: string;
  field: string;
  currentValue: any;
  suggestedValue: any;
  reason: string;
}

export interface ProcessCommentResponse {
  suggestions: UpdateSuggestion[];
  summary: string;
}
