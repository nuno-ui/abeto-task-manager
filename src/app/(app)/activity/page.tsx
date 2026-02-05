'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Avatar } from '@/components/ui';
import { Activity, FileText, CheckSquare, MessageSquare, Edit2, Plus, Trash2, ArrowRight, Clock, FolderOpen, ListTodo, TrendingUp, AlertCircle } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';

interface ActivityItem {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  project_id: string | null;
  task_id: string | null;
  details: any;
  created_at: string;
  user?: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  project?: {
    id: string;
    title: string;
    slug: string;
  };
  task?: {
    id: string;
    title: string;
  };
}

interface RecentItem {
  id: string;
  type: 'project' | 'task';
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
  slug?: string;
  project_slug?: string;
  project_title?: string;
  phase?: string;
}

const actionIcons: Record<string, any> = {
  created: Plus,
  updated: Edit2,
  deleted: Trash2,
  commented: MessageSquare,
  status_changed: ArrowRight,
};

const entityIcons: Record<string, any> = {
  project: FileText,
  task: CheckSquare,
  comment: MessageSquare,
};

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'projects' | 'tasks'>('all');

  useEffect(() => {
    fetchActivity();
    fetchRecentItems();
  }, []);

  const fetchActivity = async () => {
    try {
      const response = await fetch('/api/activity?limit=100');
      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      }
    } catch (error) {
      console.error('Error fetching activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentItems = async () => {
    try {
      // Fetch recent projects
      const projectsRes = await fetch('/api/projects');
      const tasksRes = await fetch('/api/tasks');

      const projects = projectsRes.ok ? await projectsRes.json() : [];
      const tasks = tasksRes.ok ? await tasksRes.json() : [];

      // Combine and sort by updated_at or created_at
      const items: RecentItem[] = [
        ...projects.slice(0, 20).map((p: any) => ({
          id: p.id,
          type: 'project' as const,
          title: p.title,
          status: p.status,
          created_at: p.created_at,
          updated_at: p.updated_at || p.created_at,
          slug: p.slug,
        })),
        ...tasks.slice(0, 30).map((t: any) => ({
          id: t.id,
          type: 'task' as const,
          title: t.title,
          status: t.status,
          created_at: t.created_at,
          updated_at: t.updated_at || t.created_at,
          project_slug: t.project?.slug,
          project_title: t.project?.title,
          phase: t.phase,
        })),
      ];

      // Sort by most recently updated
      items.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

      setRecentItems(items.slice(0, 50));
    } catch (error) {
      console.error('Error fetching recent items:', error);
    }
  };

  const getActionIcon = (action: string) => {
    const Icon = actionIcons[action] || Edit2;
    return <Icon className="w-4 h-4" />;
  };

  const getEntityIcon = (entityType: string) => {
    const Icon = entityIcons[entityType] || FileText;
    return <Icon className="w-4 h-4" />;
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created':
        return 'text-green-400 bg-green-400/10';
      case 'deleted':
        return 'text-red-400 bg-red-400/10';
      case 'updated':
      case 'status_changed':
        return 'text-blue-400 bg-blue-400/10';
      case 'commented':
        return 'text-violet-400 bg-violet-400/10';
      default:
        return 'text-zinc-400 bg-zinc-400/10';
    }
  };

  const formatAction = (activity: ActivityItem) => {
    const action = activity.action.replace('_', ' ');
    const entityType = activity.entity_type;

    let target = '';
    if (activity.project) {
      target = activity.project.title;
    } else if (activity.task) {
      target = activity.task.title;
    }

    return (
      <span>
        <span className="capitalize">{action}</span>
        {' '}
        <span className="text-zinc-500">{entityType}</span>
        {target && (
          <>
            {' '}
            <span className="text-white font-medium">{target}</span>
          </>
        )}
      </span>
    );
  };

  return (
    <div className="min-h-screen">
      <Header title="Activity" />

      <div className="p-6">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-zinc-900 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
                <FolderOpen className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{recentItems.filter(i => i.type === 'project').length}</p>
                <p className="text-xs text-zinc-500">Recent Projects</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
                <ListTodo className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{recentItems.filter(i => i.type === 'task').length}</p>
                <p className="text-xs text-zinc-500">Recent Tasks</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
                <TrendingUp className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">
                  {recentItems.filter(i => i.status === 'in_progress').length}
                </p>
                <p className="text-xs text-zinc-500">In Progress</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
                <CheckSquare className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">
                  {recentItems.filter(i => i.status === 'completed').length}
                </p>
                <p className="text-xs text-zinc-500">Completed</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-zinc-900 border border-zinc-800 rounded-lg p-1 w-fit">
              {(['all', 'projects', 'tasks'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? 'bg-zinc-700 text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Recent Items List */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl divide-y divide-zinc-800">
              {recentItems
                .filter(item => activeTab === 'all' || item.type === activeTab.slice(0, -1))
                .slice(0, 25)
                .map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-zinc-800/50 transition-colors">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    item.type === 'project' ? 'bg-blue-500/20' : 'bg-green-500/20'
                  }`}>
                    {item.type === 'project' ? (
                      <FolderOpen className="w-5 h-5 text-blue-400" />
                    ) : (
                      <ListTodo className="w-5 h-5 text-green-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {item.type === 'project' ? (
                        <Link
                          href={`/projects/${item.slug}`}
                          className="text-sm font-medium text-white hover:text-blue-400 transition-colors truncate"
                        >
                          {item.title}
                        </Link>
                      ) : (
                        <Link
                          href={item.project_slug ? `/projects/${item.project_slug}` : '#'}
                          className="text-sm font-medium text-white hover:text-blue-400 transition-colors truncate"
                        >
                          {item.title}
                        </Link>
                      )}
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        item.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        item.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400' :
                        item.status === 'blocked' ? 'bg-red-500/20 text-red-400' :
                        'bg-zinc-700 text-zinc-400'
                      }`}>
                        {item.status?.replace('_', ' ')}
                      </span>
                    </div>
                    {item.type === 'task' && item.project_title && (
                      <p className="text-xs text-zinc-500 truncate">
                        in {item.project_title}
                        {item.phase && <span className="ml-2">• {item.phase}</span>}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <Clock className="w-3 h-3" />
                    {formatRelativeTime(item.updated_at)}
                  </div>
                </div>
              ))}
              {recentItems.length === 0 && (
                <div className="text-center py-12">
                  <Activity className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No Activity Yet</h3>
                  <p className="text-zinc-500 max-w-md mx-auto">
                    Activity will appear here as you create projects and tasks.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl divide-y divide-zinc-800">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 p-4 hover:bg-zinc-800/50 transition-colors">
                <Avatar
                  src={activity.user?.avatar_url}
                  name={activity.user?.full_name || activity.user?.email || '?'}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-white">
                      {activity.user?.full_name || activity.user?.email || 'Unknown'}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${getActionColor(activity.action)}`}>
                      {getActionIcon(activity.action)}
                      {activity.action.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400">
                    {formatAction(activity)}
                  </p>
                  {activity.details && typeof activity.details === 'object' && (
                    <div className="mt-2 text-xs text-zinc-500 bg-zinc-800/50 rounded px-2 py-1">
                      {Object.entries(activity.details).map(([key, value]) => (
                        <span key={key} className="mr-3">
                          <span className="text-zinc-600">{key}:</span> {String(value)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {activity.project && (
                    <Link
                      href={`/projects/${activity.project.slug}`}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      View Project
                    </Link>
                  )}
                  <span className="text-xs text-zinc-500 whitespace-nowrap">
                    {formatRelativeTime(activity.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
