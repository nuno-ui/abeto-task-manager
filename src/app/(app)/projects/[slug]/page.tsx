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
  const [activeTab, setActiveTab] = useState<'tasks' | 'comments' | 'activity'>('tasks');
  const [taskPhaseFilter, setTaskPhaseFilter] = useState('all');

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

      // Fetch comments separately (can be empty for now)
      setComments([]);
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

    const supabase = createClient();

    try {
      const { error } = await supabase.from('comments').insert({
        project_id: project.id,
        content,
        parent_comment_id: parentId || null,
        author_id: (await supabase.auth.getUser()).data.user?.id,
      });

      if (error) throw error;
      fetchProjectData();
    } catch (error) {
      console.error('Error adding comment:', error);
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
              {project.prototype_url && (
                <a href={project.prototype_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="w-4 h-4" />
                    Demo
                  </Button>
                </a>
              )}
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

        {activeTab === 'comments' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <CommentList
              comments={comments}
              onAddComment={handleAddComment}
            />
          </div>
        )}
      </div>

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
            ...project,
            description: project.description || undefined,
            why_it_matters: project.why_it_matters || undefined,
            pillar_id: project.pillar_id || undefined,
            category: project.category || undefined,
            owner_team_id: project.owner_team_id || undefined,
            estimated_hours_min: project.estimated_hours_min || undefined,
            estimated_hours_max: project.estimated_hours_max || undefined,
            start_date: project.start_date || undefined,
            target_date: project.target_date || undefined,
            prototype_url: project.prototype_url || undefined,
            notion_url: project.notion_url || undefined,
            github_url: project.github_url || undefined,
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
