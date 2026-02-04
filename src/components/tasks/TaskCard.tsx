'use client';

import { useState } from 'react';
import {
  Clock,
  AlertTriangle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
  Wrench,
  Brain,
  Target,
  TrendingUp,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { Badge, Avatar, ProgressBar } from '@/components/ui';
import type { Task } from '@/types/database';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  showProject?: boolean;
  expanded?: boolean;
}

const phaseColors: Record<string, string> = {
  discovery: '#3b82f6',
  planning: '#8b5cf6',
  development: '#f59e0b',
  testing: '#10b981',
  training: '#06b6d4',
  rollout: '#ec4899',
  monitoring: '#6366f1',
};

const aiPotentialConfig = {
  high: { color: 'text-green-400', bg: 'bg-green-400/10', label: 'High AI Potential' },
  medium: { color: 'text-yellow-400', bg: 'bg-yellow-400/10', label: 'Medium AI Potential' },
  low: { color: 'text-red-400', bg: 'bg-red-400/10', label: 'Low AI Potential' },
};

export function TaskCard({ task, onClick, showProject = false, expanded: initialExpanded = false }: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  const aiConfig = task.ai_potential ? aiPotentialConfig[task.ai_potential as keyof typeof aiPotentialConfig] : null;

  const hasDetails =
    (task.acceptance_criteria && task.acceptance_criteria.length > 0) ||
    (task.success_metrics && task.success_metrics.length > 0) ||
    (task.risks && task.risks.length > 0) ||
    (task.tools_needed && task.tools_needed.length > 0) ||
    (task.knowledge_areas && task.knowledge_areas.length > 0) ||
    task.ai_assist_description;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden hover:border-zinc-700 transition-all">
      {/* Main card header - clickable to edit */}
      <div onClick={onClick} className="p-4 cursor-pointer group">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            {showProject && task.project && (
              <p className="text-xs text-zinc-500 mb-1 truncate">{task.project.title}</p>
            )}
            <div className="flex items-center gap-2">
              {/* Status indicator */}
              {task.status === 'completed' ? (
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
              ) : task.status === 'in_progress' ? (
                <div className="w-4 h-4 rounded-full border-2 border-blue-400 border-t-transparent animate-spin flex-shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-zinc-600 flex-shrink-0" />
              )}
              <h4 className="font-medium text-white group-hover:text-blue-400 transition-colors">
                {task.title}
              </h4>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {task.is_critical_path && (
              <span className="flex items-center gap-1 text-orange-400 text-xs bg-orange-400/10 px-2 py-0.5 rounded">
                <AlertTriangle className="w-3 h-3" />
                Critical Path
              </span>
            )}
            {task.is_foundational && (
              <span className="flex items-center gap-1 text-purple-400 text-xs bg-purple-400/10 px-2 py-0.5 rounded">
                <Zap className="w-3 h-3" />
                Foundational
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-sm text-zinc-400 mb-3 line-clamp-2">{task.description}</p>
        )}

        {/* Badges Row */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <Badge variant="status" value={task.status}>
            {task.status.replace('_', ' ')}
          </Badge>
          <span
            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
            style={{ backgroundColor: `${phaseColors[task.phase]}20`, color: phaseColors[task.phase] }}
          >
            {task.phase}
          </span>
          <Badge variant="difficulty" value={task.difficulty}>
            {task.difficulty}
          </Badge>
          {task.owner_team && <Badge>{task.owner_team.name}</Badge>}
        </div>

        {/* Progress if in progress */}
        {task.status === 'in_progress' && task.progress_percentage && task.progress_percentage > 0 && (
          <div className="mb-3">
            <ProgressBar value={task.progress_percentage} size="sm" />
          </div>
        )}

        {/* Info Row */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4 text-zinc-500">
            {task.estimated_hours && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {task.estimated_hours}
              </span>
            )}
            {aiConfig && (
              <span className={`flex items-center gap-1 ${aiConfig.color}`}>
                <Sparkles className="w-3.5 h-3.5" />
                {task.ai_potential} AI
              </span>
            )}
            {task.tools_needed && task.tools_needed.length > 0 && (
              <span className="flex items-center gap-1">
                <Wrench className="w-3.5 h-3.5" />
                {task.tools_needed.length} tools
              </span>
            )}
            {task.acceptance_criteria && task.acceptance_criteria.length > 0 && (
              <span className="flex items-center gap-1">
                <Target className="w-3.5 h-3.5" />
                {task.acceptance_criteria.length} criteria
              </span>
            )}
          </div>
          {task.assignee && (
            <Avatar
              src={task.assignee.avatar_url}
              name={task.assignee.full_name || task.assignee.email}
              size="sm"
            />
          )}
        </div>
      </div>

      {/* Expand toggle */}
      {hasDetails && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="w-full px-4 py-2 flex items-center justify-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 bg-zinc-800/50 border-t border-zinc-800 transition-colors"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Hide Details
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Show Details
            </>
          )}
        </button>
      )}

      {/* Expanded Details */}
      {isExpanded && hasDetails && (
        <div className="px-4 pb-4 pt-2 border-t border-zinc-800 space-y-4 bg-zinc-950/50">
          {/* AI Assist Description */}
          {task.ai_assist_description && aiConfig && (
            <div className={`p-3 rounded-lg ${aiConfig.bg}`}>
              <div className={`flex items-center gap-2 ${aiConfig.color} text-sm font-medium mb-1`}>
                <Sparkles className="w-4 h-4" />
                {aiConfig.label}
              </div>
              <p className="text-sm text-zinc-300">{task.ai_assist_description}</p>
            </div>
          )}

          {/* Tools Needed */}
          {task.tools_needed && task.tools_needed.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-300 mb-2">
                <Wrench className="w-4 h-4 text-zinc-500" />
                Tools Needed
              </div>
              <div className="flex flex-wrap gap-1.5">
                {task.tools_needed.map((tool, idx) => (
                  <span key={idx} className="px-2 py-1 text-xs bg-zinc-800 text-zinc-300 rounded">
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Knowledge Areas */}
          {task.knowledge_areas && task.knowledge_areas.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-300 mb-2">
                <Brain className="w-4 h-4 text-zinc-500" />
                Knowledge Areas
              </div>
              <div className="flex flex-wrap gap-1.5">
                {task.knowledge_areas.map((area, idx) => (
                  <span key={idx} className="px-2 py-1 text-xs bg-blue-500/10 text-blue-400 rounded">
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Acceptance Criteria */}
          {task.acceptance_criteria && task.acceptance_criteria.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-300 mb-2">
                <Target className="w-4 h-4 text-zinc-500" />
                Acceptance Criteria
              </div>
              <ul className="space-y-1">
                {task.acceptance_criteria.map((criterion, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-zinc-400">
                    <CheckCircle2 className="w-4 h-4 text-zinc-600 flex-shrink-0 mt-0.5" />
                    {criterion}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Success Metrics */}
          {task.success_metrics && task.success_metrics.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-300 mb-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                Success Metrics
              </div>
              <ul className="space-y-1">
                {task.success_metrics.map((metric, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-green-400">
                    <TrendingUp className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    {metric}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Risks */}
          {task.risks && task.risks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-300 mb-2">
                <AlertCircle className="w-4 h-4 text-orange-500" />
                Risks
              </div>
              <ul className="space-y-1">
                {task.risks.map((risk, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-orange-400">
                    <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
