'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Calendar,
  Users,
  CheckCircle2,
  ExternalLink,
  Clock,
  ChevronDown,
  ChevronUp,
  Zap,
  Database,
  ArrowRight,
  Target,
  AlertTriangle,
  Link2,
  Server,
  Cpu,
} from 'lucide-react';
import { Badge, ProgressBar } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import type { Project } from '@/types/database';

interface ProjectCardProps {
  project: Project;
  /** Whether to show expanded view with more details */
  expanded?: boolean;
  /** Click handler - if provided, renders as div instead of Link */
  onClick?: () => void;
}

export function ProjectCard({ project, expanded = false, onClick }: ProjectCardProps) {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const completedTasks = project.completed_tasks || 0;
  const totalTasks = project.total_tasks || 0;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Calculate AI potential if tasks have that data
  const hasAIPotential = project.tasks?.some(t => t.ai_potential && t.ai_potential !== 'none');

  const cardContent = (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-all hover:shadow-lg cursor-pointer group">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {project.pillar && (
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: project.pillar.color }}
                title={project.pillar.name}
              />
            )}
            <h3 className="font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
              {project.title}
            </h3>
          </div>
          <p className="text-sm text-zinc-500 line-clamp-2 mt-1">
            {project.description || 'No description'}
          </p>
        </div>
        {project.difficulty && (
          <Badge variant="difficulty" value={project.difficulty} className="flex-shrink-0">
            {project.difficulty}
          </Badge>
        )}
      </div>

      {/* Badges Row */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <Badge variant="status" value={project.status}>
          {project.status.replace('_', ' ')}
        </Badge>
        <Badge variant="priority" value={project.priority}>
          {project.priority}
        </Badge>
        {project.category && (
          <Badge className="bg-zinc-800 text-zinc-300">
            {project.category}
          </Badge>
        )}
        {project.owner_team && (
          <Badge className="bg-purple-500/20 text-purple-300">
            {project.owner_team.name}
          </Badge>
        )}
        {project.estimated_hours_min && project.estimated_hours_max && (
          <span className="text-xs text-zinc-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {project.estimated_hours_min}-{project.estimated_hours_max}h
          </span>
        )}
      </div>

      {/* Why it matters - condensed */}
      {project.why_it_matters && (
        <div className="mb-3 text-xs text-zinc-400 line-clamp-2 pl-3 border-l-2 border-blue-500/50 italic">
          {project.why_it_matters}
        </div>
      )}

      {/* Quick Stats Row */}
      <div className="flex flex-wrap items-center gap-3 mb-3 text-xs">
        {/* Primary Users */}
        {project.primary_users && project.primary_users.length > 0 && (
          <span className="flex items-center gap-1 text-zinc-400">
            <Users className="w-3 h-3" />
            {project.primary_users.slice(0, 2).join(', ')}
          </span>
        )}

        {/* Automation Level */}
        {project.current_loa && project.potential_loa && (
          <span className="flex items-center gap-1 text-emerald-400">
            <Cpu className="w-3 h-3" />
            {project.current_loa} <ArrowRight className="w-3 h-3" /> {project.potential_loa}
          </span>
        )}

        {/* Next Milestone */}
        {project.next_milestone && (
          <span className="flex items-center gap-1 text-amber-400">
            <Target className="w-3 h-3" />
            {project.next_milestone.length > 30
              ? project.next_milestone.slice(0, 30) + '...'
              : project.next_milestone}
          </span>
        )}
      </div>

      {/* Data Dependencies - Compact */}
      {(project.data_required?.length || project.data_generates?.length) && (
        <div className="flex flex-wrap gap-1 mb-3">
          {project.data_required?.slice(0, 3).map((item, i) => (
            <span key={`req-${i}`} className="px-2 py-0.5 text-xs bg-red-500/10 text-red-300 rounded">
              {item}
            </span>
          ))}
          {project.data_generates?.slice(0, 3).map((item, i) => (
            <span key={`gen-${i}`} className="px-2 py-0.5 text-xs bg-green-500/10 text-green-300 rounded">
              {item}
            </span>
          ))}
        </div>
      )}

      {/* Progress */}
      {totalTasks > 0 && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-zinc-400 mb-1">
            <span>Progress</span>
            <span>{completedTasks}/{totalTasks} tasks</span>
          </div>
          <ProgressBar value={progress} />
        </div>
      )}

      {/* Expand/Collapse Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsExpanded(!isExpanded);
        }}
        className="w-full flex items-center justify-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors py-1"
      >
        {isExpanded ? (
          <>
            <ChevronUp className="w-4 h-4" />
            Less details
          </>
        ) : (
          <>
            <ChevronDown className="w-4 h-4" />
            More details
          </>
        )}
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-zinc-800 space-y-4">
          {/* Human Role Before/After */}
          {(project.human_role_before || project.human_role_after) && (
            <div className="grid grid-cols-2 gap-3">
              {project.human_role_before && (
                <div className="bg-zinc-800/50 rounded-lg p-2">
                  <p className="text-xs font-medium text-red-400 mb-1">Before</p>
                  <p className="text-xs text-zinc-400 line-clamp-3">{project.human_role_before}</p>
                </div>
              )}
              {project.human_role_after && (
                <div className="bg-zinc-800/50 rounded-lg p-2">
                  <p className="text-xs font-medium text-green-400 mb-1">After</p>
                  <p className="text-xs text-zinc-400 line-clamp-3">{project.human_role_after}</p>
                </div>
              )}
            </div>
          )}

          {/* Who is Empowered */}
          {project.who_is_empowered && project.who_is_empowered.length > 0 && (
            <div>
              <p className="text-xs font-medium text-zinc-500 mb-1">Empowers:</p>
              <div className="flex flex-wrap gap-1">
                {project.who_is_empowered.map((who, i) => (
                  <span key={i} className="px-2 py-0.5 text-xs bg-blue-500/10 text-blue-300 rounded">
                    {who}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Operations Process */}
          {project.ops_process && (
            <div>
              <p className="text-xs font-medium text-zinc-500 mb-1">Ops Process:</p>
              <p className="text-xs text-zinc-400">{project.ops_process}</p>
            </div>
          )}

          {/* Benefits */}
          {project.benefits && project.benefits.length > 0 && (
            <div>
              <p className="text-xs font-medium text-zinc-500 mb-1">Benefits:</p>
              <div className="flex flex-wrap gap-1">
                {project.benefits.map((benefit, i) => (
                  <span key={i} className="px-2 py-0.5 text-xs bg-emerald-500/10 text-emerald-300 rounded">
                    {benefit}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Dependencies */}
          {(project.depends_on?.length || project.prerequisites?.length) && (
            <div>
              <p className="text-xs font-medium text-zinc-500 mb-1 flex items-center gap-1">
                <Link2 className="w-3 h-3" />
                Dependencies:
              </p>
              <div className="flex flex-wrap gap-1">
                {project.depends_on?.map((dep, i) => (
                  <span key={`dep-${i}`} className="px-2 py-0.5 text-xs bg-orange-500/10 text-orange-300 rounded">
                    {dep}
                  </span>
                ))}
                {project.prerequisites?.map((prereq, i) => (
                  <span key={`prereq-${i}`} className="px-2 py-0.5 text-xs bg-amber-500/10 text-amber-300 rounded">
                    {prereq}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* API Endpoints */}
          {project.api_endpoints && project.api_endpoints.length > 0 && (
            <div>
              <p className="text-xs font-medium text-zinc-500 mb-1 flex items-center gap-1">
                <Server className="w-3 h-3" />
                API Endpoints:
              </p>
              <div className="flex flex-wrap gap-1">
                {project.api_endpoints.map((endpoint, i) => (
                  <span key={i} className="px-2 py-0.5 text-xs bg-cyan-500/10 text-cyan-300 rounded font-mono">
                    {endpoint}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Missing API Data */}
          {project.missing_api_data && project.missing_api_data.length > 0 && (
            <div>
              <p className="text-xs font-medium text-red-400 mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Missing API Data:
              </p>
              <div className="flex flex-wrap gap-1">
                {project.missing_api_data.map((item, i) => (
                  <span key={i} className="px-2 py-0.5 text-xs bg-red-500/10 text-red-300 rounded">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Integrations Needed */}
          {project.integrations_needed && project.integrations_needed.length > 0 && (
            <div>
              <p className="text-xs font-medium text-zinc-500 mb-1">Integrations Needed:</p>
              <div className="flex flex-wrap gap-1">
                {project.integrations_needed.map((integration, i) => (
                  <span key={i} className="px-2 py-0.5 text-xs bg-purple-500/10 text-purple-300 rounded">
                    {integration}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-zinc-500 mt-3 pt-3 border-t border-zinc-800/50">
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
          {hasAIPotential && (
            <span className="flex items-center gap-1 text-purple-400" title="Has AI-assisted tasks">
              <Zap className="w-3.5 h-3.5" />
              AI
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {project.data_status && (
            <span className={`flex items-center gap-1 ${
              project.data_status === 'available' ? 'text-green-400' :
              project.data_status === 'partial' ? 'text-amber-400' :
              'text-red-400'
            }`}>
              <Database className="w-3.5 h-3.5" />
              {project.data_status}
            </span>
          )}
          {project.prototype_url && (
            <ExternalLink className="w-3.5 h-3.5 text-zinc-600 hover:text-zinc-400" />
          )}
        </div>
      </div>
    </div>
  );

  // If onClick is provided, render as div, otherwise as Link
  if (onClick) {
    return <div onClick={onClick}>{cardContent}</div>;
  }

  return (
    <Link href={`/projects/${project.slug}`}>
      {cardContent}
    </Link>
  );
}

/**
 * Compact version for lists and grids
 */
export function ProjectCardCompact({ project }: { project: Project }) {
  const completedTasks = project.completed_tasks || 0;
  const totalTasks = project.total_tasks || 0;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <Link href={`/projects/${project.slug}`}>
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-all hover:shadow-lg cursor-pointer group">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {project.pillar && (
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: project.pillar.color }}
              />
            )}
            <h3 className="font-medium text-white text-sm truncate group-hover:text-blue-400 transition-colors">
              {project.title}
            </h3>
          </div>
          <Badge variant="priority" value={project.priority} className="text-xs">
            {project.priority}
          </Badge>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <Badge variant="status" value={project.status} className="text-xs">
            {project.status.replace('_', ' ')}
          </Badge>
          {project.estimated_hours_min && (
            <span className="text-xs text-zinc-500">
              {project.estimated_hours_min}-{project.estimated_hours_max}h
            </span>
          )}
        </div>

        {totalTasks > 0 && (
          <div className="mb-2">
            <ProgressBar value={progress} size="sm" />
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>{totalTasks} tasks</span>
          {project.target_date && (
            <span>{formatDate(project.target_date)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
