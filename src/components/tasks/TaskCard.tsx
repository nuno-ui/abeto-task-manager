'use client';

import { Clock, User, MessageSquare, AlertTriangle, Sparkles } from 'lucide-react';
import { Badge, Avatar, ProgressBar } from '@/components/ui';
import { formatRelativeTime } from '@/lib/utils';
import type { Task } from '@/types/database';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  showProject?: boolean;
}

export function TaskCard({ task, onClick, showProject = false }: TaskCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-all cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          {showProject && task.project && (
            <p className="text-xs text-zinc-500 mb-1 truncate">{task.project.title}</p>
          )}
          <h4 className="font-medium text-white truncate group-hover:text-blue-400 transition-colors">
            {task.title}
          </h4>
        </div>
        {task.is_critical_path && (
          <span title="Critical Path">
            <AlertTriangle className="w-4 h-4 text-orange-400 flex-shrink-0" />
          </span>
        )}
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-sm text-zinc-500 line-clamp-2 mb-3">{task.description}</p>
      )}

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <Badge variant="status" value={task.status}>
          {task.status.replace('_', ' ')}
        </Badge>
        <Badge variant="phase" value={task.phase}>
          {task.phase}
        </Badge>
        {task.owner_team && (
          <Badge>{task.owner_team.name}</Badge>
        )}
      </div>

      {/* Progress if in progress */}
      {task.status === 'in_progress' && task.progress_percentage > 0 && (
        <div className="mb-3">
          <ProgressBar value={task.progress_percentage} size="sm" />
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <div className="flex items-center gap-3">
          {task.estimated_hours && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {task.estimated_hours}
            </span>
          )}
          {task.ai_potential && (
            <span
              className={`flex items-center gap-1 ${
                task.ai_potential === 'high'
                  ? 'text-green-400'
                  : task.ai_potential === 'medium'
                  ? 'text-yellow-400'
                  : 'text-red-400'
              }`}
              title={`AI Potential: ${task.ai_potential}`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {task.ai_potential}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {task.assignee && (
            <Avatar
              src={task.assignee.avatar_url}
              name={task.assignee.full_name || task.assignee.email}
              size="sm"
            />
          )}
        </div>
      </div>
    </div>
  );
}
