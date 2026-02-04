'use client';

import { useState } from 'react';
import { X, Sparkles, Loader2, Check, ChevronDown, ChevronRight, Clock, Zap } from 'lucide-react';

interface GeneratedTask {
  title: string;
  description: string;
  phase: string;
  status: string;
  difficulty: string;
  ai_potential: string;
  ai_assist_description?: string;
  estimated_hours: string;
  is_foundational: boolean;
  is_critical_path: boolean;
  acceptance_criteria?: string[];
  tools_needed?: string[];
  knowledge_areas?: string[];
  order_index: number;
}

interface GeneratedProject {
  title: string;
  slug: string;
  description: string;
  why_it_matters?: string;
  status: string;
  priority: string;
  difficulty?: string;
  category?: string;
  start_date?: string;
  target_date?: string;
  estimated_hours_min?: number;
  estimated_hours_max?: number;
  owner_team_id?: string;
}

interface AIProjectCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: () => void;
}

export function AIProjectCreator({ isOpen, onClose, onProjectCreated }: AIProjectCreatorProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [project, setProject] = useState<GeneratedProject | null>(null);
  const [tasks, setTasks] = useState<GeneratedTask[]>([]);
  const [summary, setSummary] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set(['discovery', 'planning', 'development']));

  const handleGenerate = async () => {
    if (!input.trim() || loading) return;

    setLoading(true);
    setError(null);
    setProject(null);
    setTasks([]);

    try {
      const response = await fetch('/api/ai/create-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: input.trim() })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate project');
      }

      setProject(data.project);
      setTasks(data.tasks || []);
      setSummary(data.summary || '');

    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate project');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!project || creating) return;

    setCreating(true);
    setError(null);

    try {
      // Create the project
      const projectResponse = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project)
      });

      if (!projectResponse.ok) {
        const data = await projectResponse.json();
        throw new Error(data.error || 'Failed to create project');
      }

      const createdProject = await projectResponse.json();

      // Create all tasks
      if (tasks.length > 0) {
        console.log('Creating tasks for project:', createdProject.id);
        console.log('Tasks to create:', tasks.length);

        const tasksResponse = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tasks: tasks.map(task => ({
              ...task,
              project_id: createdProject.id
            }))
          })
        });

        const tasksResult = await tasksResponse.json();

        if (!tasksResponse.ok) {
          console.error('Failed to create tasks:', tasksResult.error);
          // Don't throw - project was created, tasks just failed
          alert(`Project created but some tasks failed to create: ${tasksResult.error}`);
        } else {
          console.log('Tasks created successfully:', tasksResult.count);
        }
      }

      onProjectCreated();
      handleClose();

    } catch (err) {
      console.error('Error creating project:', err);
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    setInput('');
    setProject(null);
    setTasks([]);
    setSummary('');
    setError(null);
    onClose();
  };

  const togglePhase = (phase: string) => {
    setExpandedPhases(prev => {
      const newSet = new Set(prev);
      if (newSet.has(phase)) {
        newSet.delete(phase);
      } else {
        newSet.add(phase);
      }
      return newSet;
    });
  };

  const phases = ['discovery', 'planning', 'development', 'testing', 'training', 'rollout', 'monitoring'];
  const tasksByPhase = phases.reduce((acc, phase) => {
    acc[phase] = tasks.filter(t => t.phase === phase);
    return acc;
  }, {} as Record<string, GeneratedTask[]>);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/20 text-red-400';
      case 'high': return 'bg-orange-500/20 text-orange-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-green-500/20 text-green-400';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'complex': return 'bg-purple-500/20 text-purple-400';
      case 'hard': return 'bg-red-500/20 text-red-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'easy': return 'bg-green-500/20 text-green-400';
      default: return 'bg-zinc-500/20 text-zinc-400';
    }
  };

  const getAIPotentialIcon = (potential: string) => {
    if (potential === 'high' || potential === 'full') {
      return <Zap className="w-3.5 h-3.5 text-violet-400" />;
    }
    return null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-500/20 rounded-lg">
              <Sparkles className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">AI Project Generator</h2>
              <p className="text-sm text-zinc-400">Describe your idea and get a complete project plan</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {!project ? (
            /* Input Stage */
            <div className="p-6">
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                  <Sparkles className="w-16 h-16 text-violet-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">What do you want to build?</h3>
                  <p className="text-zinc-400">
                    Describe your project idea in a few words. AI will generate a complete project plan with tasks, timelines, and more.
                  </p>
                </div>

                <div className="space-y-4">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="e.g., Build an AI-powered chat and voice bot for customer support..."
                    className="w-full h-32 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                    disabled={loading}
                  />

                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleGenerate}
                    disabled={!input.trim() || loading}
                    className="w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating complete project plan...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Generate Project Plan
                      </>
                    )}
                  </button>

                  <p className="text-xs text-zinc-500 text-center">
                    AI will generate project details, 8-15 tasks across all phases, time estimates, and more
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Preview Stage */
            <div className="p-6 space-y-6">
              {/* Summary */}
              {summary && (
                <div className="p-4 bg-violet-500/10 border border-violet-500/30 rounded-xl">
                  <p className="text-sm text-violet-300">{summary}</p>
                </div>
              )}

              {/* Project Details */}
              <div className="bg-zinc-800/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Project Details</h3>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-xl font-bold text-white">{project.title}</h4>
                    <p className="text-sm text-zinc-500 font-mono">/{project.slug}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(project.priority)}`}>
                      {project.priority} priority
                    </span>
                    {project.difficulty && (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(project.difficulty)}`}>
                        {project.difficulty}
                      </span>
                    )}
                    {project.category && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-zinc-700 text-zinc-300">
                        {project.category}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-zinc-300 whitespace-pre-line">{project.description}</p>

                  {project.why_it_matters && (
                    <div className="pt-3 border-t border-zinc-700">
                      <p className="text-xs text-zinc-500 mb-1">Why it matters</p>
                      <p className="text-sm text-zinc-400">{project.why_it_matters}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-zinc-700">
                    {project.start_date && (
                      <div>
                        <p className="text-xs text-zinc-500">Start Date</p>
                        <p className="text-sm text-white">{project.start_date}</p>
                      </div>
                    )}
                    {project.target_date && (
                      <div>
                        <p className="text-xs text-zinc-500">Target Date</p>
                        <p className="text-sm text-white">{project.target_date}</p>
                      </div>
                    )}
                    {(project.estimated_hours_min || project.estimated_hours_max) && (
                      <div>
                        <p className="text-xs text-zinc-500">Estimated Hours</p>
                        <p className="text-sm text-white">
                          {project.estimated_hours_min}-{project.estimated_hours_max}h
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-zinc-500">Tasks</p>
                      <p className="text-sm text-white">{tasks.length} tasks</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tasks by Phase */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Generated Tasks ({tasks.length})</h3>

                <div className="space-y-2">
                  {phases.map(phase => {
                    const phaseTasks = tasksByPhase[phase];
                    if (phaseTasks.length === 0) return null;

                    const isExpanded = expandedPhases.has(phase);

                    return (
                      <div key={phase} className="bg-zinc-800/50 rounded-xl overflow-hidden">
                        <button
                          onClick={() => togglePhase(phase)}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-800 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-zinc-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-zinc-400" />
                            )}
                            <span className="text-sm font-medium text-white capitalize">{phase}</span>
                            <span className="text-xs text-zinc-500">({phaseTasks.length} tasks)</span>
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="px-4 pb-3 space-y-2">
                            {phaseTasks.map((task, i) => (
                              <div
                                key={i}
                                className="p-3 bg-zinc-900/50 rounded-lg border border-zinc-800"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <h5 className="text-sm font-medium text-white truncate">
                                        {task.title}
                                      </h5>
                                      {getAIPotentialIcon(task.ai_potential)}
                                      {task.is_critical_path && (
                                        <span className="text-xs text-red-400">Critical</span>
                                      )}
                                    </div>
                                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                                      {task.description}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className={`px-1.5 py-0.5 rounded text-xs ${getDifficultyColor(task.difficulty)}`}>
                                      {task.difficulty}
                                    </span>
                                    <span className="text-xs text-zinc-500 flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {task.estimated_hours}h
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {project && (
          <div className="px-6 py-4 border-t border-zinc-800 flex items-center justify-between">
            <button
              onClick={() => {
                setProject(null);
                setTasks([]);
                setSummary('');
              }}
              className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Start Over
            </button>
            <button
              onClick={handleCreate}
              disabled={creating}
              className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-xl text-white font-medium transition-colors"
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Create Project & {tasks.length} Tasks
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
