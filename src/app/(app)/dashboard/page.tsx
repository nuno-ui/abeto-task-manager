'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  FolderKanban,
  ListTodo,
  CheckCircle2,
  Users,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Target,
  Layers,
  Zap,
  AlertCircle,
  PieChart,
  Plus,
  Star,
  Clock,
  TrendingUp,
  BarChart3,
  Signal,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Badge, ProgressBar } from '@/components/ui';
import { AIProjectCreator } from '@/components/projects/AIProjectCreator';
import type { Project } from '@/types/database';

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalTasks: number;
  completedTasks: number;
  blockedTasks: number;
  inProgressTasks: number;
  inReviewTasks: number;
}

interface TeamStat {
  id: string;
  name: string;
  slug: string;
  color: string;
  projectCount: number;
  taskCount: number;
  completedTasks: number;
  inProgressTasks: number;
}

interface PillarStat {
  id: string;
  name: string;
  slug: string;
  color: string;
  projectCount: number;
  activeProjects: number;
  avgProgress: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    blockedTasks: 0,
    inProgressTasks: 0,
    inReviewTasks: 0,
  });
  const [projectsByStatus, setProjectsByStatus] = useState<Record<string, number>>({});
  const [projectsByPriority, setProjectsByPriority] = useState<Record<string, number>>({});
  const [tasksByPhase, setTasksByPhase] = useState<Record<string, number>>({});
  const [aiPotentialStats, setAiPotentialStats] = useState<Record<string, number>>({});
  const [teamStats, setTeamStats] = useState<TeamStat[]>([]);
  const [pillarStats, setPillarStats] = useState<PillarStat[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState(0);
  const [overdueTasks, setOverdueTasks] = useState(0);
  const [avgProjectProgress, setAvgProjectProgress] = useState(0);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentProjectsTab, setRecentProjectsTab] = useState<'recent' | 'complexity' | 'status' | 'progress'>('recent');
  const [showAIModal, setShowAIModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard');
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      const data = await response.json();

      setStats(data.stats);
      setProjectsByStatus(data.projectsByStatus || {});
      setProjectsByPriority(data.projectsByPriority || {});
      setTasksByPhase(data.tasksByPhase || {});
      setAiPotentialStats(data.aiPotentialStats || {});
      setTeamStats(data.teamStats || []);
      setPillarStats(data.pillarStats || []);
      setUpcomingTasks(data.upcomingTasks || 0);
      setOverdueTasks(data.overdueTasks || 0);
      setAvgProjectProgress(data.avgProjectProgress || 0);
      setRecentProjects(data.recentProjects || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({
    icon: Icon,
    label,
    value,
    subValue,
    color,
    href,
  }: {
    icon: React.ElementType;
    label: string;
    value: number | string;
    subValue?: string;
    color: string;
    href?: string;
  }) => {
    const content = (
      <div className={`bg-zinc-900 border border-zinc-800 rounded-xl p-5 ${href ? 'hover:border-zinc-700 transition-colors cursor-pointer' : ''}`}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-zinc-400 mb-1">{label}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
            {subValue && <p className="text-xs text-zinc-500 mt-1">{subValue}</p>}
          </div>
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </div>
    );

    return href ? <Link href={href}>{content}</Link> : content;
  };

  // Sort projects based on selected tab
  const difficultyOrder: Record<string, number> = { hard: 3, medium: 2, easy: 1 };
  const statusOrder: Record<string, number> = { in_progress: 1, planning: 2, idea: 3, on_hold: 4, completed: 5 };

  const sortedRecentProjects = useMemo(() => {
    const projects = [...recentProjects];
    switch (recentProjectsTab) {
      case 'complexity':
        return projects.sort((a, b) => (difficultyOrder[b.difficulty] || 0) - (difficultyOrder[a.difficulty] || 0));
      case 'status':
        return projects.sort((a, b) => (statusOrder[a.status] || 10) - (statusOrder[b.status] || 10));
      case 'progress':
        return projects.sort((a, b) => (b.progress_percentage || 0) - (a.progress_percentage || 0));
      default:
        return projects;
    }
  }, [recentProjects, recentProjectsTab]);

  const phaseColors: Record<string, string> = {
    discovery: '#3b82f6',
    planning: '#8b5cf6',
    development: '#f59e0b',
    testing: '#10b981',
    training: '#06b6d4',
    rollout: '#ec4899',
    monitoring: '#6366f1',
  };

  const priorityColors: Record<string, string> = {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#eab308',
    low: '#22c55e',
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header title="Dashboard" />
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-zinc-900 rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 bg-zinc-900 rounded-xl animate-pulse" />
            <div className="h-96 bg-zinc-900 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header title="Dashboard" />

      <div className="p-6 space-y-6">
        {/* Quick Actions Bar */}
        <div className="flex items-center justify-between bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-400">Quick Actions:</span>
            <Link
              href="/projects"
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Project
            </Link>
            <button
              onClick={() => setShowAIModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-sm rounded-lg transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              New with AI
            </button>
            <Link
              href="/reviews"
              className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded-lg transition-colors"
            >
              <Star className="w-4 h-4 text-yellow-400" />
              Start Review
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-zinc-400">{stats.activeProjects} active projects</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-zinc-500" />
              <span className="text-zinc-400">{stats.inProgressTasks} tasks in progress</span>
            </div>
            {stats.totalTasks > 0 && (
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-green-400">
                  {Math.round((stats.completedTasks / stats.totalTasks) * 100)}% complete
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Top Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={FolderKanban}
            label="Total Projects"
            value={stats.totalProjects}
            subValue={`${stats.activeProjects} in progress`}
            color="bg-blue-500/20 text-blue-400"
            href="/projects"
          />
          <StatCard
            icon={ListTodo}
            label="Total Tasks"
            value={stats.totalTasks}
            subValue={`${stats.inProgressTasks} in progress`}
            color="bg-purple-500/20 text-purple-400"
            href="/tasks"
          />
          <StatCard
            icon={CheckCircle2}
            label="Completion Rate"
            value={`${stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%`}
            subValue={`${stats.completedTasks} of ${stats.totalTasks} tasks`}
            color="bg-green-500/20 text-green-400"
          />
          <StatCard
            icon={Target}
            label="Avg Progress"
            value={`${avgProjectProgress}%`}
            subValue="across all projects"
            color="bg-cyan-500/20 text-cyan-400"
          />
        </div>

        {/* Alert Row */}
        {(overdueTasks > 0 || stats.blockedTasks > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {overdueTasks > 0 && (
              <div className="bg-red-900/20 border border-red-900/30 rounded-xl p-4 flex items-center gap-4">
                <div className="p-3 bg-red-500/20 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <p className="text-lg font-bold text-red-400">{overdueTasks} Overdue Tasks</p>
                  <p className="text-sm text-zinc-400">Need immediate attention</p>
                </div>
              </div>
            )}
            {stats.blockedTasks > 0 && (
              <div className="bg-orange-900/20 border border-orange-900/30 rounded-xl p-4 flex items-center gap-4">
                <div className="p-3 bg-orange-500/20 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <p className="text-lg font-bold text-orange-400">{stats.blockedTasks} Blocked Tasks</p>
                  <p className="text-sm text-zinc-400">Waiting for resolution</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Projects Overview */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl">
              <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                <h2 className="font-semibold text-white flex items-center gap-2">
                  <FolderKanban className="w-5 h-5 text-blue-400" />
                  Projects Overview
                </h2>
                <Link
                  href="/projects"
                  className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  View all <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              {/* Sub-tabs for sorting */}
              <div className="flex gap-1 px-4 pt-3 pb-1">
                {[
                  { key: 'recent', label: 'Recent', icon: Clock },
                  { key: 'complexity', label: 'Complexity', icon: BarChart3 },
                  { key: 'status', label: 'Status', icon: Signal },
                  { key: 'progress', label: 'Progress', icon: TrendingUp },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setRecentProjectsTab(tab.key as any)}
                    className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-md transition-colors ${
                      recentProjectsTab === tab.key
                        ? 'bg-zinc-700 text-white'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    <tab.icon className="w-3 h-3" />
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="p-4 space-y-3">
                {recentProjects.length === 0 ? (
                  <p className="text-sm text-zinc-500 text-center py-8">
                    No projects yet. Create your first project!
                  </p>
                ) : (
                  sortedRecentProjects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.slug}`}
                      className="block p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-white truncate">{project.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span title="Status: Current project state">
                              <Badge variant="status" value={project.status}>
                                {project.status.replace('_', ' ')}
                              </Badge>
                            </span>
                            <span title="Priority: Importance level">
                              <Badge variant="priority" value={project.priority}>
                                {project.priority}
                              </Badge>
                            </span>
                            {project.pillar && (
                              <span
                                className="w-2 h-2 rounded-full cursor-help"
                                style={{ backgroundColor: project.pillar.color }}
                                title={`Business Area: ${project.pillar.name}`}
                              />
                            )}
                          </div>
                        </div>
                        <div className="ml-4 w-24">
                          <ProgressBar value={project.progress_percentage} size="sm" showLabel />
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>

            {/* Tasks by Phase */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl">
              <div className="p-4 border-b border-zinc-800">
                <h2 className="font-semibold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-purple-400" />
                  Tasks by Phase
                </h2>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {Object.entries(tasksByPhase).map(([phase, count]) => (
                    <div key={phase} className="flex items-center gap-3">
                      <div className="w-24 text-sm text-zinc-400 capitalize">{phase}</div>
                      <div className="flex-1 bg-zinc-800 rounded-full h-4 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${stats.totalTasks > 0 ? (count / stats.totalTasks) * 100 : 0}%`,
                            backgroundColor: phaseColors[phase],
                          }}
                        />
                      </div>
                      <div className="w-12 text-right text-sm font-medium text-white">{count}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Potential Distribution */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl">
              <div className="p-4 border-b border-zinc-800">
                <h2 className="font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  AI Potential Distribution
                </h2>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-green-400">{aiPotentialStats.high || 0}</p>
                    <p className="text-xs text-zinc-400">High</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-400">{aiPotentialStats.medium || 0}</p>
                    <p className="text-xs text-zinc-400">Medium</p>
                  </div>
                  <div className="text-center p-4 bg-red-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-red-400">{aiPotentialStats.low || 0}</p>
                    <p className="text-xs text-zinc-400">Low</p>
                  </div>
                  <div className="text-center p-4 bg-zinc-800 rounded-lg">
                    <p className="text-2xl font-bold text-zinc-400">{aiPotentialStats.none || 0}</p>
                    <p className="text-xs text-zinc-500">None</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-cyan-400" />
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-400">In Review</span>
                  <span className="text-sm font-medium text-blue-400">{stats.inReviewTasks}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-400">Due this week</span>
                  <span className="text-sm font-medium text-yellow-400">{upcomingTasks}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-400">Planning projects</span>
                  <span className="text-sm font-medium text-purple-400">{projectsByStatus.planning || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-400">Ideas in queue</span>
                  <span className="text-sm font-medium text-indigo-400">{projectsByStatus.idea || 0}</span>
                </div>
              </div>
            </div>

            {/* Projects by Priority */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-400" />
                By Priority
              </h3>
              <div className="space-y-2">
                {Object.entries(projectsByPriority).map(([priority, count]) => (
                  <div key={priority} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: priorityColors[priority] }}
                    />
                    <span className="text-sm text-zinc-400 capitalize flex-1">{priority}</span>
                    <span className="text-sm font-medium text-white">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pillars Overview */}
            {pillarStats.length > 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-violet-400" />
                  Pillars
                </h3>
                <div className="space-y-3">
                  {pillarStats.map((pillar) => (
                    <div key={pillar.id} className="p-3 bg-zinc-800/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: pillar.color }}
                        />
                        <span className="text-sm font-medium text-white">{pillar.name}</span>
                      </div>
                      <div className="flex justify-between text-xs text-zinc-400">
                        <span>{pillar.projectCount} projects</span>
                        <span>{pillar.avgProgress}% avg</span>
                      </div>
                      <div className="mt-2">
                        <ProgressBar value={pillar.avgProgress} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Team Workload */}
            {teamStats.filter(t => t.taskCount > 0).length > 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-400" />
                    Team Workload
                  </h3>
                  <Link href="/team" className="text-xs text-blue-400 hover:text-blue-300">
                    Manage
                  </Link>
                </div>
                <div className="space-y-3">
                  {teamStats
                    .filter(team => team.taskCount > 0)
                    .sort((a, b) => b.taskCount - a.taskCount)
                    .slice(0, 5)
                    .map((team) => (
                      <div key={team.id} className="flex items-center gap-3">
                        <div
                          className="w-2 h-8 rounded-full"
                          style={{ backgroundColor: team.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{team.name}</p>
                          <p className="text-xs text-zinc-500">
                            {team.taskCount} tasks ({team.completedTasks} done)
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-white">{team.projectCount}</p>
                          <p className="text-xs text-zinc-500">projects</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Project Creator Modal */}
      <AIProjectCreator
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        onProjectCreated={() => {
          setShowAIModal(false);
          fetchDashboardData();
        }}
      />
    </div>
  );
}
