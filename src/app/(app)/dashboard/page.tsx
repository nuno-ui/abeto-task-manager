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
  Users,
  Lightbulb,
  MessageCircle,
  Bot,
  Brain,
  Bell,
  Shield,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
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
  const [pendingReviews, setPendingReviews] = useState(0);

  useEffect(() => {
    fetchDashboardData();
    setUserName('Nuno');
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch dashboard stats
      const dashboardResponse = await fetch('/api/dashboard');
      if (!dashboardResponse.ok) throw new Error('Failed to fetch dashboard data');
      const dashboardData = await dashboardResponse.json();

      setStats(dashboardData.stats);
      setUpcomingTasks(dashboardData.upcomingTasks || 0);
      setOverdueTasks(dashboardData.overdueTasks || 0);
      setAvgProjectProgress(dashboardData.avgProjectProgress || 0);

      // Fetch all projects
      const projectsResponse = await fetch('/api/projects');
      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json();
        const nonPredicted = projectsData.filter((p: Project) => !p.is_predicted);
        setProjects(nonPredicted);

        // Calculate pending reviews (projects in planning or in_progress without reviews)
        const needsReview = nonPredicted.filter((p: Project) =>
          (p.status === 'planning' || p.status === 'in_progress') &&
          !p.pain_point_level
        ).length;
        setPendingReviews(needsReview);
      }

      // Fetch all tasks
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

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Calculate key metrics
  const criticalTasks = tasks.filter(t => t.is_critical_path && t.status !== 'completed').length;
  const highAIPotential = tasks.filter(t => t.ai_potential === 'high' && t.status !== 'completed').length;
  const tasksInProgress = tasks.filter(t => t.status === 'in_progress').length;
  const completionRate = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;

  // Calculate cross-team blockers (blocked tasks that may affect other teams)
  const crossTeamBlockers = tasks.filter(t =>
    t.status === 'blocked' && t.is_critical_path
  ).length;

  // Get top priority projects (in progress, sorted by priority)
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
        <Header title="My Workspace" />
        <div className="p-6">
          <div className="h-48 bg-zinc-900 rounded-2xl animate-pulse mb-6" />
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
      <Header title="My Workspace" />

      <div className="p-6 space-y-6">
        {/* Hero Welcome Section with Robot */}
        <div className="relative overflow-hidden bg-gradient-to-br from-violet-900/40 via-blue-900/30 to-zinc-900 border border-violet-800/30 rounded-2xl">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl" />
          </div>

          <div className="relative p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Robot Mascot */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-violet-500/30">
                    <Bot className="w-12 h-12 md:w-16 md:h-16 text-white" />
                  </div>
                  {/* Status indicator */}
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-zinc-950 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>

              {/* Welcome Message & Companion Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-violet-300 bg-violet-900/50 px-3 py-1 rounded-full">
                    AI-Powered Assistant
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  {getGreeting()}, {userName}! 👋
                </h1>
                <p className="text-zinc-300 text-base md:text-lg leading-relaxed max-w-2xl">
                  I'm your <span className="text-violet-300 font-semibold">Task Companion</span> — your AI-powered assistant for everything task-related at Abeto.
                  I can help you prioritize work, track deadlines, spot blockers across teams, remind you about pending reviews, and keep your projects on track.
                </p>

                {/* Quick Insight Pills */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {overdueTasks > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-900/40 border border-red-800/50 rounded-full">
                      <Clock className="w-4 h-4 text-red-400" />
                      <span className="text-sm text-red-300">{overdueTasks} overdue</span>
                    </div>
                  )}
                  {pendingReviews > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-900/40 border border-yellow-800/50 rounded-full">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-yellow-300">{pendingReviews} need review</span>
                    </div>
                  )}
                  {crossTeamBlockers > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-900/40 border border-orange-800/50 rounded-full">
                      <Shield className="w-4 h-4 text-orange-400" />
                      <span className="text-sm text-orange-300">{crossTeamBlockers} critical blockers</span>
                    </div>
                  )}
                  {tasksInProgress > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-900/40 border border-blue-800/50 rounded-full">
                      <TrendingUp className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-blue-300">{tasksInProgress} in progress</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions - Desktop */}
              <div className="hidden lg:flex flex-col gap-2">
                <Link
                  href="/projects"
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur text-white text-sm rounded-xl transition-all hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                  New Project
                </Link>
                <button
                  onClick={() => setShowAIModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm rounded-xl transition-all hover:scale-105 shadow-lg shadow-violet-500/30"
                >
                  <Sparkles className="w-4 h-4" />
                  Create with AI
                </button>
                <Link
                  href="/reviews"
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur text-white text-sm rounded-xl transition-all hover:scale-105"
                >
                  <Star className="w-4 h-4" />
                  Start Review
                </Link>
              </div>
            </div>

            {/* Companion Capabilities */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <div className="p-2 bg-violet-500/20 rounded-lg">
                  <MessageCircle className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Ask Anything</p>
                  <p className="text-xs text-zinc-400">Natural language chat</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Brain className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Smart Insights</p>
                  <p className="text-xs text-zinc-400">AI recommendations</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <Bell className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Proactive Alerts</p>
                  <p className="text-xs text-zinc-400">Never miss deadlines</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Users className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Cross-Team View</p>
                  <p className="text-xs text-zinc-400">Spot blockers early</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Task Companion + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Task Companion - Main Feature (2/3 width) */}
          <div className="lg:col-span-2 h-[calc(100vh-500px)] min-h-[500px]">
            <TaskCompanion
              tasks={tasks}
              projects={projects}
              userArea="all"
              userName={userName}
            />
          </div>

          {/* Right Sidebar - Quick Stats & Info (1/3 width) */}
          <div className="space-y-5">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/projects"
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-violet-700/50 hover:bg-zinc-900/80 transition-all group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                    <FolderKanban className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-2xl font-bold text-white">{stats.activeProjects}</span>
                </div>
                <p className="text-xs text-zinc-500">Active Projects</p>
              </Link>

              <Link
                href="/tasks"
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-violet-700/50 hover:bg-zinc-900/80 transition-all group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
                    <ListTodo className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="text-2xl font-bold text-white">{tasksInProgress}</span>
                </div>
                <p className="text-xs text-zinc-500">In Progress</p>
              </Link>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  </div>
                  <span className="text-2xl font-bold text-white">{completionRate}%</span>
                </div>
                <p className="text-xs text-zinc-500">Completed</p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-cyan-500/20">
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                  </div>
                  <span className="text-2xl font-bold text-white">{avgProjectProgress}%</span>
                </div>
                <p className="text-xs text-zinc-500">Avg Progress</p>
              </div>
            </div>

            {/* Needs Attention */}
            {(overdueTasks > 0 || stats.blockedTasks > 0 || criticalTasks > 0 || pendingReviews > 0) && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
                  Needs Your Attention
                </h3>
                <div className="space-y-2">
                  {overdueTasks > 0 && (
                    <Link href="/tasks?overdue=true" className="flex items-center justify-between p-2.5 bg-red-900/20 hover:bg-red-900/30 rounded-lg transition-colors group">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-red-400" />
                        <span className="text-sm text-red-300">Overdue Tasks</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-red-400">{overdueTasks}</span>
                        <ArrowRight className="w-4 h-4 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Link>
                  )}
                  {pendingReviews > 0 && (
                    <Link href="/reviews" className="flex items-center justify-between p-2.5 bg-yellow-900/20 hover:bg-yellow-900/30 rounded-lg transition-colors group">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm text-yellow-300">Pending Reviews</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-yellow-400">{pendingReviews}</span>
                        <ArrowRight className="w-4 h-4 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Link>
                  )}
                  {stats.blockedTasks > 0 && (
                    <Link href="/tasks?status=blocked" className="flex items-center justify-between p-2.5 bg-orange-900/20 hover:bg-orange-900/30 rounded-lg transition-colors group">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-400" />
                        <span className="text-sm text-orange-300">Blocked Tasks</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-orange-400">{stats.blockedTasks}</span>
                        <ArrowRight className="w-4 h-4 text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Link>
                  )}
                  {criticalTasks > 0 && (
                    <Link href="/tasks?critical=true" className="flex items-center justify-between p-2.5 bg-violet-900/20 hover:bg-violet-900/30 rounded-lg transition-colors group">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-violet-400" />
                        <span className="text-sm text-violet-300">Critical Path</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-violet-400">{criticalTasks}</span>
                        <ArrowRight className="w-4 h-4 text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* AI Opportunities */}
            {highAIPotential > 0 && (
              <div className="bg-gradient-to-br from-violet-900/30 to-zinc-900 border border-violet-800/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-violet-400" />
                    AI Opportunities
                  </h3>
                  <Link href="/tasks?ai_potential=high" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
                    View all <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                <p className="text-sm text-zinc-400 mb-3">
                  <span className="text-violet-300 font-bold">{highAIPotential}</span> tasks can be accelerated with AI
                </p>
                <div className="p-3 bg-zinc-900/50 rounded-lg border border-violet-800/20">
                  <p className="text-xs text-zinc-500 mb-1">Potential time savings</p>
                  <p className="text-lg font-bold text-violet-300">Up to 40% faster</p>
                </div>
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
                  <Link href="/projects" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                    View all <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="space-y-2">
                  {priorityProjects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.slug}`}
                      className="block p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors group"
                    >
                      <div className="flex items-center justify-between mb-2">
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
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-zinc-800/50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-400">{upcomingTasks}</p>
                  <p className="text-xs text-zinc-500">Due Soon</p>
                </div>
                <div className="text-center p-3 bg-zinc-800/50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-400">{stats.inReviewTasks}</p>
                  <p className="text-xs text-zinc-500">In Review</p>
                </div>
              </div>
            </div>
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
