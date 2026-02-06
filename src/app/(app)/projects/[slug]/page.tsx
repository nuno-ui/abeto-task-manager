'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  Edit2,
  ExternalLink,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  MessageSquare,
  MoreVertical,
  Trash2,
  Database,
  Zap,
  Target,
  AlertTriangle,
  Link2,
  TrendingUp,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskForm } from '@/components/tasks/TaskForm';
import { CommentList } from '@/components/comments/CommentList';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { Badge, Button, Modal, ProgressBar, Avatar } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';
import type { Project, Task, Team, User, Pillar, Comment, CreateTaskInput, CreateProjectInput } from '@/types/database';
import { Send, Sparkles, Loader2 } from 'lucide-react';

// Quick Comment Input Component with AI Action
function QuickCommentInput({
  projectId,
  taskId,
  onAddComment,
  onDataRefresh,
}: {
  projectId?: string;
  taskId?: string;
  onAddComment: (content: string) => Promise<void>;
  onDataRefresh: () => void;
}) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || loading) return;

    setLoading(true);
    try {
      await onAddComment(content);
      setContent('');
    } finally {
      setLoading(false);
    }
  };

  const handleAIAction = async () => {
    if (!content.trim() || aiLoading) return;

    setAiLoading(true);
    try {
      // First, add the comment
      await onAddComment(content);

      // Then analyze it with AI
      const response = await fetch('/api/ai/process-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          projectId,
          taskId,
        }),
      });

      const data = await response.json();

      if (data.suggestions && data.suggestions.length > 0) {
        // Apply suggestions automatically if there are any
        const applyResponse = await fetch('/api/ai/apply-suggestions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ suggestions: data.suggestions }),
        });

        if (applyResponse.ok) {
          onDataRefresh();
        }
      } else if (data.action) {
        // Handle action commands
        alert(`AI understood: ${data.action}\n\n${data.message || 'Please perform this action manually.'}`);
      }

      setContent('');
    } catch (error) {
      console.error('AI action failed:', error);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Add a comment or command (e.g., 'mark as completed', 'set priority to high')..."
        className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
        disabled={loading || aiLoading}
      />
      <button
        type="button"
        onClick={handleAIAction}
        disabled={!content.trim() || loading || aiLoading}
        className="px-3 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition-colors flex items-center gap-2"
        title="Comment & Apply with AI"
      >
        {aiLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
      </button>
      <button
        type="submit"
        disabled={!content.trim() || loading || aiLoading}
        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
        title="Add Comment"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
      </button>
    </form>
  );
}

export default function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [savingTask, setSavingTask] = useState(false);
  const [savingProject, setSavingProject] = useState(false);
  const [activeTab, setActiveTab] = useState<'tasks' | 'comments' | 'details'>('tasks');
  const [taskPhaseFilter, setTaskPhaseFilter] = useState('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingProject, setDeletingProject] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  useEffect(() => {
    fetchProjectData();
  }, [resolvedParams.slug]);

  const fetchProjectData = async () => {
    setLoading(true);

    try {
      // Use API route to bypass RLS
      const response = await fetch(`/api/projects/${resolvedParams.slug}`);

      if (!response.ok) {
        throw new Error('Failed to fetch project');
      }

      const data = await response.json();

      setProject(data.project);
      setTasks(data.tasks || []);
      setTeams(data.teams || []);
      setPillars(data.pillars || []);

      // Fetch comments for this project
      if (data.project?.id) {
        const commentsResponse = await fetch(`/api/comments?project_id=${data.project.id}`);
        if (commentsResponse.ok) {
          const commentsData = await commentsResponse.json();
          setComments(commentsData);
        }
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (data: CreateTaskInput) => {
    const supabase = createClient();
    setSavingTask(true);

    try {
      const { error } = await supabase.from('tasks').insert(data);
      if (error) throw error;

      setShowTaskModal(false);
      fetchProjectData();
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task');
    } finally {
      setSavingTask(false);
    }
  };

  const handleUpdateTask = async (data: CreateTaskInput) => {
    if (!editingTask) return;

    const supabase = createClient();
    setSavingTask(true);

    try {
      const { error } = await supabase
        .from('tasks')
        .update(data)
        .eq('id', editingTask.id);

      if (error) throw error;

      setEditingTask(null);
      fetchProjectData();
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task');
    } finally {
      setSavingTask(false);
    }
  };

  const handleUpdateProject = async (data: CreateProjectInput) => {
    if (!project) return;

    const supabase = createClient();
    setSavingProject(true);

    try {
      const { error } = await supabase
        .from('projects')
        .update(data)
        .eq('id', project.id);

      if (error) throw error;

      setShowEditModal(false);
      fetchProjectData();
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Failed to update project');
    } finally {
      setSavingProject(false);
    }
  };

  const handleAddComment = async (content: string, parentId?: string) => {
    if (!project) return;

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: project.id,
          content,
          parent_comment_id: parentId || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      fetchProjectData();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleEditComment = async (id: string, content: string) => {
    try {
      const response = await fetch('/api/comments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, content }),
      });

      if (!response.ok) {
        throw new Error('Failed to edit comment');
      }

      fetchProjectData();
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  const handleDeleteComment = async (id: string) => {
    try {
      const response = await fetch(`/api/comments?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }

      fetchProjectData();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleTaskStatusChange = async (taskId: string, newStatus: string) => {
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;
      fetchProjectData();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleDeleteProject = async () => {
    if (!project) return;
    setDeletingProject(true);

    try {
      const response = await fetch(`/api/projects?id=${project.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      // Redirect to projects list
      window.location.href = '/projects';
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project');
    } finally {
      setDeletingProject(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    setDeletingTaskId(taskId);

    try {
      const response = await fetch(`/api/tasks?id=${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      fetchProjectData();
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task');
    } finally {
      setDeletingTaskId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header title="Loading..." />
        <div className="p-6">
          <div className="h-48 bg-zinc-900 rounded-xl animate-pulse mb-6" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-zinc-900 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen">
        <Header title="Project Not Found" />
        <div className="p-6 text-center">
          <p className="text-zinc-500 mb-4">The project you're looking for doesn't exist.</p>
          <Link href="/projects">
            <Button>Back to Projects</Button>
          </Link>
        </div>
      </div>
    );
  }

  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const phases = ['discovery', 'planning', 'development', 'testing', 'training', 'rollout', 'monitoring'];
  const filteredTasks =
    taskPhaseFilter === 'all' ? tasks : tasks.filter((t) => t.phase === taskPhaseFilter);

  // Group tasks by phase
  const tasksByPhase = phases.reduce((acc, phase) => {
    acc[phase] = filteredTasks.filter((t) => t.phase === phase);
    return acc;
  }, {} as Record<string, Task[]>);

  return (
    <div className="min-h-screen">
      <Header title={project.title} />

      <div className="p-6 space-y-6">
        {/* Back link */}
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </Link>

        {/* Project Header */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {project.pillar && (
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: project.pillar.color }}
                    title={project.pillar.name}
                  />
                )}
                <h1 className="text-2xl font-bold text-white">{project.title}</h1>
              </div>
              <p className="text-zinc-400 mb-4">{project.description}</p>

              <div className="flex flex-wrap gap-2">
                <Badge variant="status" value={project.status}>
                  {project.status.replace('_', ' ')}
                </Badge>
                <Badge variant="priority" value={project.priority}>
                  {project.priority}
                </Badge>
                <Badge variant="difficulty" value={project.difficulty}>
                  {project.difficulty}
                </Badge>
                {project.owner_team && <Badge>{project.owner_team.name}</Badge>}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => setShowEditModal(true)}>
                <Edit2 className="w-4 h-4" />
                Edit
              </Button>
              {project.demo_link && (
                <a href={project.demo_link} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="w-4 h-4" />
                    Demo/Doc
                  </Button>
                </a>
              )}
              {project.prototype_url && !project.demo_link && (
                <a href={project.prototype_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="w-4 h-4" />
                    Prototype
                  </Button>
                </a>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Progress & Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-zinc-800">
            <div>
              <p className="text-xs text-zinc-500 mb-1">Progress</p>
              <ProgressBar value={progress} showLabel />
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1">Tasks</p>
              <p className="text-lg font-semibold text-white">
                {completedTasks}/{tasks.length}
              </p>
            </div>
            {project.target_date && (
              <div>
                <p className="text-xs text-zinc-500 mb-1">Target Date</p>
                <p className="text-sm text-white flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-zinc-500" />
                  {formatDate(project.target_date)}
                </p>
              </div>
            )}
            {project.estimated_hours_min && (
              <div>
                <p className="text-xs text-zinc-500 mb-1">Estimated Hours</p>
                <p className="text-sm text-white flex items-center gap-1">
                  <Clock className="w-4 h-4 text-zinc-500" />
                  {project.estimated_hours_min}-{project.estimated_hours_max}h
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Comment Section - Always Visible */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <MessageSquare className="w-5 h-5 text-violet-400" />
            <h3 className="text-sm font-medium text-white">Quick Comment</h3>
            <span className="text-xs text-zinc-500">({comments.length} comments)</span>
          </div>
          <QuickCommentInput
            projectId={project.id}
            onAddComment={handleAddComment}
            onDataRefresh={fetchProjectData}
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-zinc-800">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'tasks'
                ? 'text-blue-400 border-blue-400'
                : 'text-zinc-400 border-transparent hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Tasks ({tasks.length})
            </span>
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'details'
                ? 'text-blue-400 border-blue-400'
                : 'text-zinc-400 border-transparent hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Details
            </span>
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'comments'
                ? 'text-blue-400 border-blue-400'
                : 'text-zinc-400 border-transparent hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Comments ({comments.length})
            </span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            {/* Task filters and actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <select
                  value={taskPhaseFilter}
                  onChange={(e) => setTaskPhaseFilter(e.target.value)}
                  className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white"
                >
                  <option value="all">All Phases</option>
                  {phases.map((phase) => (
                    <option key={phase} value={phase}>
                      {phase.charAt(0).toUpperCase() + phase.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <Button onClick={() => setShowTaskModal(true)}>
                <Plus className="w-4 h-4" />
                Add Task
              </Button>
            </div>

            {/* Tasks by phase */}
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12 bg-zinc-900 border border-zinc-800 rounded-xl">
                <p className="text-zinc-500 mb-4">No tasks yet</p>
                <Button onClick={() => setShowTaskModal(true)}>
                  <Plus className="w-4 h-4" />
                  Add your first task
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {phases.map((phase) => {
                  const phaseTasks = tasksByPhase[phase];
                  if (phaseTasks.length === 0 && taskPhaseFilter !== 'all') return null;
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
                        {phaseTasks.map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            onClick={() => setEditingTask(task)}
                            onDelete={handleDeleteTask}
                            deleting={deletingTaskId === task.id}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'details' && (
          <div className="space-y-6">
            {/* Problem Statement */}
            {project.problem_statement && (
              <div className="bg-red-900/10 border border-red-900/30 rounded-xl p-6">
                <h3 className="text-sm font-medium text-red-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Problem Being Solved
                </h3>
                <p className="text-zinc-300">{project.problem_statement}</p>
              </div>
            )}

            {/* Why It Matters */}
            {project.why_it_matters && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-violet-400" />
                  Why It Matters
                </h3>
                <p className="text-zinc-300">{project.why_it_matters}</p>
              </div>
            )}

            {/* Expected Deliverables */}
            {project.deliverables && project.deliverables.length > 0 && (
              <div className="bg-emerald-900/10 border border-emerald-900/30 rounded-xl p-6">
                <h3 className="text-sm font-medium text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Expected Deliverables
                </h3>
                <ul className="space-y-2">
                  {project.deliverables.map((item, idx) => (
                    <li key={idx} className="text-zinc-300 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Human Role - Before vs After */}
            {(project.human_role_before || project.human_role_after) && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  Human Role: Before vs After
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-red-900/20 border border-red-900/30 rounded-lg p-4">
                    <span className="text-xs font-medium text-red-400 uppercase">❌ Before</span>
                    <p className="text-zinc-300 mt-2">{project.human_role_before || 'Not specified'}</p>
                  </div>
                  <div className="bg-green-900/20 border border-green-900/30 rounded-lg p-4">
                    <span className="text-xs font-medium text-green-400 uppercase">✅ After</span>
                    <p className="text-zinc-300 mt-2">{project.human_role_after || 'Not specified'}</p>
                  </div>
                </div>
                {project.who_is_empowered && project.who_is_empowered.length > 0 && (
                  <div className="mt-4">
                    <span className="text-xs text-zinc-500">Empowers:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {project.who_is_empowered.map((role, idx) => (
                        <span key={idx} className="px-2 py-1 bg-violet-900/30 text-violet-300 text-xs rounded">
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {project.new_capabilities && project.new_capabilities.length > 0 && (
                  <div className="mt-4">
                    <span className="text-xs text-zinc-500">New Capabilities:</span>
                    <ul className="mt-1 space-y-1">
                      {project.new_capabilities.map((cap, idx) => (
                        <li key={idx} className="text-sm text-zinc-300 flex items-center gap-2">
                          <Zap className="w-3 h-3 text-yellow-400" />
                          {cap}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Data Flow */}
            {(project.data_required?.length > 0 || project.data_generates?.length > 0 || project.data_improves?.length > 0) && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Database className="w-4 h-4 text-cyan-400" />
                  Data Flow
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {project.data_required && project.data_required.length > 0 && (
                    <div className="bg-red-900/10 border border-red-900/20 rounded-lg p-4">
                      <span className="text-xs font-medium text-red-400">🔴 Requires</span>
                      <ul className="mt-2 space-y-1">
                        {project.data_required.map((item, idx) => (
                          <li key={idx} className="text-sm text-zinc-300">{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {project.data_generates && project.data_generates.length > 0 && (
                    <div className="bg-green-900/10 border border-green-900/20 rounded-lg p-4">
                      <span className="text-xs font-medium text-green-400">🟢 Generates</span>
                      <ul className="mt-2 space-y-1">
                        {project.data_generates.map((item, idx) => (
                          <li key={idx} className="text-sm text-zinc-300">{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {project.data_improves && project.data_improves.length > 0 && (
                    <div className="bg-blue-900/10 border border-blue-900/20 rounded-lg p-4">
                      <span className="text-xs font-medium text-blue-400">🔵 Improves</span>
                      <ul className="mt-2 space-y-1">
                        {project.data_improves.map((item, idx) => (
                          <li key={idx} className="text-sm text-zinc-300">{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Benefits */}
            {project.benefits && project.benefits.length > 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  Benefits
                </h3>
                <ul className="grid md:grid-cols-2 gap-2">
                  {project.benefits.map((benefit, idx) => (
                    <li key={idx} className="text-sm text-zinc-300 flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">✓</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Dependencies & Relationships */}
            {(project.depends_on?.length > 0 || project.enables?.length > 0 || project.prerequisites?.length > 0) && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-orange-400" />
                  Dependencies & Relationships
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {project.prerequisites && project.prerequisites.length > 0 && (
                    <div>
                      <span className="text-xs text-zinc-500">Prerequisites:</span>
                      <ul className="mt-1 space-y-1">
                        {project.prerequisites.map((item, idx) => (
                          <li key={idx} className="text-sm text-zinc-300">{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {project.depends_on && project.depends_on.length > 0 && (
                    <div>
                      <span className="text-xs text-zinc-500">Depends On:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {project.depends_on.map((slug, idx) => (
                          <Link key={idx} href={`/projects/${slug}`} className="px-2 py-1 bg-orange-900/20 text-orange-300 text-xs rounded hover:bg-orange-900/40">
                            {slug}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  {project.enables && project.enables.length > 0 && (
                    <div>
                      <span className="text-xs text-zinc-500">Enables:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {project.enables.map((slug, idx) => (
                          <Link key={idx} href={`/projects/${slug}`} className="px-2 py-1 bg-green-900/20 text-green-300 text-xs rounded hover:bg-green-900/40">
                            {slug}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Technical Details */}
            {(project.api_endpoints?.length > 0 || project.resources_used?.length > 0 || project.integrations_needed?.length > 0) && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  Technical Details
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {project.api_endpoints && project.api_endpoints.length > 0 && (
                    <div>
                      <span className="text-xs text-zinc-500">API Endpoints:</span>
                      <ul className="mt-1 space-y-1">
                        {project.api_endpoints.map((endpoint, idx) => (
                          <li key={idx} className="text-sm text-cyan-400 font-mono">{endpoint}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {project.resources_used && project.resources_used.length > 0 && (
                    <div>
                      <span className="text-xs text-zinc-500">Resources Used:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {project.resources_used.map((resource, idx) => (
                          <span key={idx} className="px-2 py-1 bg-zinc-800 text-zinc-300 text-xs rounded">
                            {resource}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {project.integrations_needed && project.integrations_needed.length > 0 && (
                    <div>
                      <span className="text-xs text-zinc-500">Integrations Needed:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {project.integrations_needed.map((integration, idx) => (
                          <span key={idx} className="px-2 py-1 bg-purple-900/20 text-purple-300 text-xs rounded">
                            {integration}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Operations Context */}
            {(project.ops_process || project.current_loa || project.potential_loa) && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">
                  Operations Context
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {project.ops_process && (
                    <div>
                      <span className="text-xs text-zinc-500">Process:</span>
                      <p className="text-sm text-zinc-300 mt-1">{project.ops_process}</p>
                    </div>
                  )}
                  {project.current_loa && (
                    <div>
                      <span className="text-xs text-zinc-500">Current LOA:</span>
                      <p className="text-sm text-zinc-300 mt-1">{project.current_loa}</p>
                    </div>
                  )}
                  {project.potential_loa && (
                    <div>
                      <span className="text-xs text-zinc-500">Potential LOA:</span>
                      <p className="text-sm text-zinc-300 mt-1">{project.potential_loa}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <CommentList
              comments={comments}
              onAddComment={handleAddComment}
              onEditComment={handleEditComment}
              onDeleteComment={handleDeleteComment}
              projectId={project.id}
              onDataRefresh={fetchProjectData}
            />
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Project"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-900/20 border border-red-900/30 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0" />
            <div>
              <p className="text-white font-medium">This action cannot be undone</p>
              <p className="text-sm text-zinc-400 mt-1">
                This will permanently delete "{project.title}" and all its {tasks.length} tasks.
              </p>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleDeleteProject}
              disabled={deletingProject}
              className="bg-red-600 hover:bg-red-700"
            >
              {deletingProject ? 'Deleting...' : 'Delete Project'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Task Modal */}
      <Modal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        title="Add New Task"
        size="lg"
      >
        <TaskForm
          projectId={project.id}
          teams={teams}
          users={users}
          onSubmit={handleCreateTask}
          onCancel={() => setShowTaskModal(false)}
          loading={savingTask}
        />
      </Modal>

      {/* Edit Task Modal */}
      <Modal
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        title="Edit Task"
        size="lg"
      >
        {editingTask && (
          <TaskForm
            projectId={project.id}
            initialData={{
              ...editingTask,
              description: editingTask.description || undefined,
              owner_team_id: editingTask.owner_team_id || undefined,
              assignee_id: editingTask.assignee_id || undefined,
              estimated_hours: editingTask.estimated_hours || undefined,
              ai_assist_description: editingTask.ai_assist_description || undefined,
              due_date: editingTask.due_date || undefined,
              problem_statement: editingTask.problem_statement || undefined,
              deliverables: editingTask.deliverables || [],
              demo_link: editingTask.demo_link || undefined,
              google_drive_folder_url: editingTask.google_drive_folder_url || undefined,
            }}
            teams={teams}
            users={users}
            onSubmit={handleUpdateTask}
            onCancel={() => setEditingTask(null)}
            loading={savingTask}
          />
        )}
      </Modal>

      {/* Edit Project Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Project"
        size="lg"
      >
        <ProjectForm
          initialData={{
            title: project.title,
            slug: project.slug,
            description: project.description ?? undefined,
            why_it_matters: project.why_it_matters ?? undefined,
            pillar_id: project.pillar_id ?? undefined,
            category: project.category ?? undefined,
            status: project.status,
            priority: project.priority,
            difficulty: project.difficulty,
            owner_team_id: project.owner_team_id ?? undefined,
            estimated_hours_min: project.estimated_hours_min ?? undefined,
            estimated_hours_max: project.estimated_hours_max ?? undefined,
            start_date: project.start_date ?? undefined,
            target_date: project.target_date ?? undefined,
            prototype_url: project.prototype_url ?? undefined,
            notion_url: project.notion_url ?? undefined,
            github_url: project.github_url ?? undefined,
            tags: project.tags,
            human_role_before: project.human_role_before ?? undefined,
            human_role_after: project.human_role_after ?? undefined,
            who_is_empowered: project.who_is_empowered,
            new_capabilities: project.new_capabilities,
            data_required: project.data_required,
            data_generates: project.data_generates,
            data_improves: project.data_improves,
            ops_process: project.ops_process ?? undefined,
            current_loa: project.current_loa ?? undefined,
            potential_loa: project.potential_loa ?? undefined,
            resources_used: project.resources_used,
            api_endpoints: project.api_endpoints,
            prerequisites: project.prerequisites,
            benefits: project.benefits,
            missing_api_data: project.missing_api_data,
            integrations_needed: project.integrations_needed,
            depends_on: project.depends_on,
            enables: project.enables,
            related_to: project.related_to,
            primary_users: project.primary_users,
            data_status: project.data_status ?? undefined,
            next_milestone: project.next_milestone ?? undefined,
            problem_statement: project.problem_statement ?? undefined,
            deliverables: project.deliverables,
            demo_link: project.demo_link ?? undefined,
          }}
          teams={teams}
          pillars={pillars}
          onSubmit={handleUpdateProject}
          onCancel={() => setShowEditModal(false)}
          loading={savingProject}
        />
      </Modal>
    </div>
  );
}
