'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Avatar } from '@/components/ui';
import {
  Activity,
  FileText,
  CheckSquare,
  MessageSquare,
  Edit2,
  Plus,
  Trash2,
  ArrowRight,
  Clock,
  FolderOpen,
  ListTodo,
  TrendingUp,
  AlertCircle,
  Star,
  Check,
  Users,
  Briefcase,
  Code,
} from 'lucide-react';
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
  review_status?: {
    management_reviewed: boolean;
    operations_sales_reviewed: boolean;
    product_tech_reviewed: boolean;
    all_reviewed: boolean;
  };
}

interface ReviewStats {
  totalProjects: number;
  fullyReviewed: number;
  managementReviewed: number;
  operationsReviewed: number;
  productTechReviewed: number;
  pendingReviews: number;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  author?: {
    full_name: string | null;
    email: string;
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

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats>({
    totalProjects: 0,
    fullyReviewed: 0,
    managementReviewed: 0,
    operationsReviewed: 0,
    productTechReviewed: 0,
    pendingReviews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'projects' | 'tasks' | 'reviews' | 'comments'>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [activityRes, projectsRes, tasksRes, commentsRes] = await Promise.all([
        fetch('/api/activity?limit=100'),
        fetch('/api/projects'),
        fetch('/api/tasks'),
        fetch('/api/comments?limit=20'),
      ]);

      if (activityRes.ok) {
        setActivities(await activityRes.json());
      }

      const projects = projectsRes.ok ? await projectsRes.json() : [];
      const tasks = tasksRes.ok ? await tasksRes.json() : [];

      // Calculate review stats from projects
      let managementReviewed = 0;
      let operationsReviewed = 0;
      let productTechReviewed = 0;
      let fullyReviewed = 0;

      projects.forEach((p: any) => {
        if (p.review_status) {
          if (p.review_status.management_reviewed) managementReviewed++;
          if (p.review_status.operations_sales_reviewed) operationsReviewed++;
          if (p.review_status.product_tech_reviewed) productTechReviewed++;
          if (p.review_status.all_reviewed) fullyReviewed++;
        }
      });

      setReviewStats({
        totalProjects: projects.length,
        fullyReviewed,
        managementReviewed,
        operationsReviewed,
        productTechReviewed,
        pendingReviews: projects.length - fullyReviewed,
      });

      // Combine and sort items
      const items: RecentItem[] = [
        ...projects.slice(0, 20).map((p: any) => ({
          id: p.id,
          type: 'project' as const,
          title: p.title,
          status: p.status,
          created_at: p.created_at,
          updated_at: p.updated_at || p.created_at,
          slug: p.slug,
          review_status: p.review_status,
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

      items.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      setRecentItems(items.slice(0, 50));

      // Fetch comments
      if (commentsRes.ok) {
        setComments(await commentsRes.json());
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    const Icon = actionIcons[action] || Edit2;
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

  // Filter projects with review info for reviews tab
  const projectsWithReviewStatus = recentItems.filter(
    item => item.type === 'project' && item.review_status
  );

  return (
    <div className="min-h-screen">
      <Header title="Activity" />

      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Activity</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Track recent activity, review progress, and team updates
          </p>
        </div>

        {/* Review Status Dashboard */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            Review Status Dashboard
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-white">{reviewStats.fullyReviewed}</p>
              <p className="text-xs text-zinc-500">Fully Reviewed</p>
              <div className="mt-2 h-1 bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500"
                  style={{ width: `${reviewStats.totalProjects > 0 ? (reviewStats.fullyReviewed / reviewStats.totalProjects) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-white">{reviewStats.pendingReviews}</p>
              <p className="text-xs text-zinc-500">Pending Reviews</p>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-white">{reviewStats.totalProjects}</p>
              <p className="text-xs text-zinc-500">Total Projects</p>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
              <Link href="/reviews" className="text-2xl font-bold text-blue-400 hover:text-blue-300">
                Start
              </Link>
              <p className="text-xs text-zinc-500">New Review</p>
            </div>
          </div>

          {/* Review by Area */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-400">Management</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-white">{reviewStats.managementReviewed}</span>
                <span className="text-xs text-zinc-500">of {reviewStats.totalProjects}</span>
              </div>
              <div className="mt-2 h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500"
                  style={{ width: `${reviewStats.totalProjects > 0 ? (reviewStats.managementReviewed / reviewStats.totalProjects) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-green-400">Ops/Sales</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-white">{reviewStats.operationsReviewed}</span>
                <span className="text-xs text-zinc-500">of {reviewStats.totalProjects}</span>
              </div>
              <div className="mt-2 h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500"
                  style={{ width: `${reviewStats.totalProjects > 0 ? (reviewStats.operationsReviewed / reviewStats.totalProjects) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Code className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-400">Product/Tech</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-white">{reviewStats.productTechReviewed}</span>
                <span className="text-xs text-zinc-500">of {reviewStats.totalProjects}</span>
              </div>
              <div className="mt-2 h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500"
                  style={{ width: `${reviewStats.totalProjects > 0 ? (reviewStats.productTechReviewed / reviewStats.totalProjects) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-zinc-900 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
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
                <MessageSquare className="w-6 h-6 text-violet-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{comments.length}</p>
                <p className="text-xs text-zinc-500">Recent Comments</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-zinc-900 border border-zinc-800 rounded-lg p-1 w-fit">
              {(['all', 'projects', 'tasks', 'reviews', 'comments'] as const).map(tab => (
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

            {/* Content based on active tab */}
            {activeTab === 'comments' ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl divide-y divide-zinc-800">
                {comments.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No Comments Yet</h3>
                    <p className="text-zinc-500">Comments will appear here as they are added to projects and tasks.</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex items-start gap-4 p-4 hover:bg-zinc-800/50 transition-colors">
                      <Avatar
                        src={comment.author?.avatar_url}
                        name={comment.author?.full_name || comment.author?.email || '?'}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-white">
                            {comment.author?.full_name || comment.author?.email || 'Unknown'}
                          </span>
                          <span className="text-xs text-zinc-500">
                            {formatRelativeTime(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-300 mb-2">{comment.content}</p>
                        {comment.project && (
                          <Link
                            href={`/projects/${comment.project.slug}`}
                            className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                          >
                            <FolderOpen className="w-3 h-3" />
                            {comment.project.title}
                          </Link>
                        )}
                        {comment.task && (
                          <span className="inline-flex items-center gap-1 text-xs text-green-400 ml-2">
                            <ListTodo className="w-3 h-3" />
                            {comment.task.title}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : activeTab === 'reviews' ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl divide-y divide-zinc-800">
                {projectsWithReviewStatus.length === 0 ? (
                  <div className="text-center py-12">
                    <Star className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No Review Data</h3>
                    <p className="text-zinc-500">Start reviewing projects to see status here.</p>
                  </div>
                ) : (
                  projectsWithReviewStatus.map((item) => (
                    <Link
                      key={item.id}
                      href={`/projects/${item.slug}`}
                      className="flex items-center gap-4 p-4 hover:bg-zinc-800/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <FolderOpen className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white truncate">{item.title}</span>
                          {item.review_status?.all_reviewed && (
                            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              Complete
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className={`w-2 h-2 rounded-full ${item.review_status?.management_reviewed ? 'bg-blue-500' : 'bg-zinc-600'}`} title="Management" />
                          <div className={`w-2 h-2 rounded-full ${item.review_status?.operations_sales_reviewed ? 'bg-green-500' : 'bg-zinc-600'}`} title="Ops/Sales" />
                          <div className={`w-2 h-2 rounded-full ${item.review_status?.product_tech_reviewed ? 'bg-purple-500' : 'bg-zinc-600'}`} title="Product/Tech" />
                          <span className="text-xs text-zinc-500 ml-2">
                            {[
                              item.review_status?.management_reviewed,
                              item.review_status?.operations_sales_reviewed,
                              item.review_status?.product_tech_reviewed
                            ].filter(Boolean).length}/3 reviews
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-zinc-500">
                        {formatRelativeTime(item.updated_at)}
                      </div>
                    </Link>
                  ))
                )}
              </div>
            ) : (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl divide-y divide-zinc-800">
                {recentItems
                  .filter(item => {
                    if (activeTab === 'all') return true;
                    if (activeTab === 'projects') return item.type === 'project';
                    if (activeTab === 'tasks') return item.type === 'task';
                    return true;
                  })
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
                          {item.type === 'project' && item.review_status && (
                            <div className="flex items-center gap-1 ml-2">
                              <div className={`w-1.5 h-1.5 rounded-full ${item.review_status.management_reviewed ? 'bg-blue-500' : 'bg-zinc-600'}`} />
                              <div className={`w-1.5 h-1.5 rounded-full ${item.review_status.operations_sales_reviewed ? 'bg-green-500' : 'bg-zinc-600'}`} />
                              <div className={`w-1.5 h-1.5 rounded-full ${item.review_status.product_tech_reviewed ? 'bg-purple-500' : 'bg-zinc-600'}`} />
                            </div>
                          )}
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
            )}
          </div>
        )}
      </div>
    </div>
  );
}
