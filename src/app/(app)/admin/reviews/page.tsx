'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { ContactAdminCard } from '@/components/auth/AdminOnly';
import Link from 'next/link';
import {
  BarChart3,
  Users,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  Briefcase,
  Code2,
  TrendingUp,
  FileText,
  Filter,
} from 'lucide-react';

interface ReviewerStat {
  email: string;
  name: string | null;
  reviewed: number;
  pending: number;
  totalFeedback: number;
  totalComments: number;
  areas: string[];
}

interface Comment {
  id: string;
  content: string;
  status: string;
  admin_response: string | null;
  created_at: string;
  session: {
    reviewer_area: string;
    reviewer: {
      email: string;
      full_name: string | null;
    };
  };
  project: {
    id: string;
    title: string;
    slug: string;
  };
}

interface AdminData {
  summary: {
    totalProjects: number;
    fullyReviewed: number;
    needingReview: number;
    totalComments: number;
    pendingComments: number;
    totalFeedback: number;
  };
  reviewerStats: Record<string, ReviewerStat>;
  areaStats: {
    management: { reviewed: number; pending: number };
    operations_sales: { reviewed: number; pending: number };
    product_tech: { reviewed: number; pending: number };
  };
  commentStats: {
    pending: number;
    answered: number;
    resolved: number;
  };
  feedbackByField: Record<string, number>;
  recentComments: Comment[];
}

const areaLabels: Record<string, string> = {
  management: 'Management',
  operations_sales: 'Operations / Sales',
  product_tech: 'Product / Tech',
};

const areaColors: Record<string, string> = {
  management: 'bg-indigo-500',
  operations_sales: 'bg-emerald-500',
  product_tech: 'bg-amber-500',
};

const areaIcons: Record<string, typeof Briefcase> = {
  management: Briefcase,
  operations_sales: Users,
  product_tech: Code2,
};

export default function AdminReviewsPage() {
  const { permissions, isLoading: authLoading, user } = useAuth();
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentFilter, setCommentFilter] = useState<'all' | 'pending' | 'answered' | 'resolved'>('pending');

  useEffect(() => {
    if (!authLoading && permissions.isAdmin) {
      fetchData();
    }
  }, [authLoading, permissions.isAdmin]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/reviews');
      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        const err = await response.json();
        setError(err.error || 'Failed to load data');
      }
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen">
        <Header title="Admin - Review Dashboard" />
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      </div>
    );
  }

  if (!permissions.isAdmin) {
    return (
      <div className="min-h-screen">
        <Header title="Admin - Review Dashboard" />
        <div className="p-6 max-w-lg mx-auto">
          <ContactAdminCard feature="The Admin Dashboard" />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header title="Admin - Review Dashboard" />
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-zinc-800 rounded-xl" />
              ))}
            </div>
            <div className="h-64 bg-zinc-800 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen">
        <Header title="Admin - Review Dashboard" />
        <div className="p-6 text-center">
          <p className="text-red-400">{error || 'Failed to load data'}</p>
          <button onClick={fetchData} className="mt-4 px-4 py-2 bg-blue-600 rounded-lg">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header title="Admin - Review Dashboard" />

      <div className="p-6 space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <BarChart3 className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{data.summary.totalProjects}</p>
                <p className="text-sm text-zinc-400">Total Projects</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{data.summary.fullyReviewed}</p>
                <p className="text-sm text-zinc-400">Fully Reviewed</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{data.summary.needingReview}</p>
                <p className="text-sm text-zinc-400">Needs Review</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <MessageSquare className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{data.summary.pendingComments}</p>
                <p className="text-sm text-zinc-400">Pending Comments</p>
              </div>
            </div>
          </div>
        </div>

        {/* Area Progress */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            Review Progress by Area
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(data.areaStats).map(([area, stats]) => {
              const Icon = areaIcons[area];
              const total = stats.reviewed + stats.pending;
              const percentage = total > 0 ? Math.round((stats.reviewed / total) * 100) : 0;

              return (
                <div key={area} className="bg-zinc-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 ${areaColors[area]}/20 rounded-lg`}>
                      <Icon className={`w-4 h-4 text-${areaColors[area].replace('bg-', '')}`} />
                    </div>
                    <span className="font-medium text-white">{areaLabels[area]}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Progress</span>
                      <span className="text-white">{percentage}%</span>
                    </div>
                    <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${areaColors[area]} transition-all`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-zinc-500">
                      <span>{stats.reviewed} reviewed</span>
                      <span>{stats.pending} pending</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reviewer Stats */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            Reviewer Activity
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-zinc-400 border-b border-zinc-800">
                  <th className="pb-3">Reviewer</th>
                  <th className="pb-3">Areas</th>
                  <th className="pb-3 text-right">Reviewed</th>
                  <th className="pb-3 text-right">Pending</th>
                  <th className="pb-3 text-right">Feedback</th>
                  <th className="pb-3 text-right">Comments</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(data.reviewerStats).map(([id, stat]) => (
                  <tr key={id} className="border-b border-zinc-800/50">
                    <td className="py-3">
                      <div>
                        <p className="text-white">{stat.name || 'Unknown'}</p>
                        <p className="text-xs text-zinc-500">{stat.email}</p>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-1">
                        {stat.areas.map(area => (
                          <span
                            key={area}
                            className={`px-2 py-0.5 text-xs rounded-full ${areaColors[area]}/20 text-white`}
                          >
                            {areaLabels[area]?.split(' ')[0]}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 text-right text-green-400">{stat.reviewed}</td>
                    <td className="py-3 text-right text-amber-400">{stat.pending}</td>
                    <td className="py-3 text-right text-blue-400">{stat.totalFeedback}</td>
                    <td className="py-3 text-right text-purple-400">{stat.totalComments}</td>
                  </tr>
                ))}
                {Object.keys(data.reviewerStats).length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-zinc-500">
                      No reviewer activity yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Feedback by Field */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-400" />
            Feedback by Field
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(data.feedbackByField).map(([field, count]) => (
              <div key={field} className="bg-zinc-800/50 rounded-lg p-3">
                <p className="text-sm text-zinc-400 truncate">{field.replace(/_/g, ' ')}</p>
                <p className="text-xl font-bold text-white">{count}</p>
              </div>
            ))}
            {Object.keys(data.feedbackByField).length === 0 && (
              <p className="col-span-4 text-center text-zinc-500 py-4">No feedback submitted yet</p>
            )}
          </div>
        </div>

        {/* Recent Comments */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-400" />
              Review Comments
            </h2>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-zinc-500" />
              <select
                value={commentFilter}
                onChange={(e) => setCommentFilter(e.target.value as any)}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1 text-sm text-white"
              >
                <option value="pending">Pending ({data.commentStats.pending})</option>
                <option value="answered">Answered ({data.commentStats.answered})</option>
                <option value="resolved">Resolved ({data.commentStats.resolved})</option>
                <option value="all">All ({data.summary.totalComments})</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {data.recentComments
              .filter(c => commentFilter === 'all' || c.status === commentFilter)
              .map((comment) => (
                <div key={comment.id} className="bg-zinc-800/50 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          comment.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                          comment.status === 'answered' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {comment.status}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-white">{comment.content}</p>
                      <div className="mt-2 flex items-center gap-4 text-xs text-zinc-500">
                        <span>By: {comment.session?.reviewer?.full_name || comment.session?.reviewer?.email || 'Unknown'}</span>
                        <span>Area: {areaLabels[comment.session?.reviewer_area] || 'Unknown'}</span>
                        {comment.project && (
                          <Link
                            href={`/projects/${comment.project.slug}`}
                            className="text-blue-400 hover:underline"
                          >
                            {comment.project.title}
                          </Link>
                        )}
                      </div>
                      {comment.admin_response && (
                        <div className="mt-2 pl-4 border-l-2 border-blue-500">
                          <p className="text-sm text-zinc-300">{comment.admin_response}</p>
                        </div>
                      )}
                    </div>
                    <Link
                      href={comment.project ? `/projects/${comment.project.slug}` : '#'}
                      className="p-2 text-zinc-400 hover:text-white transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              ))}
            {data.recentComments.filter(c => commentFilter === 'all' || c.status === commentFilter).length === 0 && (
              <p className="text-center text-zinc-500 py-8">No comments found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
