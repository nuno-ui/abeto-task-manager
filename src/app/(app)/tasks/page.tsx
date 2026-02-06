'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { TaskCard } from '@/components/tasks/TaskCard';
import { Badge } from '@/components/ui';
import { ChevronDown, ChevronUp, X, Filter, Layers, ArrowUpDown } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string | null;
  phase: string;
  status: string;
  difficulty: string;
  ai_potential: string | null;
  ai_assist_description: string | null;
  tools_needed: string[] | null;
  knowledge_areas: string[] | null;
  acceptance_criteria: string[] | null;
  success_metrics: string[] | null;
  risks: string[] | null;
  is_foundational: boolean;
  is_critical_path: boolean;
  estimated_hours: string | null;
  order_index: number;
  owner_team: { id: string; name: string; color: string } | null;
  project: { id: string; title: string; slug: string; pillar_id: string | null; pillar: { id: string; name: string; color: string } | null } | null;
}

interface Team {
  id: string;
  name: string;
  color: string;
}

interface Pillar {
  id: string;
  name: string;
  color: string;
}

interface Project {
  id: string;
  title: string;
  slug: string;
}

interface Filters {
  phase: string;
  status: string;
  difficulty: string;
  ai_potential: string;
  owner_team_id: string;
  pillar_id: string;
  project_id: string;
}

function TasksPageContent() {
  const searchParams = useSearchParams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [chartDistribution, setChartDistribution] = useState<'phase' | 'status' | 'difficulty' | 'ai_potential'>('phase');
  const [sortBy, setSortBy] = useState<'title' | 'phase' | 'status' | 'difficulty' | 'project'>('phase');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Initialize filters from URL params
  const [filters, setFilters] = useState<Filters>({
    phase: searchParams.get('phase') || 'all',
    status: searchParams.get('status') || 'all',
    difficulty: searchParams.get('difficulty') || 'all',
    ai_potential: searchParams.get('ai_potential') || 'all',
    owner_team_id: searchParams.get('owner_team_id') || 'all',
    pillar_id: searchParams.get('pillar_id') || 'all',
    project_id: searchParams.get('project_id') || 'all',
  });

  // Filter options
  const phases = ['discovery', 'planning', 'development', 'testing', 'training', 'rollout', 'monitoring'];
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'not_started', label: 'Not Started' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'blocked', label: 'Blocked' },
    { value: 'in_review', label: 'In Review' },
    { value: 'completed', label: 'Completed' },
  ];
  const difficultyOptions = [
    { value: 'all', label: 'All Difficulties' },
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' },
  ];
  const aiPotentialOptions = [
    { value: 'all', label: 'All AI Potential' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
    { value: 'none', label: 'None' },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, teamsRes, pillarsRes, projectsRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/teams'),
        fetch('/api/pillars'),
        fetch('/api/projects'),
      ]);

      if (tasksRes.ok) setTasks(await tasksRes.json());
      if (teamsRes.ok) setTeams(await teamsRes.json());
      if (pillarsRes.ok) setPillars(await pillarsRes.json());
      if (projectsRes.ok) setProjects(await projectsRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sort options for tasks
  const sortOptions = [
    { value: 'phase', label: 'Phase' },
    { value: 'status', label: 'Status' },
    { value: 'title', label: 'Title' },
    { value: 'difficulty', label: 'Difficulty' },
    { value: 'project', label: 'Project' },
  ];

  // Filter and sort tasks client-side
  const filteredTasks = useMemo(() => {
    const phaseOrder = ['discovery', 'planning', 'development', 'testing', 'training', 'rollout', 'monitoring'];
    const statusOrder = ['not_started', 'in_progress', 'blocked', 'in_review', 'completed'];
    const difficultyOrder = ['easy', 'medium', 'hard'];

    const filtered = tasks.filter(task => {
      if (filters.phase !== 'all' && task.phase !== filters.phase) return false;
      if (filters.status !== 'all' && task.status !== filters.status) return false;
      if (filters.difficulty !== 'all' && task.difficulty !== filters.difficulty) return false;
      if (filters.ai_potential !== 'all' && task.ai_potential !== filters.ai_potential) return false;
      if (filters.owner_team_id !== 'all' && task.owner_team?.id !== filters.owner_team_id) return false;
      if (filters.pillar_id !== 'all' && task.project?.pillar_id !== filters.pillar_id) return false;
      if (filters.project_id !== 'all' && task.project?.id !== filters.project_id) return false;
      return true;
    });

    return filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'phase':
          comparison = phaseOrder.indexOf(a.phase) - phaseOrder.indexOf(b.phase);
          break;
        case 'status':
          comparison = statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
          break;
        case 'difficulty':
          comparison = difficultyOrder.indexOf(a.difficulty) - difficultyOrder.indexOf(b.difficulty);
          break;
        case 'project':
          comparison = (a.project?.title || '').localeCompare(b.project?.title || '');
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [tasks, filters, sortBy, sortOrder]);

  // Group tasks by phase
  const tasksByPhase = useMemo(() => {
    return phases.reduce((acc, phase) => {
      acc[phase] = filteredTasks.filter(t => t.phase === phase);
      return acc;
    }, {} as Record<string, Task[]>);
  }, [filteredTasks]);

  // Count active filters
  const activeFilterCount = Object.values(filters).filter(v => v !== 'all').length;

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      phase: 'all',
      status: 'all',
      difficulty: 'all',
      ai_potential: 'all',
      owner_team_id: 'all',
      pillar_id: 'all',
      project_id: 'all',
    });
  };

  // Update a single filter
  const updateFilter = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Get active filter chips for display
  const activeFilters = useMemo(() => {
    const chips: { key: keyof Filters; label: string; value: string }[] = [];

    if (filters.phase !== 'all') {
      chips.push({ key: 'phase', label: 'Phase', value: filters.phase });
    }
    if (filters.status !== 'all') {
      const opt = statusOptions.find(o => o.value === filters.status);
      chips.push({ key: 'status', label: 'Status', value: opt?.label || filters.status });
    }
    if (filters.difficulty !== 'all') {
      chips.push({ key: 'difficulty', label: 'Difficulty', value: filters.difficulty });
    }
    if (filters.ai_potential !== 'all') {
      chips.push({ key: 'ai_potential', label: 'AI', value: filters.ai_potential });
    }
    if (filters.owner_team_id !== 'all') {
      const team = teams.find(t => t.id === filters.owner_team_id);
      chips.push({ key: 'owner_team_id', label: 'Team', value: team?.name || 'Team' });
    }
    if (filters.pillar_id !== 'all') {
      const pillar = pillars.find(p => p.id === filters.pillar_id);
      chips.push({ key: 'pillar_id', label: 'Pillar', value: pillar?.name || 'Pillar' });
    }
    if (filters.project_id !== 'all') {
      const project = projects.find(p => p.id === filters.project_id);
      chips.push({ key: 'project_id', label: 'Project', value: project?.title || 'Project' });
    }

    return chips;
  }, [filters, teams, pillars, projects]);

  const phaseColors: Record<string, { bg: string; text: string }> = {
    discovery: { bg: 'bg-blue-500', text: 'text-blue-400' },
    planning: { bg: 'bg-purple-500', text: 'text-purple-400' },
    development: { bg: 'bg-amber-500', text: 'text-amber-400' },
    testing: { bg: 'bg-green-500', text: 'text-green-400' },
    training: { bg: 'bg-cyan-500', text: 'text-cyan-400' },
    rollout: { bg: 'bg-pink-500', text: 'text-pink-400' },
    monitoring: { bg: 'bg-indigo-500', text: 'text-indigo-400' },
  };

  return (
    <div className="min-h-screen">
      <div className="p-6 space-y-6">
        {/* Task Distribution Stats */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-medium text-zinc-400">Task Distribution</h3>
              <select
                value={chartDistribution}
                onChange={(e) => setChartDistribution(e.target.value as any)}
                className="px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs text-white focus:outline-none"
              >
                <option value="phase">By Phase</option>
                <option value="status">By Status</option>
                <option value="difficulty">By Difficulty</option>
                <option value="ai_potential">By AI Potential</option>
              </select>
            </div>
            <span className="text-sm text-zinc-500">{tasks.length} total tasks</span>
          </div>
          {/* Dynamic Distribution Chart */}
          {chartDistribution === 'phase' && (
            <>
              <div className="flex gap-1 h-3 rounded-full overflow-hidden bg-zinc-800">
                {phases.map(phase => {
                  const count = tasks.filter(t => t.phase === phase).length;
                  const percentage = tasks.length > 0 ? (count / tasks.length) * 100 : 0;
                  if (percentage === 0) return null;
                  return (
                    <div
                      key={phase}
                      className={`${phaseColors[phase]?.bg || 'bg-zinc-600'} transition-all cursor-pointer hover:opacity-80`}
                      style={{ width: `${percentage}%` }}
                      title={`${phase}: ${count} tasks (${Math.round(percentage)}%)`}
                      onClick={() => updateFilter('phase', filters.phase === phase ? 'all' : phase)}
                    />
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {phases.map(phase => {
                  const count = tasks.filter(t => t.phase === phase).length;
                  if (count === 0) return null;
                  return (
                    <button
                      key={phase}
                      onClick={() => updateFilter('phase', filters.phase === phase ? 'all' : phase)}
                      className={`text-xs px-2 py-1 rounded-md transition-colors ${
                        filters.phase === phase
                          ? 'bg-zinc-700 text-white'
                          : 'bg-zinc-800/50 hover:bg-zinc-800'
                      } ${phaseColors[phase]?.text || 'text-zinc-400'}`}
                    >
                      {phase}: {count}
                    </button>
                  );
                })}
              </div>
            </>
          )}
          {chartDistribution === 'status' && (
            <>
              <div className="flex gap-1 h-3 rounded-full overflow-hidden bg-zinc-800">
                {statusOptions.filter(s => s.value !== 'all').map(status => {
                  const count = tasks.filter(t => t.status === status.value).length;
                  const percentage = tasks.length > 0 ? (count / tasks.length) * 100 : 0;
                  if (percentage === 0) return null;
                  const colors: Record<string, string> = {
                    not_started: 'bg-zinc-500',
                    in_progress: 'bg-blue-500',
                    blocked: 'bg-red-500',
                    in_review: 'bg-yellow-500',
                    completed: 'bg-green-500',
                  };
                  return (
                    <div
                      key={status.value}
                      className={`${colors[status.value]} transition-all cursor-pointer hover:opacity-80`}
                      style={{ width: `${percentage}%` }}
                      title={`${status.label}: ${count} tasks (${Math.round(percentage)}%)`}
                      onClick={() => updateFilter('status', filters.status === status.value ? 'all' : status.value)}
                    />
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {statusOptions.filter(s => s.value !== 'all').map(status => {
                  const count = tasks.filter(t => t.status === status.value).length;
                  if (count === 0) return null;
                  const textColors: Record<string, string> = {
                    not_started: 'text-zinc-400',
                    in_progress: 'text-blue-400',
                    blocked: 'text-red-400',
                    in_review: 'text-yellow-400',
                    completed: 'text-green-400',
                  };
                  return (
                    <button
                      key={status.value}
                      onClick={() => updateFilter('status', filters.status === status.value ? 'all' : status.value)}
                      className={`text-xs px-2 py-1 rounded-md transition-colors ${
                        filters.status === status.value
                          ? 'bg-zinc-700 text-white'
                          : 'bg-zinc-800/50 hover:bg-zinc-800'
                      } ${textColors[status.value]}`}
                    >
                      {status.label}: {count}
                    </button>
                  );
                })}
              </div>
            </>
          )}
          {chartDistribution === 'difficulty' && (
            <>
              <div className="flex gap-1 h-3 rounded-full overflow-hidden bg-zinc-800">
                {difficultyOptions.filter(d => d.value !== 'all').map(diff => {
                  const count = tasks.filter(t => t.difficulty === diff.value).length;
                  const percentage = tasks.length > 0 ? (count / tasks.length) * 100 : 0;
                  if (percentage === 0) return null;
                  const colors: Record<string, string> = {
                    easy: 'bg-green-500',
                    medium: 'bg-yellow-500',
                    hard: 'bg-red-500',
                  };
                  return (
                    <div
                      key={diff.value}
                      className={`${colors[diff.value]} transition-all cursor-pointer hover:opacity-80`}
                      style={{ width: `${percentage}%` }}
                      title={`${diff.label}: ${count} tasks (${Math.round(percentage)}%)`}
                      onClick={() => updateFilter('difficulty', filters.difficulty === diff.value ? 'all' : diff.value)}
                    />
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {difficultyOptions.filter(d => d.value !== 'all').map(diff => {
                  const count = tasks.filter(t => t.difficulty === diff.value).length;
                  if (count === 0) return null;
                  const textColors: Record<string, string> = {
                    easy: 'text-green-400',
                    medium: 'text-yellow-400',
                    hard: 'text-red-400',
                  };
                  return (
                    <button
                      key={diff.value}
                      onClick={() => updateFilter('difficulty', filters.difficulty === diff.value ? 'all' : diff.value)}
                      className={`text-xs px-2 py-1 rounded-md transition-colors ${
                        filters.difficulty === diff.value
                          ? 'bg-zinc-700 text-white'
                          : 'bg-zinc-800/50 hover:bg-zinc-800'
                      } ${textColors[diff.value]}`}
                    >
                      {diff.label}: {count}
                    </button>
                  );
                })}
              </div>
            </>
          )}
          {chartDistribution === 'ai_potential' && (
            <>
              <div className="flex gap-1 h-3 rounded-full overflow-hidden bg-zinc-800">
                {aiPotentialOptions.filter(a => a.value !== 'all').map(ai => {
                  const count = tasks.filter(t => t.ai_potential === ai.value).length;
                  const percentage = tasks.length > 0 ? (count / tasks.length) * 100 : 0;
                  if (percentage === 0) return null;
                  const colors: Record<string, string> = {
                    high: 'bg-green-500',
                    medium: 'bg-yellow-500',
                    low: 'bg-orange-500',
                    none: 'bg-zinc-500',
                  };
                  return (
                    <div
                      key={ai.value}
                      className={`${colors[ai.value]} transition-all cursor-pointer hover:opacity-80`}
                      style={{ width: `${percentage}%` }}
                      title={`${ai.label}: ${count} tasks (${Math.round(percentage)}%)`}
                      onClick={() => updateFilter('ai_potential', filters.ai_potential === ai.value ? 'all' : ai.value)}
                    />
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {aiPotentialOptions.filter(a => a.value !== 'all').map(ai => {
                  const count = tasks.filter(t => t.ai_potential === ai.value).length;
                  if (count === 0) return null;
                  const textColors: Record<string, string> = {
                    high: 'text-green-400',
                    medium: 'text-yellow-400',
                    low: 'text-orange-400',
                    none: 'text-zinc-400',
                  };
                  return (
                    <button
                      key={ai.value}
                      onClick={() => updateFilter('ai_potential', filters.ai_potential === ai.value ? 'all' : ai.value)}
                      className={`text-xs px-2 py-1 rounded-md transition-colors ${
                        filters.ai_potential === ai.value
                          ? 'bg-zinc-700 text-white'
                          : 'bg-zinc-800/50 hover:bg-zinc-800'
                      } ${textColors[ai.value]}`}
                    >
                      {ai.label}: {count}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Filters Section */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4">
          {/* Primary Filters Row */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </div>

            {/* Phase */}
            <select
              value={filters.phase}
              onChange={(e) => updateFilter('phase', e.target.value)}
              className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              <option value="all">All Phases</option>
              {phases.map(phase => (
                <option key={phase} value={phase}>
                  {phase.charAt(0).toUpperCase() + phase.slice(1)}
                </option>
              ))}
            </select>

            {/* Status */}
            <select
              value={filters.status}
              onChange={(e) => updateFilter('status', e.target.value)}
              className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {/* Pillar (Business Area) */}
            <select
              value={filters.pillar_id}
              onChange={(e) => updateFilter('pillar_id', e.target.value)}
              className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              <option value="all">All Pillars</option>
              {pillars.map(pillar => (
                <option key={pillar.id} value={pillar.id}>{pillar.name}</option>
              ))}
            </select>

            {/* Toggle Advanced Filters */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              {showAdvancedFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              More Filters
            </button>

            {/* Sorting */}
            <div className="flex items-center gap-1 border-l border-zinc-700 pl-3 ml-auto">
              <ArrowUpDown className="w-4 h-4 text-zinc-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-2 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              >
                {sortOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-1.5 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 rounded-lg transition-colors"
                title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              >
                {sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {/* Clear All */}
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                <X className="w-4 h-4" />
                Clear All
              </button>
            )}
          </div>

          {/* Advanced Filters Row */}
          {showAdvancedFilters && (
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-zinc-800">
              {/* Difficulty */}
              <select
                value={filters.difficulty}
                onChange={(e) => updateFilter('difficulty', e.target.value)}
                className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              >
                {difficultyOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              {/* AI Potential */}
              <select
                value={filters.ai_potential}
                onChange={(e) => updateFilter('ai_potential', e.target.value)}
                className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              >
                {aiPotentialOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              {/* Team */}
              <select
                value={filters.owner_team_id}
                onChange={(e) => updateFilter('owner_team_id', e.target.value)}
                className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              >
                <option value="all">All Teams</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>

              {/* Project */}
              <select
                value={filters.project_id}
                onChange={(e) => updateFilter('project_id', e.target.value)}
                className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              >
                <option value="all">All Projects</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.title}</option>
                ))}
              </select>
            </div>
          )}

          {/* Active Filter Chips */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-3 border-t border-zinc-800">
              {activeFilters.map(chip => (
                <span
                  key={chip.key}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded-md text-xs"
                >
                  <span className="text-blue-300">{chip.label}:</span>
                  {chip.value}
                  <button
                    onClick={() => updateFilter(chip.key, 'all')}
                    className="ml-1 hover:text-blue-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-500">
            Showing {filteredTasks.length} of {tasks.length} tasks
          </p>
          {filters.project_id !== 'all' && (
            <div className="flex items-center gap-2 text-sm">
              <Layers className="w-4 h-4 text-blue-400" />
              <span className="text-zinc-400">
                Filtered by project: <span className="text-white">{projects.find(p => p.id === filters.project_id)?.title}</span>
              </span>
            </div>
          )}
        </div>

        {/* Tasks */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-24 bg-zinc-900 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900 border border-zinc-800 rounded-xl">
            <p className="text-zinc-500 mb-2">No tasks found matching your filters</p>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {phases.map(phase => {
              const phaseTasks = tasksByPhase[phase];
              if (phaseTasks.length === 0) return null;

              return (
                <div key={phase}>
                  <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Badge variant="phase" value={phase}>
                      {phase}
                    </Badge>
                    <span className="text-zinc-600">({phaseTasks.length})</span>
                  </h3>
                  <div className="grid gap-3">
                    {phaseTasks.map(task => (
                      <TaskCard
                        key={task.id}
                        task={task as any}
                        showProject
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TasksPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-zinc-800 rounded w-full" />
          <div className="h-64 bg-zinc-800 rounded" />
        </div>
      </div>
    }>
      <TasksPageContent />
    </Suspense>
  );
}
