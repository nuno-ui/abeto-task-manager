'use client';

import Link from 'next/link';
import { Calendar, Users, CheckCircle2, MessageSquare, ExternalLink } from 'lucide-react';
import { Badge, ProgressBar, Avatar } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import type { Project } from '@/types/database';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const completedTasks = project.completed_tasks || 0;
  const totalTasks = project.total_tasks || 0;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <Link href={`/projects/${project.slug}`}>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-all hover:shadow-lg cursor-pointer group">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
              {project.title}
            </h3>
            <p className="text-sm text-zinc-500 line-clamp-2 mt-1">
              {project.description || 'No description'}
            </p>
          </div>
          {project.pillar && (
            <div
              className="w-2 h-2 rounded-full flex-shrink-0 mt-2"
              style={{ backgroundColor: project.pillar.color }}
              title={project.pillar.name}
            />
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="status" value={project.status}>
            {project.status.replace('_', ' ')}
          </Badge>
          <Badge variant="priority" value={project.priority}>
            {project.priority}
          </Badge>
          {project.owner_team && (
            <Badge>
              {project.owner_team.name}
            </Badge>
          )}
        </div>

        {/* Progress */}
        {totalTasks > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-zinc-400 mb-1">
              <span>Progress</span>
              <span>{completedTasks}/{totalTasks} tasks</span>
            </div>
            <ProgressBar value={progress} />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-4">
            {project.target_date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(project.target_date)}
              </span>
            )}
            {totalTasks > 0 && (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {totalTasks} tasks
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {project.prototype_url && (
              <ExternalLink className="w-3.5 h-3.5 text-zinc-600 hover:text-zinc-400" />
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
