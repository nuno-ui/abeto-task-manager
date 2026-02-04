import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return formatDate(date);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    // Project statuses
    idea: '#6366f1',
    planning: '#3b82f6',
    in_progress: '#f97316',
    on_hold: '#eab308',
    completed: '#22c55e',
    cancelled: '#ef4444',
    // Task statuses
    not_started: '#6b7280',
    blocked: '#ef4444',
    in_review: '#a855f7',
  };
  return colors[status] || '#6b7280';
}

export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#eab308',
    low: '#22c55e',
  };
  return colors[priority] || '#6b7280';
}

export function getPhaseColor(phase: string): string {
  const colors: Record<string, string> = {
    discovery: '#8b5cf6',
    planning: '#3b82f6',
    development: '#f97316',
    testing: '#eab308',
    training: '#22c55e',
    rollout: '#06b6d4',
    monitoring: '#6366f1',
  };
  return colors[phase] || '#6b7280';
}

export function getDifficultyColor(difficulty: string): string {
  const colors: Record<string, string> = {
    easy: '#22c55e',
    medium: '#eab308',
    hard: '#ef4444',
  };
  return colors[difficulty] || '#6b7280';
}

export function getAIPotentialColor(potential: string): string {
  const colors: Record<string, string> = {
    high: '#22c55e',
    medium: '#eab308',
    low: '#ef4444',
  };
  return colors[potential] || '#6b7280';
}
