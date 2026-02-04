'use client';

import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'status' | 'priority' | 'phase' | 'difficulty' | 'ai';
  value?: string;
  className?: string;
}

const statusColors: Record<string, string> = {
  idea: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  planning: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  in_progress: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  on_hold: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  completed: 'bg-green-500/20 text-green-400 border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
  not_started: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
  blocked: 'bg-red-500/20 text-red-400 border-red-500/30',
  in_review: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

const priorityColors: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-green-500/20 text-green-400 border-green-500/30',
};

const phaseColors: Record<string, string> = {
  discovery: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  planning: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  development: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  testing: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  training: 'bg-green-500/20 text-green-400 border-green-500/30',
  rollout: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  monitoring: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
};

const difficultyColors: Record<string, string> = {
  easy: 'bg-green-500/20 text-green-400 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  hard: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const aiColors: Record<string, string> = {
  high: 'bg-green-500/20 text-green-400 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export function Badge({ children, variant = 'default', value, className }: BadgeProps) {
  let colorClass = 'bg-zinc-700/50 text-zinc-300 border-zinc-600/50';

  if (value) {
    switch (variant) {
      case 'status':
        colorClass = statusColors[value] || colorClass;
        break;
      case 'priority':
        colorClass = priorityColors[value] || colorClass;
        break;
      case 'phase':
        colorClass = phaseColors[value] || colorClass;
        break;
      case 'difficulty':
        colorClass = difficultyColors[value] || colorClass;
        break;
      case 'ai':
        colorClass = aiColors[value] || colorClass;
        break;
    }
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border',
        colorClass,
        className
      )}
    >
      {children}
    </span>
  );
}
