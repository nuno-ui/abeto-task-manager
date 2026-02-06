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

  useEffect(() => {
    fetchDashboardData();
    // Get time-based greeting name
    const hour = new Date().getHours();
    // In a real app, this would come from user profile
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
        setProjects(projectsData.filter((p: Project) => !p.is_predicted));
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
      <div className="min-h-screen">
        <Header title="Home" />
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-[700px] bg-zinc-900 rounded-xl animate-pulse" />
            <div className="space-y-4">
              <div className="h-32 bg-zinc-900 rounded-xl animate-pulse" />
              <div className="h-48 bg-zinc-900 rounded-xl animate-pulse" />
              <div className="h-48 bg-zinc-900 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header title="Home" />

      <div className="p-6 space-y-6">
        {/* Personalized Greeting Bar */}
        <div className="flex items-center justify-between bg-gradient-to-r from-violet-900/30 via-blue-900/20 to-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              {getGreeting()}, {userName}! <span className="text-3xl">👋</span>
            </h1>
            <p className="text-zinc-400">
              {stats.inProgressTasks > 0
                ? `You have ${stats.inProgressTasks} task${stats.inProgressTasks > 1 ? 's' : ''} in progress. `
                : ''}
              {overdueTasks > 0 && (
                <span className="text-red-400">{overdueTasks} overdue. </span>
              )}
              {upcomingTasks > 0 && (
                <span className="text-yellow-400">{upcomingTasks} due this week.</span>
              )}
              {stats.inProgressTasks === 0 && overdueTasks === 0 && upcomingTasks === 0 && (
                <span>Let's see what you should work on today.</span>
              )}
            </p>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/projects"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Project
            </Link>
            <button
              onClick={() => setShowAIModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm rounded-lg transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Create with AI
            </button>
          </div>
        </div>

        {/* Main Content - Task Companion takes priority */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Task Companion - Main Feature (2/3 width) */}
          <div className="lg:col-span-2 h-[calc(100vh-280px)] min-h-[600px]">
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
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <FolderKanban className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-2xl font-bold text-white">{stats.activeProjects}</span>
                </div>
                <p className="text-xs text-zinc-500">Active Projects</p>
              </Link>

              <Link
                href="/tasks"
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <ListTodo className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="text-2xl font-bold text-white">{tasksInProgress}</span>
                </div>
                <p className="text-xs text-zinc-500">Tasks In Progress</p>
              </Link>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  </div>
                  <span className="text-2xl font-bold text-white">{completionRate}%</span>
                </div>
                <p className="text-xs text-zinc-500">Tasks Completed</p>
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

            {/* Alert Summary */}
            {(overdueTasks > 0 || stats.blockedTasks > 0 || criticalTasks > 0) && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-medium text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
                  Needs Attention
                </h3>
                <div className="space-y-2">
                  {overdueTasks > 0 && (
                    <div className="flex items-center justify-between p-2 bg-red-900/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-red-400" />
                        <span className="text-sm text-red-300">Overdue Tasks</span>
                      </div>
                      <span className="text-sm font-bold text-red-400">{overdueTasks}</span>
                    </div>
                  )}
                  {stats.blockedTasks > 0 && (
                    <div className="flex items-center justify-between p-2 bg-yellow-900/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm text-yellow-300">Blocked Tasks</span>
                      </div>
                      <span className="text-sm font-bold text-yellow-400">{stats.blockedTasks}</span>
                    </div>
                  )}
                  {criticalTasks > 0 && (
                    <div className="flex items-center justify-between p-2 bg-orange-900/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-orange-400" />
                        <span className="text-sm text-orange-300">Critical Path</span>
                      </div>
                      <span className="text-sm font-bold text-orange-400">{criticalTasks}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* AI Opportunities */}
            {highAIPotential > 0 && (
              <div className="bg-gradient-to-br from-violet-900/30 to-zinc-900 border border-violet-800/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-violet-400" />
                    AI Opportunities
                  </h3>
                  <Link href="/tasks?ai_potential=high" className="text-xs text-violet-400 hover:text-violet-300">
                    View all
                  </Link>
                </div>
                <p className="text-sm text-zinc-400 mb-3">
                  <span className="text-violet-300 font-bold">{highAIPotential}</span> tasks can be accelerated with AI assistance
                </p>
                <div className="p-3 bg-zinc-900/50 rounded-lg">
                  <p className="text-xs text-zinc-500 mb-1">Potential time savings</p>
                  <p className="text-lg font-bold text-violet-300">Up to 40% faster</p>
                </div>
              </div>
            )}

            {/* Priority Projects */}
            {priorityProjects.length > 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-white flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-400" />
                    Active Projects
                  </h3>
                  <Link href="/projects" className="text-xs text-blue-400 hover:text-blue-300">
                    View all
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

            {/* Quick Actions */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-400" />
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Link
                  href="/reviews"
                  className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-yellow-500/20">
                    <Star className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white group-hover:text-yellow-300 transition-colors">
                      Start Review
                    </p>
                    <p className="text-xs text-zinc-500">Review pending projects</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-yellow-400 transition-colors" />
                </Link>

                <Link
                  href="/tasks?status=blocked"
                  className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-orange-500/20">
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white group-hover:text-orange-300 transition-colors">
                      Unblock Tasks
                    </p>
                    <p className="text-xs text-zinc-500">Resolve blockers</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-orange-400 transition-colors" />
                </Link>

                <Link
                  href="/team"
                  className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <Users className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white group-hover:text-green-300 transition-colors">
                      Team Workload
                    </p>
                    <p className="text-xs text-zinc-500">Manage assignments</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-green-400 transition-colors" />
                </Link>
              </div>
            </div>

            {/* Weekly Summary */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
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
