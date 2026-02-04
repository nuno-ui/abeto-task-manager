'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Avatar } from '@/components/ui';
import { Activity, FileText, CheckSquare, MessageSquare, Edit2, Plus, Trash2, ArrowRight } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivity();
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
          <div className="text-center py-16 bg-zinc-900 border border-zinc-800 rounded-xl">
            <Activity className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Activity Yet</h3>
            <p className="text-zinc-500 max-w-md mx-auto">
              Activity will appear here as you create projects, tasks, and comments.
            </p>
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
