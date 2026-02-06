'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FolderKanban,
  ListTodo,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Plus,
  Star,
  Clock,
  TrendingUp,
  Zap,
  Calendar,
  Target,
  Bot,
} from 'lucide-react';
import { Badge, ProgressBar } from '@/components/ui';
import { AIProjectCreator } from '@/components/projects/AIProjectCreator';
import { TaskCompanion } from '@/components/ai/TaskCompanion';
import type { Project, Task } from '@/types/database';

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalTasks: number;
  completedTasks: number;
  blockedTasks: number;
  inProgressTasks: number;
  inReviewTasks: number;
}

interface ProjectWithTasks extends Project {
  tasks?: Task[];
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
  const [projects, setProjects] = useState<ProjectWithTasks[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState(0);
  const [overdueTasks, setOverdueTasks] = useState(0);
  const [avgProjectProgress, setAvgProjectProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAIModal, setShowAIModal] = useState(false);
  const [userName, setUserName] = useState('there');
  const [userArea, setUserArea] = useState<string>('all');
  const [pendingReviews, setPendingReviews] = useState(0);

  useEffect(() => {
    fetchDashboardData();
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        if (data.user?.full_name) {
          // Get first name only
          const firstName = data.user.full_name.split(' ')[0];
          setUserName(firstName);
        }
        if (data.preferredArea) {
          setUserArea(data.preferredArea);
        }
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const dashboardResponse = await fetch('/api/dashboard');
      if (!dashboardResponse.ok) throw new Error('Failed to fetch dashboard data');
      const dashboardData = await dashboardResponse.json();

      setStats(dashboardData.stats);
      setUpcomingTasks(dashboardData.upcomingTasks || 0);
      setOverdueTasks(dashboardData.overdueTasks || 0);
      setAvgProjectProgress(dashboardData.avgProjectProgress || 0);

      const projectsResponse = await fetch('/api/projects');
      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json();
        const nonPredicted = projectsData.filter((p: Project) => !p.is_predicted);
        setProjects(nonPredicted);

        const needsReview = nonPredicted.filter((p: Project) =>
          (p.status === 'planning' || p.status === 'in_progress') && !p.pain_point_level
        ).length;
        setPendingReviews(needsReview);
      }

      const tasksResponse = await fetch('/api/tasks');
      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json();
        setTasks(tasksData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const criticalTasks = tasks.filter(t => t.is_critical_path && t.status !== 'completed').length;
  const highAIPotential = tasks.filter(t => t.ai_potential === 'high' && t.status !== 'completed').length;
  const tasksInProgress = tasks.filter(t => t.status === 'in_progress').length;
  const completionRate = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;

  const crossTeamBlockers = tasks.filter(t => t.status === 'blocked' && t.is_critical_path).length;

  const priorityProjects = projects
    .filter(p => p.status === 'in_progress')
    .sort((a, b) => {
      const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
      return (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3);
    })
    .slice(0, 4);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-[600px] bg-zinc-900 rounded-2xl animate-pulse" />
            <div className="space-y-4">
              <div className="h-32 bg-zinc-900 rounded-2xl animate-pulse" />
              <div className="h-48 bg-zinc-900 rounded-2xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="p-6 space-y-5">
        {/* Compact Welcome Bar */}
        <div className="flex items-center justify-between bg-gradient-to-r from-violet-900/30 via-blue-900/20 to-zinc-900 border border-violet-800/30 rounded-xl px-5 py-4">
          <div className="flex items-center gap-4">
            {/* Robot Icon */}
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-zinc-950" />
            </div>

            {/* Greeting & Status */}
            <div>
              <h1 className="text-lg font-semibold text-white">
                {getGreeting()}, {userName}!
              </h1>
              <p className="text-sm text-zinc-400">
                Your Task Companion is ready to help
                {(overdueTasks > 0 || pendingReviews > 0 || crossTeamBlockers > 0) && (
                  <span className="text-orange-400"> • {overdueTasks + pendingReviews + crossTeamBlockers} items need attention</span>
                )}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/projects"
              className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Project
            </Link>
            <button
              onClick={() => setShowAIModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm rounded-lg transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Create with AI
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Task Companion - Main Feature */}
          <div className="lg:col-span-2 h-[calc(100vh-220px)] min-h-[550px]">
            <TaskCompanion
              tasks={tasks}
              projects={projects}
              userArea={userArea}
              userName={userName}
            />
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/projects"
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 hover:border-violet-700/50 transition-all group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 rounded-lg bg-blue-500/20">
                    <FolderKanban className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <span className="text-xl font-bold text-white">{stats.activeProjects}</span>
                </div>
                <p className="text-xs text-zinc-500">Active Projects</p>
              </Link>

              <Link
                href="/tasks"
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 hover:border-violet-700/50 transition-all group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 rounded-lg bg-purple-500/20">
                    <ListTodo className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <span className="text-xl font-bold text-white">{tasksInProgress}</span>
                </div>
                <p className="text-xs text-zinc-500">In Progress</p>
              </Link>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 rounded-lg bg-green-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                  </div>
                  <span className="text-xl font-bold text-white">{completionRate}%</span>
                </div>
                <p className="text-xs text-zinc-500">Completed</p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 rounded-lg bg-cyan-500/20">
                    <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <span className="text-xl font-bold text-white">{avgProjectProgress}%</span>
                </div>
                <p className="text-xs text-zinc-500">Avg Progress</p>
              </div>
            </div>

            {/* Needs Attention */}
            {(overdueTasks > 0 || stats.blockedTasks > 0 || criticalTasks > 0 || pendingReviews > 0) && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-2">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
                  Needs Attention
                </h3>
                {overdueTasks > 0 && (
                  <Link href="/tasks?overdue=true" className="flex items-center justify-between p-2 bg-red-900/20 hover:bg-red-900/30 rounded-lg transition-colors group">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-red-400" />
                      <span className="text-sm text-red-300">Overdue</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold text-red-400">{overdueTasks}</span>
                      <ArrowRight className="w-3 h-3 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                )}
                {pendingReviews > 0 && (
                  <Link href="/reviews" className="flex items-center justify-between p-2 bg-yellow-900/20 hover:bg-yellow-900/30 rounded-lg transition-colors group">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-yellow-300">Pending Reviews</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold text-yellow-400">{pendingReviews}</span>
                      <ArrowRight className="w-3 h-3 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                )}
                {stats.blockedTasks > 0 && (
                  <Link href="/tasks?status=blocked" className="flex items-center justify-between p-2 bg-orange-900/20 hover:bg-orange-900/30 rounded-lg transition-colors group">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-400" />
                      <span className="text-sm text-orange-300">Blocked</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold text-orange-400">{stats.blockedTasks}</span>
                      <ArrowRight className="w-3 h-3 text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                )}
                {criticalTasks > 0 && (
                  <Link href="/tasks?critical=true" className="flex items-center justify-between p-2 bg-violet-900/20 hover:bg-violet-900/30 rounded-lg transition-colors group">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-violet-400" />
                      <span className="text-sm text-violet-300">Critical Path</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold text-violet-400">{criticalTasks}</span>
                      <ArrowRight className="w-3 h-3 text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                )}
              </div>
            )}

            {/* AI Opportunities */}
            {highAIPotential > 0 && (
              <div className="bg-gradient-to-br from-violet-900/30 to-zinc-900 border border-violet-800/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-violet-400" />
                    AI Opportunities
                  </h3>
                  <Link href="/tasks?ai_potential=high" className="text-xs text-violet-400 hover:text-violet-300">
                    View →
                  </Link>
                </div>
                <p className="text-sm text-zinc-400">
                  <span className="text-violet-300 font-bold">{highAIPotential}</span> tasks can be accelerated
                </p>
              </div>
            )}

            {/* Active Projects */}
            {priorityProjects.length > 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-400" />
                    Active Projects
                  </h3>
                  <Link href="/projects" className="text-xs text-blue-400 hover:text-blue-300">
                    View all →
                  </Link>
                </div>
                <div className="space-y-2">
                  {priorityProjects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.slug}`}
                      className="block p-2.5 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors group"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <h4 className="text-sm font-medium text-white truncate group-hover:text-blue-300 transition-colors">
                          {project.title}
                        </h4>
                        <Badge variant="priority" value={project.priority} className="text-[10px]">
                          {project.priority}
                        </Badge>
                      </div>
                      <ProgressBar value={project.progress_percentage} size="sm" showLabel />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* This Week */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                This Week
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center p-2.5 bg-zinc-800/50 rounded-lg">
                  <p className="text-xl font-bold text-blue-400">{upcomingTasks}</p>
                  <p className="text-xs text-zinc-500">Due Soon</p>
                </div>
                <div className="text-center p-2.5 bg-zinc-800/50 rounded-lg">
                  <p className="text-xl font-bold text-purple-400">{stats.inReviewTasks}</p>
                  <p className="text-xs text-zinc-500">In Review</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
