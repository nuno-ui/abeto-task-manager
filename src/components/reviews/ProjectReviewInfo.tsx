'use client';

import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Target,
  Users,
  Clock,
  Database,
  Link2,
  Zap,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  FileText,
  Workflow,
  ExternalLink,
  Layers,
  Gauge,
  Calendar,
  ListChecks,
  TrendingUp,
  Shield,
  Timer,
  Code,
  HardDrive,
} from 'lucide-react';
import { Project, Task } from '@/types/database';

interface ProjectReviewInfoProps {
  project: Project & { tasks: Task[] };
}

const statusColors: Record<string, string> = {
  idea: 'bg-indigo-500',
  planning: 'bg-blue-500',
  in_progress: 'bg-yellow-500',
  on_hold: 'bg-orange-500',
  completed: 'bg-green-500',
  cancelled: 'bg-red-500',
};

const priorityColors: Record<string, string> = {
  critical: 'text-red-400 bg-red-500/20',
  high: 'text-orange-400 bg-orange-500/20',
  medium: 'text-yellow-400 bg-yellow-500/20',
  low: 'text-green-400 bg-green-500/20',
};

const difficultyColors: Record<string, string> = {
  easy: 'text-green-400 bg-green-500/20',
  medium: 'text-yellow-400 bg-yellow-500/20',
  hard: 'text-red-400 bg-red-500/20',
};

export function ProjectReviewInfo({ project }: ProjectReviewInfoProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    assessment: true,
    problem: true,
    transformation: false,
    data: false,
    dependencies: false,
    benefits: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const completedTasks = project.tasks.filter(t => t.status === 'completed').length;
  const totalTasks = project.tasks.length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Key Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-white">{totalTasks}</p>
          <p className="text-xs text-zinc-400">Tasks</p>
        </div>
        <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-white">{progressPercent}%</p>
          <p className="text-xs text-zinc-400">Progress</p>
        </div>
        <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-white">
            {project.estimated_hours_min || '?'}-{project.estimated_hours_max || '?'}h
          </p>
          <p className="text-xs text-zinc-400">Est. Hours</p>
        </div>
        <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${difficultyColors[project.difficulty] || 'bg-zinc-700 text-zinc-300'}`}>
            {project.difficulty}
          </span>
          <p className="text-xs text-zinc-400 mt-1">Difficulty</p>
        </div>
      </div>

      {/* Current Assessment Values - These are what reviewers vote on */}
      <CollapsibleSection
        title="Current Assessment (Pre-set Values)"
        icon={<Gauge className="w-4 h-4 text-cyan-400" />}
        isOpen={expandedSections.assessment}
        onToggle={() => toggleSection('assessment')}
      >
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <AssessmentBadge
            label="Time Horizon"
            value={project.time_horizon}
            colorMap={{
              short: 'bg-green-500/20 text-green-400',
              medium: 'bg-yellow-500/20 text-yellow-400',
              long: 'bg-blue-500/20 text-blue-400',
            }}
            labelMap={{
              short: 'Short-term',
              medium: 'Mid-term',
              long: 'Long-term',
            }}
          />
          <AssessmentBadge
            label="Task List Quality"
            value={project.task_list_quality}
            colorMap={{
              needs_work: 'bg-red-500/20 text-red-400',
              acceptable: 'bg-yellow-500/20 text-yellow-400',
              well_structured: 'bg-green-500/20 text-green-400',
            }}
            labelMap={{
              needs_work: 'Needs Work',
              acceptable: 'Acceptable',
              well_structured: 'Well Structured',
            }}
          />
          <AssessmentBadge
            label="Pain Point Level"
            value={project.pain_point_level}
            colorMap={{
              low: 'bg-red-500/20 text-red-400',
              medium: 'bg-yellow-500/20 text-yellow-400',
              high: 'bg-green-500/20 text-green-400',
            }}
            labelMap={{
              low: 'Low',
              medium: 'Medium',
              high: 'Critical',
            }}
          />
          <AssessmentBadge
            label="Adoption Risk"
            value={project.adoption_risk}
            colorMap={{
              high_risk: 'bg-red-500/20 text-red-400',
              medium_risk: 'bg-yellow-500/20 text-yellow-400',
              low_risk: 'bg-green-500/20 text-green-400',
            }}
            labelMap={{
              high_risk: 'High Risk',
              medium_risk: 'Medium Risk',
              low_risk: 'Low Risk',
            }}
          />
          <AssessmentBadge
            label="ROI Confidence"
            value={project.roi_confidence}
            colorMap={{
              low: 'bg-red-500/20 text-red-400',
              medium: 'bg-yellow-500/20 text-yellow-400',
              high: 'bg-green-500/20 text-green-400',
            }}
            labelMap={{
              low: 'Low',
              medium: 'Medium',
              high: 'High',
            }}
          />
          <AssessmentBadge
            label="Strategic Alignment"
            value={project.strategic_alignment}
            colorMap={{
              weak: 'bg-red-500/20 text-red-400',
              moderate: 'bg-yellow-500/20 text-yellow-400',
              strong: 'bg-green-500/20 text-green-400',
            }}
            labelMap={{
              weak: 'Weak',
              moderate: 'Moderate',
              strong: 'Strong',
            }}
          />
          <AssessmentBadge
            label="Resource ROI"
            value={project.resource_justified}
            colorMap={{
              poor: 'bg-red-500/20 text-red-400',
              acceptable: 'bg-yellow-500/20 text-yellow-400',
              strong: 'bg-green-500/20 text-green-400',
            }}
            labelMap={{
              poor: 'Poor',
              acceptable: 'Acceptable',
              strong: 'Strong',
            }}
          />
          <AssessmentBadge
            label="Timeline"
            value={project.timeline_realistic}
            colorMap={{
              too_aggressive: 'bg-red-500/20 text-red-400',
              realistic: 'bg-green-500/20 text-green-400',
              conservative: 'bg-blue-500/20 text-blue-400',
            }}
            labelMap={{
              too_aggressive: 'Too Aggressive',
              realistic: 'Realistic',
              conservative: 'Conservative',
            }}
          />
          <AssessmentBadge
            label="Tech Debt Risk"
            value={project.tech_debt_risk}
            colorMap={{
              high: 'bg-red-500/20 text-red-400',
              medium: 'bg-yellow-500/20 text-yellow-400',
              low: 'bg-green-500/20 text-green-400',
            }}
            labelMap={{
              high: 'High',
              medium: 'Medium',
              low: 'Low',
            }}
          />
          <AssessmentBadge
            label="Data Readiness"
            value={project.data_readiness}
            colorMap={{
              not_ready: 'bg-red-500/20 text-red-400',
              partial: 'bg-yellow-500/20 text-yellow-400',
              ready: 'bg-green-500/20 text-green-400',
            }}
            labelMap={{
              not_ready: 'Not Ready',
              partial: 'Partial',
              ready: 'Ready',
            }}
          />
        </div>
      </CollapsibleSection>

      {/* Problem Statement & Deliverables */}
      <CollapsibleSection
        title="Problem & Solution"
        icon={<Target className="w-4 h-4 text-red-400" />}
        isOpen={expandedSections.problem}
        onToggle={() => toggleSection('problem')}
      >
        <div className="space-y-4">
          {project.problem_statement && (
            <div>
              <p className="text-xs text-red-400 font-medium mb-1">THE PROBLEM</p>
              <p className="text-sm text-white bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                {project.problem_statement}
              </p>
            </div>
          )}

          {project.why_it_matters && (
            <div>
              <p className="text-xs text-blue-400 font-medium mb-1">WHY IT MATTERS</p>
              <p className="text-sm text-zinc-300">{project.why_it_matters}</p>
            </div>
          )}

          {project.deliverables && project.deliverables.length > 0 && (
            <div>
              <p className="text-xs text-green-400 font-medium mb-1">DELIVERABLES</p>
              <ul className="space-y-1">
                {project.deliverables.map((item, idx) => (
                  <li key={idx} className="text-sm text-white flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Human Transformation */}
      <CollapsibleSection
        title="Human Transformation"
        icon={<Users className="w-4 h-4 text-purple-400" />}
        isOpen={expandedSections.transformation}
        onToggle={() => toggleSection('transformation')}
      >
        <div className="space-y-4">
          {/* Before/After */}
          {(project.human_role_before || project.human_role_after) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <p className="text-xs text-red-400 font-medium mb-1">BEFORE</p>
                <p className="text-sm text-zinc-300">{project.human_role_before || 'Not defined'}</p>
              </div>
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                <p className="text-xs text-green-400 font-medium mb-1">AFTER</p>
                <p className="text-sm text-zinc-300">{project.human_role_after || 'Not defined'}</p>
              </div>
            </div>
          )}

          {/* Who is empowered */}
          {project.who_is_empowered && project.who_is_empowered.length > 0 && (
            <div>
              <p className="text-xs text-purple-400 font-medium mb-1">WHO IS EMPOWERED</p>
              <div className="flex flex-wrap gap-2">
                {project.who_is_empowered.map((who, idx) => (
                  <span key={idx} className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                    {who}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* New capabilities */}
          {project.new_capabilities && project.new_capabilities.length > 0 && (
            <div>
              <p className="text-xs text-cyan-400 font-medium mb-1">NEW CAPABILITIES</p>
              <ul className="space-y-1">
                {project.new_capabilities.map((cap, idx) => (
                  <li key={idx} className="text-sm text-zinc-300 flex items-start gap-2">
                    <Zap className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                    {cap}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Data Flow */}
      <CollapsibleSection
        title="Data Requirements"
        icon={<Database className="w-4 h-4 text-blue-400" />}
        isOpen={expandedSections.data}
        onToggle={() => toggleSection('data')}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {project.data_required && project.data_required.length > 0 && (
            <div className="bg-zinc-800/50 rounded-lg p-3">
              <p className="text-xs text-orange-400 font-medium mb-2">REQUIRES</p>
              <ul className="space-y-1">
                {project.data_required.map((item, idx) => (
                  <li key={idx} className="text-xs text-zinc-300">• {item}</li>
                ))}
              </ul>
            </div>
          )}
          {project.data_generates && project.data_generates.length > 0 && (
            <div className="bg-zinc-800/50 rounded-lg p-3">
              <p className="text-xs text-green-400 font-medium mb-2">GENERATES</p>
              <ul className="space-y-1">
                {project.data_generates.map((item, idx) => (
                  <li key={idx} className="text-xs text-zinc-300">• {item}</li>
                ))}
              </ul>
            </div>
          )}
          {project.data_improves && project.data_improves.length > 0 && (
            <div className="bg-zinc-800/50 rounded-lg p-3">
              <p className="text-xs text-blue-400 font-medium mb-2">IMPROVES</p>
              <ul className="space-y-1">
                {project.data_improves.map((item, idx) => (
                  <li key={idx} className="text-xs text-zinc-300">• {item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* API Endpoints */}
        {project.api_endpoints && project.api_endpoints.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-indigo-400 font-medium mb-2">API ENDPOINTS USED</p>
            <div className="flex flex-wrap gap-2">
              {project.api_endpoints.map((api, idx) => (
                <span key={idx} className="px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded text-xs font-mono">
                  {api}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Integrations Needed */}
        {project.integrations_needed && project.integrations_needed.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-pink-400 font-medium mb-2">INTEGRATIONS NEEDED</p>
            <div className="flex flex-wrap gap-2">
              {project.integrations_needed.map((int, idx) => (
                <span key={idx} className="px-2 py-1 bg-pink-500/20 text-pink-300 rounded text-xs">
                  {int}
                </span>
              ))}
            </div>
          </div>
        )}
      </CollapsibleSection>

      {/* Dependencies */}
      <CollapsibleSection
        title="Dependencies & Relationships"
        icon={<Link2 className="w-4 h-4 text-orange-400" />}
        isOpen={expandedSections.dependencies}
        onToggle={() => toggleSection('dependencies')}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {project.depends_on && project.depends_on.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="text-xs text-red-400 font-medium mb-2">DEPENDS ON</p>
              <ul className="space-y-1">
                {project.depends_on.map((dep, idx) => (
                  <li key={idx} className="text-xs text-zinc-300">• {dep}</li>
                ))}
              </ul>
            </div>
          )}
          {project.enables && project.enables.length > 0 && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
              <p className="text-xs text-green-400 font-medium mb-2">ENABLES</p>
              <ul className="space-y-1">
                {project.enables.map((en, idx) => (
                  <li key={idx} className="text-xs text-zinc-300">• {en}</li>
                ))}
              </ul>
            </div>
          )}
          {project.related_to && project.related_to.length > 0 && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
              <p className="text-xs text-blue-400 font-medium mb-2">RELATED TO</p>
              <ul className="space-y-1">
                {project.related_to.map((rel, idx) => (
                  <li key={idx} className="text-xs text-zinc-300">• {rel}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Prerequisites */}
        {project.prerequisites && project.prerequisites.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-amber-400 font-medium mb-2">PREREQUISITES</p>
            <ul className="space-y-1">
              {project.prerequisites.map((pre, idx) => (
                <li key={idx} className="text-sm text-zinc-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  {pre}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CollapsibleSection>

      {/* Benefits */}
      <CollapsibleSection
        title="Expected Benefits"
        icon={<CheckCircle className="w-4 h-4 text-green-400" />}
        isOpen={expandedSections.benefits}
        onToggle={() => toggleSection('benefits')}
      >
        {project.benefits && project.benefits.length > 0 ? (
          <ul className="space-y-2">
            {project.benefits.map((benefit, idx) => (
              <li key={idx} className="text-sm text-white flex items-start gap-2 bg-green-500/10 p-2 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                {benefit}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500 italic">No benefits documented</p>
        )}

        {/* Automation Journey */}
        {(project.current_loa || project.potential_loa) && (
          <div className="mt-4 bg-zinc-800/50 rounded-lg p-3">
            <p className="text-xs text-zinc-400 font-medium mb-2">AUTOMATION JOURNEY</p>
            <div className="flex items-center gap-3">
              <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded text-xs">
                {project.current_loa || 'Unknown'}
              </span>
              <ArrowRight className="w-4 h-4 text-zinc-500" />
              <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">
                {project.potential_loa || 'Unknown'}
              </span>
            </div>
          </div>
        )}
      </CollapsibleSection>

      {/* Links */}
      {(project.prototype_url || project.notion_url) && (
        <div className="flex gap-3">
          {project.prototype_url && (
            <a
              href={project.prototype_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Prototype
            </a>
          )}
          {project.notion_url && (
            <a
              href={project.notion_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-zinc-700 text-zinc-300 rounded-lg text-sm hover:bg-zinc-600 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Notion Doc
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// Collapsible section component
function CollapsibleSection({
  title,
  icon,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-zinc-800/30 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 hover:bg-zinc-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium text-white">{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-zinc-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-zinc-400" />
        )}
      </button>
      {isOpen && <div className="p-3 pt-0 border-t border-zinc-700/50">{children}</div>}
    </div>
  );
}

// Assessment badge component for displaying pre-set values
function AssessmentBadge({
  label,
  value,
  colorMap,
  labelMap,
}: {
  label: string;
  value: string | null | undefined;
  colorMap: Record<string, string>;
  labelMap: Record<string, string>;
}) {
  const displayValue = value || 'Not set';
  const colorClass = value ? (colorMap[value] || 'bg-zinc-700 text-zinc-400') : 'bg-zinc-700 text-zinc-500';
  const displayLabel = value ? (labelMap[value] || value) : 'Not set';

  return (
    <div className="bg-zinc-800/50 rounded-lg p-2">
      <p className="text-[10px] text-zinc-500 uppercase mb-1">{label}</p>
      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}>
        {displayLabel}
      </span>
    </div>
  );
}
