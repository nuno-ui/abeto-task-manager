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
  FileText,
  Lightbulb,
  Package,
  GitBranch,
  Sparkles,
  Shield,
  TrendingUp,
  Workflow,
  BoxIcon,
  AlertCircle,
  Puzzle,
  BookOpen,
  Layers,
  BarChart3,
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
  /** Variant for different use cases */
  variant?: 'default' | 'compact' | 'full';
}

/**
 * InfoSection - Reusable component for displaying labeled information sections
 */
function InfoSection({
  label,
  icon: Icon,
  children,
  color = 'zinc'
}: {
  label: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  color?: 'zinc' | 'blue' | 'green' | 'red' | 'amber' | 'purple' | 'cyan' | 'emerald' | 'orange';
}) {
  const colorClasses = {
    zinc: 'text-zinc-500',
    blue: 'text-blue-400',
    green: 'text-green-400',
    red: 'text-red-400',
    amber: 'text-amber-400',
    purple: 'text-purple-400',
    cyan: 'text-cyan-400',
    emerald: 'text-emerald-400',
    orange: 'text-orange-400',
  };

  return (
    <div className="mb-3">
      <p className={`text-xs font-medium ${colorClasses[color]} mb-1.5 flex items-center gap-1`}>
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
      </p>
      {children}
    </div>
  );
}

/**
 * TagList - Reusable component for displaying arrays as tags
 */
function TagList({
  items,
  color = 'zinc',
  maxItems,
}: {
  items: string[];
  color?: 'zinc' | 'blue' | 'green' | 'red' | 'amber' | 'purple' | 'cyan' | 'emerald' | 'orange';
  maxItems?: number;
}) {
  const colorClasses = {
    zinc: 'bg-zinc-800 text-zinc-300',
    blue: 'bg-blue-500/10 text-blue-300',
    green: 'bg-green-500/10 text-green-300',
    red: 'bg-red-500/10 text-red-300',
    amber: 'bg-amber-500/10 text-amber-300',
    purple: 'bg-purple-500/10 text-purple-300',
    cyan: 'bg-cyan-500/10 text-cyan-300',
    emerald: 'bg-emerald-500/10 text-emerald-300',
    orange: 'bg-orange-500/10 text-orange-300',
  };

  const displayItems = maxItems ? items.slice(0, maxItems) : items;
  const remaining = maxItems && items.length > maxItems ? items.length - maxItems : 0;

  return (
    <div className="flex flex-wrap gap-1">
      {displayItems.map((item, i) => (
        <span key={i} className={`px-2 py-0.5 text-xs rounded ${colorClasses[color]}`}>
          {item}
        </span>
      ))}
      {remaining > 0 && (
        <span className="px-2 py-0.5 text-xs rounded bg-zinc-700 text-zinc-400">
          +{remaining} more
        </span>
      )}
    </div>
  );
}

export function ProjectCard({ project, expanded = false, onClick, variant = 'default' }: ProjectCardProps) {
  const [isExpanded, setIsExpanded] = useState(expanded || variant === 'full');
  const completedTasks = project.completed_tasks || 0;
  const totalTasks = project.total_tasks || 0;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Calculate AI potential if tasks have that data
  const hasAIPotential = project.tasks?.some(t => t.ai_potential && t.ai_potential !== 'none');

  // Check if we have any rich data to show
  const hasRichData = !!(
    project.problem_statement ||
    project.deliverables?.length ||
    project.why_it_matters ||
    project.human_role_before ||
    project.human_role_after ||
    project.who_is_empowered?.length ||
    project.new_capabilities?.length ||
    project.ops_process ||
    project.benefits?.length ||
    project.data_required?.length ||
    project.data_generates?.length ||
    project.data_improves?.length ||
    project.api_endpoints?.length ||
    project.missing_api_data?.length ||
    project.integrations_needed?.length ||
    project.depends_on?.length ||
    project.enables?.length ||
    project.prerequisites?.length ||
    project.resources_used?.length
  );

  const cardContent = (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-all hover:shadow-lg cursor-pointer group">
      {/* ========== HEADER ========== */}
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

      {/* ========== BADGES ROW ========== */}
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

      {/* ========== PROBLEM STATEMENT (Always visible if exists) ========== */}
      {project.problem_statement && (
        <div className="mb-3 p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
          <p className="text-xs font-medium text-red-400 mb-1 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            Problem Being Solved
          </p>
          <p className="text-sm text-zinc-300">{project.problem_statement}</p>
        </div>
      )}

      {/* ========== WHY IT MATTERS ========== */}
      {project.why_it_matters && (
        <div className="mb-3 text-sm text-zinc-400 pl-3 border-l-2 border-blue-500/50 italic">
          <span className="text-blue-400 font-medium">Why it matters: </span>
          {project.why_it_matters}
        </div>
      )}

      {/* ========== DELIVERABLES (Always visible if exists) ========== */}
      {project.deliverables && project.deliverables.length > 0 && (
        <div className="mb-3 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
          <p className="text-xs font-medium text-emerald-400 mb-1.5 flex items-center gap-1">
            <Package className="w-3.5 h-3.5" />
            Expected Deliverables
          </p>
          <ul className="space-y-1">
            {project.deliverables.map((item, i) => (
              <li key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-emerald-500 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ========== QUICK STATS ROW ========== */}
      <div className="flex flex-wrap items-center gap-3 mb-3 text-xs">
        {project.primary_users && project.primary_users.length > 0 && (
          <span className="flex items-center gap-1 text-zinc-400">
            <Users className="w-3 h-3" />
            {project.primary_users.slice(0, 2).join(', ')}
            {project.primary_users.length > 2 && ` +${project.primary_users.length - 2}`}
          </span>
        )}

        {project.current_loa && project.potential_loa && (
          <span className="flex items-center gap-1 text-emerald-400">
            <Cpu className="w-3 h-3" />
            {project.current_loa} <ArrowRight className="w-3 h-3" /> {project.potential_loa}
          </span>
        )}

        {project.next_milestone && (
          <span className="flex items-center gap-1 text-amber-400">
            <Target className="w-3 h-3" />
            {project.next_milestone.length > 30
              ? project.next_milestone.slice(0, 30) + '...'
              : project.next_milestone}
          </span>
        )}

        {project.data_status && (
          <span className={`flex items-center gap-1 ${
            project.data_status === 'available' ? 'text-green-400' :
            project.data_status === 'partial' ? 'text-amber-400' :
            'text-red-400'
          }`}>
            <Database className="w-3 h-3" />
            Data: {project.data_status}
          </span>
        )}
      </div>

      {/* ========== DATA FLOW PREVIEW ========== */}
      {(project.data_required?.length || project.data_generates?.length) && (
        <div className="flex flex-wrap gap-1 mb-3">
          {project.data_required?.slice(0, 3).map((item, i) => (
            <span key={`req-${i}`} className="px-2 py-0.5 text-xs bg-red-500/10 text-red-300 rounded flex items-center gap-1">
              <ArrowRight className="w-2.5 h-2.5 rotate-180" />
              {item}
            </span>
          ))}
          {project.data_generates?.slice(0, 3).map((item, i) => (
            <span key={`gen-${i}`} className="px-2 py-0.5 text-xs bg-green-500/10 text-green-300 rounded flex items-center gap-1">
              <ArrowRight className="w-2.5 h-2.5" />
              {item}
            </span>
          ))}
          {((project.data_required?.length || 0) + (project.data_generates?.length || 0)) > 6 && (
            <span className="px-2 py-0.5 text-xs bg-zinc-700 text-zinc-400 rounded">
              +more
            </span>
          )}
        </div>
      )}

      {/* ========== PROGRESS ========== */}
      {totalTasks > 0 && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-zinc-400 mb-1">
            <span>Progress</span>
            <span>{completedTasks}/{totalTasks} tasks ({progress}%)</span>
          </div>
          <ProgressBar value={progress} />
        </div>
      )}

      {/* ========== EXPAND/COLLAPSE BUTTON ========== */}
      {hasRichData && variant !== 'full' && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="w-full flex items-center justify-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors py-2 border-t border-zinc-800/50 mt-2"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Show all details ({
                [
                  project.human_role_before && 'transformation',
                  project.benefits?.length && 'benefits',
                  project.api_endpoints?.length && 'APIs',
                  project.integrations_needed?.length && 'integrations',
                ].filter(Boolean).slice(0, 2).join(', ')
              }...)
            </>
          )}
        </button>
      )}

      {/* ========== EXPANDED CONTENT ========== */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-zinc-800 space-y-4">

          {/* HUMAN TRANSFORMATION SECTION */}
          {(project.human_role_before || project.human_role_after) && (
            <div className="p-3 bg-zinc-800/30 rounded-lg">
              <p className="text-xs font-medium text-purple-400 mb-2 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Human Role Transformation
              </p>
              <div className="grid grid-cols-2 gap-3">
                {project.human_role_before && (
                  <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
                    <p className="text-xs font-medium text-red-400 mb-1">Before (Current State)</p>
                    <p className="text-sm text-zinc-300">{project.human_role_before}</p>
                  </div>
                )}
                {project.human_role_after && (
                  <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-3">
                    <p className="text-xs font-medium text-green-400 mb-1">After (Future State)</p>
                    <p className="text-sm text-zinc-300">{project.human_role_after}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* WHO IS EMPOWERED & NEW CAPABILITIES */}
          <div className="grid grid-cols-2 gap-4">
            {project.who_is_empowered && project.who_is_empowered.length > 0 && (
              <InfoSection label="Who Is Empowered" icon={Users} color="blue">
                <TagList items={project.who_is_empowered} color="blue" />
              </InfoSection>
            )}
            {project.new_capabilities && project.new_capabilities.length > 0 && (
              <InfoSection label="New Capabilities" icon={Lightbulb} color="amber">
                <TagList items={project.new_capabilities} color="amber" />
              </InfoSection>
            )}
          </div>

          {/* OPERATIONS SECTION */}
          {project.ops_process && (
            <InfoSection label="Operations Process" icon={Workflow} color="cyan">
              <p className="text-sm text-zinc-300">{project.ops_process}</p>
            </InfoSection>
          )}

          {/* AUTOMATION LEVELS */}
          {(project.current_loa || project.potential_loa) && (
            <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
              <p className="text-xs font-medium text-emerald-400 mb-2 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                Automation Journey
              </p>
              <div className="flex items-center gap-4">
                {project.current_loa && (
                  <div>
                    <p className="text-xs text-zinc-500">Current Level</p>
                    <p className="text-lg font-bold text-zinc-300">{project.current_loa}</p>
                  </div>
                )}
                <ArrowRight className="w-5 h-5 text-emerald-500" />
                {project.potential_loa && (
                  <div>
                    <p className="text-xs text-zinc-500">Target Level</p>
                    <p className="text-lg font-bold text-emerald-400">{project.potential_loa}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* BENEFITS */}
          {project.benefits && project.benefits.length > 0 && (
            <InfoSection label="Benefits" icon={CheckCircle2} color="emerald">
              <div className="space-y-1">
                {project.benefits.map((benefit, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                    <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-emerald-500 flex-shrink-0" />
                    {benefit}
                  </div>
                ))}
              </div>
            </InfoSection>
          )}

          {/* DATA FLOW SECTION */}
          {(project.data_required?.length || project.data_generates?.length || project.data_improves?.length) && (
            <div className="p-3 bg-zinc-800/30 rounded-lg">
              <p className="text-xs font-medium text-cyan-400 mb-3 flex items-center gap-1">
                <Database className="w-3.5 h-3.5" />
                Data Flow
              </p>
              <div className="grid grid-cols-3 gap-3">
                {project.data_required && project.data_required.length > 0 && (
                  <div>
                    <p className="text-xs text-red-400 mb-1 flex items-center gap-1">
                      <ArrowRight className="w-3 h-3 rotate-180" />
                      Requires
                    </p>
                    <TagList items={project.data_required} color="red" />
                  </div>
                )}
                {project.data_generates && project.data_generates.length > 0 && (
                  <div>
                    <p className="text-xs text-green-400 mb-1 flex items-center gap-1">
                      <ArrowRight className="w-3 h-3" />
                      Generates
                    </p>
                    <TagList items={project.data_generates} color="green" />
                  </div>
                )}
                {project.data_improves && project.data_improves.length > 0 && (
                  <div>
                    <p className="text-xs text-amber-400 mb-1 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Improves
                    </p>
                    <TagList items={project.data_improves} color="amber" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TECHNICAL SECTION */}
          <div className="grid grid-cols-2 gap-4">
            {/* API Endpoints */}
            {project.api_endpoints && project.api_endpoints.length > 0 && (
              <InfoSection label="API Endpoints" icon={Server} color="cyan">
                <div className="flex flex-wrap gap-1">
                  {project.api_endpoints.map((endpoint, i) => (
                    <span key={i} className="px-2 py-0.5 text-xs bg-cyan-500/10 text-cyan-300 rounded font-mono">
                      {endpoint}
                    </span>
                  ))}
                </div>
              </InfoSection>
            )}

            {/* Resources Used */}
            {project.resources_used && project.resources_used.length > 0 && (
              <InfoSection label="Resources Used" icon={BoxIcon} color="purple">
                <TagList items={project.resources_used} color="purple" />
              </InfoSection>
            )}
          </div>

          {/* MISSING DATA & INTEGRATIONS */}
          {(project.missing_api_data?.length || project.integrations_needed?.length) && (
            <div className="grid grid-cols-2 gap-4">
              {project.missing_api_data && project.missing_api_data.length > 0 && (
                <InfoSection label="Missing API Data" icon={AlertTriangle} color="red">
                  <TagList items={project.missing_api_data} color="red" />
                </InfoSection>
              )}
              {project.integrations_needed && project.integrations_needed.length > 0 && (
                <InfoSection label="Integrations Needed" icon={Puzzle} color="purple">
                  <TagList items={project.integrations_needed} color="purple" />
                </InfoSection>
              )}
            </div>
          )}

          {/* DEPENDENCIES SECTION */}
          {(project.depends_on?.length || project.enables?.length || project.related_to?.length || project.prerequisites?.length) && (
            <div className="p-3 bg-zinc-800/30 rounded-lg">
              <p className="text-xs font-medium text-orange-400 mb-3 flex items-center gap-1">
                <GitBranch className="w-3.5 h-3.5" />
                Project Dependencies
              </p>
              <div className="grid grid-cols-2 gap-3">
                {project.depends_on && project.depends_on.length > 0 && (
                  <div>
                    <p className="text-xs text-red-400 mb-1">Depends On</p>
                    <TagList items={project.depends_on} color="red" />
                  </div>
                )}
                {project.enables && project.enables.length > 0 && (
                  <div>
                    <p className="text-xs text-green-400 mb-1">Enables</p>
                    <TagList items={project.enables} color="green" />
                  </div>
                )}
                {project.prerequisites && project.prerequisites.length > 0 && (
                  <div>
                    <p className="text-xs text-amber-400 mb-1">Prerequisites</p>
                    <TagList items={project.prerequisites} color="amber" />
                  </div>
                )}
                {project.related_to && project.related_to.length > 0 && (
                  <div>
                    <p className="text-xs text-blue-400 mb-1">Related To</p>
                    <TagList items={project.related_to} color="blue" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* LINKS SECTION */}
          {(project.prototype_url || project.notion_url || project.github_url) && (
            <div className="flex flex-wrap gap-2">
              {project.prototype_url && (
                <a
                  href={project.prototype_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-xs hover:bg-blue-500/20 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Prototype
                </a>
              )}
              {project.notion_url && (
                <a
                  href={project.notion_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded-lg text-xs hover:bg-zinc-700 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Notion
                </a>
              )}
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded-lg text-xs hover:bg-zinc-700 transition-colors"
                >
                  <GitBranch className="w-3.5 h-3.5" />
                  GitHub
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========== FOOTER ========== */}
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
          {project.tags && project.tags.length > 0 && (
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              {project.tags.length} tags
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {project.pillar && (
            <span className="flex items-center gap-1">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: project.pillar.color }}
              />
              {project.pillar.name}
            </span>
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

        {project.problem_statement && (
          <p className="text-xs text-red-400 mb-2 line-clamp-1">
            <AlertCircle className="w-3 h-3 inline mr-1" />
            {project.problem_statement}
          </p>
        )}

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

/**
 * Full detail card - always expanded, no link wrapper
 */
export function ProjectCardFull({ project }: { project: Project }) {
  return <ProjectCard project={project} variant="full" />;
}
