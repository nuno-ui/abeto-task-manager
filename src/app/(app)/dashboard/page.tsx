'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FolderKanban,
  ListTodo,
  CheckCircle2,
  Clock,
  TrendingUp,
  Users,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Badge, ProgressBar } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import type { Project, Task, ActivityLog } from '@/types/database';
import { formatRelativeTime } from '@/lib/utils';

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalTasks: number;
  completedTasks: number;
  blockedTasks: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    blockedTasks: 0,
  });
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Use API route to bypass RLS
      const response = await fetch('/api/dashboard');

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();

      setStats(data.stats);
      setRecentProjects(data.recentProjects || []);
      setRecentActivity(data.recentActivity || []);
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
  }: {
    icon: React.ElementType;
    label: string;
    value: number | string;
    subValue?: string;
    color: string;
  }) => (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
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

  return (
    <div className="min-h-screen">
      <Header title="Dashboard" />

      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={FolderKanban}
            label="Total Projects"
            value={stats.totalProjects}
            subValue={`${stats.activeProjects} active`}
            color="bg-blue-500/20 text-blue-400"
          />
          <StatCard
            icon={ListTodo}
            label="Total Tasks"
            value={stats.totalTasks}
            color="bg-purple-500/20 text-purple-400"
          />
          <StatCard
            icon={CheckCircle2}
            label="Completed Tasks"
            value={stats.completedTasks}
            subValue={`${stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}% completion rate`}
            color="bg-green-500/20 text-green-400"
          />
          <StatCard
            icon={AlertTriangle}
            label="Blocked Tasks"
            value={stats.blockedTasks}
            color="bg-red-500/20 text-red-400"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Projects */}
          <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <h2 className="font-semibold text-white">Recent Projects</h2>
              <Link
                href="/projects"
                className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="p-4 space-y-3">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-zinc-800 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : recentProjects.length === 0 ? (
                <p className="text-sm text-zinc-500 text-center py-8">
                  No projects yet. Create your first project!
                </p>
              ) : (
                recentProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.slug}`}
                    className="block p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white truncate">
                          {project.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="status" value={project.status}>
                            {project.status.replace('_', ' ')}
                          </Badge>
                          <Badge variant="priority" value={project.priority}>
                            {project.priority}
                          </Badge>
                        </div>
                      </div>
                      <div className="ml-4">
                        <ProgressBar
                          value={project.progress_percentage}
                          size="sm"
                          className="w-20"
                        />
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <h2 className="font-semibold text-white">Recent Activity</h2>
              <Link
                href="/activity"
                className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-12 bg-zinc-800 rounded animate-pulse" />
                  ))}
                </div>
              ) : recentActivity.length === 0 ? (
                <p className="text-sm text-zinc-500 text-center py-8">
                  No activity yet
                </p>
              ) : (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-zinc-300">
                        <span className="font-medium text-white">
                          {activity.user?.full_name || 'Someone'}
                        </span>{' '}
                        {activity.description || `${activity.action} a ${activity.entity_type}`}
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {formatRelativeTime(activity.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
