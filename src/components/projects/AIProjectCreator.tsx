'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Loader2, Check, ChevronDown, ChevronRight, ChevronUp, Clock, Zap, Send, MessageSquare, Edit3, RefreshCw, AlertCircle, ArrowRight, Plus, ExternalLink, Package, Users, Target, Lightbulb } from 'lucide-react';

interface GeneratedTask {
  title: string;
  description: string;
  phase: string;
  status: string;
  priority?: string;
  difficulty: string;
  ai_potential: string;
  ai_assist_description?: string;
  estimated_hours: string;
  is_foundational: boolean;
  is_critical_path: boolean;
  acceptance_criteria?: string[];
  tools_needed?: string[];
  knowledge_areas?: string[];
  deliverables?: string[];
  order_index: number;
}

interface GeneratedProject {
  title: string;
  slug: string;
  description: string;
  status: string;
  priority: string;
  difficulty?: string;
  category?: string;
  start_date?: string;
  target_date?: string;
  estimated_hours_min?: number;
  estimated_hours_max?: number;
  owner_team_id?: string;
  pillar_id?: string;
  // Rich fields
  problem_statement?: string;
  why_it_matters?: string;
  deliverables?: string[];
  benefits?: string[];
  human_role_before?: string;
  human_role_after?: string;
  who_is_empowered?: string[];
  new_capabilities?: string[];
  primary_users?: string[];
  current_loa?: string;
  potential_loa?: string;
  ops_process?: string;
  data_required?: string[];
  data_generates?: string[];
  data_improves?: string[];
  data_status?: string;
  resources_used?: string[];
  api_endpoints?: string[];
  integrations_needed?: string[];
  missing_api_data?: string[];
  prerequisites?: string[];
  depends_on?: string[];
  enables?: string[];
  related_to?: string[];
  tags?: string[];
  next_milestone?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  type?: 'question' | 'refinement' | 'generated';
}

interface AIProjectCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: () => void;
}

// Match result types for similarity detection
interface MatchedProject {
  type: 'project' | 'task';
  id: string;
  title: string;
  slug: string;
  similarity_reason: string;
  overlap_percentage?: number;
  problem_statement?: string;
  deliverables?: string[];
  status?: string;
  priority?: string;
  pillar_name?: string;
  task_count?: number;
}

interface MatchResult {
  matchType: 'exact' | 'similar' | 'task_candidate' | 'new';
  matches: MatchedProject[];
  suggestion: string;
  reasoning?: string;
}

type Stage = 'input' | 'analyzing' | 'suggestions' | 'task_preview' | 'questions' | 'generating' | 'preview' | 'refining';

export function AIProjectCreator({ isOpen, onClose, onProjectCreated }: AIProjectCreatorProps) {
  // Form inputs
  const [projectIdea, setProjectIdea] = useState('');
  const [problemSolved, setProblemSolved] = useState('');
  const [expectedDeliverables, setExpectedDeliverables] = useState('');

  // Stage management
  const [stage, setStage] = useState<Stage>('input');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  // Generated content
  const [project, setProject] = useState<GeneratedProject | null>(null);
  const [tasks, setTasks] = useState<GeneratedTask[]>([]);
  const [summary, setSummary] = useState('');

  // Conversation for questions and refinement
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [aiQuestions, setAiQuestions] = useState<string[]>([]);
  const [questionAnswers, setQuestionAnswers] = useState<Record<number, string>>({});

  // UI state
  const [error, setError] = useState<string | null>(null);
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set(['discovery', 'planning', 'development']));

  // Similarity matching state
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [expandedMatches, setExpandedMatches] = useState<Set<string>>(new Set());
  const [userDifferenceReason, setUserDifferenceReason] = useState('');
  const [selectedProjectForTask, setSelectedProjectForTask] = useState<MatchedProject | null>(null);
  const [generatedTaskForExisting, setGeneratedTaskForExisting] = useState<GeneratedTask | null>(null);
  const [taskRationale, setTaskRationale] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInitialSubmit = async () => {
    if (!projectIdea.trim()) return;

    setLoading(true);
    setError(null);
    setStage('analyzing');

    try {
      // First, check for similar existing projects
      const matchResponse = await fetch('/api/ai/create-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: projectIdea.trim(),
          problemSolved: problemSolved.trim(),
          expectedDeliverables: expectedDeliverables.trim(),
          mode: 'match'
        })
      });

      const matchData = await matchResponse.json();

      if (!matchResponse.ok) {
        throw new Error(matchData.error || 'Failed to check for similar projects');
      }

      // If matches found (not 'new'), show suggestions
      if (matchData.matchType !== 'new' && matchData.matches?.length > 0) {
        setMatchResult(matchData);
        setStage('suggestions');
        setLoading(false);
        return;
      }

      // No matches found, proceed to analyze for questions
      await proceedToAnalyze();
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process request');
      setStage('input');
    } finally {
      setLoading(false);
    }
  };

  // Proceed to analyze mode (called after match or when user says "this is different")
  const proceedToAnalyze = async (differenceReason?: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/create-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: projectIdea.trim(),
          problemSolved: problemSolved.trim(),
          expectedDeliverables: expectedDeliverables.trim(),
          userDifferenceReason: differenceReason || userDifferenceReason,
          mode: 'analyze'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze project');
      }

      if (data.needsQuestions && data.questions?.length > 0) {
        setAiQuestions(data.questions);
        setStage('questions');
      } else if (data.project) {
        setProject(data.project);
        setTasks(data.tasks || []);
        setSummary(data.summary || '');
        setStage('preview');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process request');
      setStage('input');
    } finally {
      setLoading(false);
    }
  };

  // Handle "This is different, create new project"
  const handleProceedWithNewProject = async () => {
    setStage('generating');
    await proceedToAnalyze(userDifferenceReason);
  };

  // Handle "Add as task to existing project"
  const handleAddAsTask = async (matchedProject: MatchedProject) => {
    setSelectedProjectForTask(matchedProject);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/create-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: projectIdea.trim(),
          problemSolved: problemSolved.trim(),
          expectedDeliverables: expectedDeliverables.trim(),
          targetProjectId: matchedProject.id,
          mode: 'generate_task'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate task');
      }

      setGeneratedTaskForExisting(data.task);
      setTaskRationale(data.rationale || '');
      setStage('task_preview');
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate task');
    } finally {
      setLoading(false);
    }
  };

  // Confirm adding task to existing project
  const handleConfirmTask = async () => {
    if (!generatedTaskForExisting || !selectedProjectForTask) return;

    setCreating(true);
    setError(null);

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks: [{
            ...generatedTaskForExisting,
            project_id: selectedProjectForTask.id
          }]
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create task');
      }

      onProjectCreated();
      handleClose();
    } catch (err) {
      console.error('Error creating task:', err);
      setError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setCreating(false);
    }
  };

  // Toggle match card expansion
  const toggleMatchExpansion = (matchId: string) => {
    setExpandedMatches(prev => {
      const newSet = new Set(prev);
      if (newSet.has(matchId)) {
        newSet.delete(matchId);
      } else {
        newSet.add(matchId);
      }
      return newSet;
    });
  };

  const handleAnswerQuestions = async () => {
    // Validate all questions are answered
    const answeredCount = Object.values(questionAnswers).filter(a => a.trim()).length;
    if (answeredCount < aiQuestions.length) {
      setError('Please answer all questions before continuing');
      return;
    }

    setLoading(true);
    setStage('generating');
    setError(null);

    try {
      const response = await fetch('/api/ai/create-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: projectIdea.trim(),
          problemSolved: problemSolved.trim(),
          expectedDeliverables: expectedDeliverables.trim(),
          clarifications: aiQuestions.map((q, i) => ({
            question: q,
            answer: questionAnswers[i] || ''
          })),
          mode: 'generate'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate project');
      }

      setProject(data.project);
      setTasks(data.tasks || []);
      setSummary(data.summary || '');
      setStage('preview');
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate project');
      setStage('questions');
    } finally {
      setLoading(false);
    }
  };

  const handleRefinementRequest = async () => {
    if (!currentInput.trim() || !project) return;

    const userMessage = currentInput.trim();
    setCurrentInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);
    setStage('refining');

    try {
      const response = await fetch('/api/ai/create-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: projectIdea.trim(),
          problemSolved: problemSolved.trim(),
          expectedDeliverables: expectedDeliverables.trim(),
          currentProject: project,
          currentTasks: tasks,
          refinementRequest: userMessage,
          mode: 'refine'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to refine project');
      }

      setProject(data.project);
      setTasks(data.tasks || []);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.refinementSummary || 'I\'ve updated the project based on your feedback.',
        type: 'refinement'
      }]);
      setStage('preview');
    } catch (err) {
      console.error('Error:', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I had trouble making those changes. Please try again or describe differently.',
        type: 'refinement'
      }]);
      setStage('preview');
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

        if (!tasksResponse.ok) {
          const tasksResult = await tasksResponse.json();
          alert(`Project created but some tasks failed: ${tasksResult.error}`);
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
    setProjectIdea('');
    setProblemSolved('');
    setExpectedDeliverables('');
    setProject(null);
    setTasks([]);
    setSummary('');
    setMessages([]);
    setCurrentInput('');
    setAiQuestions([]);
    setQuestionAnswers({});
    setError(null);
    setStage('input');
    // Reset similarity matching state
    setMatchResult(null);
    setExpandedMatches(new Set());
    setUserDifferenceReason('');
    setSelectedProjectForTask(null);
    setGeneratedTaskForExisting(null);
    setTaskRationale('');
    onClose();
  };

  const handleStartOver = () => {
    setProject(null);
    setTasks([]);
    setSummary('');
    setMessages([]);
    setAiQuestions([]);
    setQuestionAnswers({});
    setStage('input');
    // Reset similarity matching state
    setMatchResult(null);
    setExpandedMatches(new Set());
    setUserDifferenceReason('');
    setSelectedProjectForTask(null);
    setGeneratedTaskForExisting(null);
    setTaskRationale('');
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
    switch (difficulty?.toLowerCase()) {
      case 'hard': return 'bg-red-500/20 text-red-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'easy': return 'bg-green-500/20 text-green-400';
      default: return 'bg-zinc-500/20 text-zinc-400';
    }
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
              <p className="text-sm text-zinc-400">
                {stage === 'input' && 'Describe your project idea'}
                {stage === 'analyzing' && 'Checking for similar projects...'}
                {stage === 'suggestions' && 'I found some related projects'}
                {stage === 'task_preview' && 'Review your new task'}
                {stage === 'questions' && 'Answer a few questions'}
                {stage === 'generating' && 'Generating your project...'}
                {stage === 'preview' && 'Review your project draft'}
                {stage === 'refining' && 'Refining your project...'}
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Stage 1: Initial Input */}
          {stage === 'input' && (
            <div className="p-6">
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="text-center mb-8">
                  <Sparkles className="w-12 h-12 text-violet-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">What do you want to build?</h3>
                  <p className="text-zinc-400 text-sm">
                    Provide details about your project. The more context, the better the plan!
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-white mb-2 block">
                    Project Idea <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={projectIdea}
                    onChange={(e) => setProjectIdea(e.target.value)}
                    placeholder="Describe your project idea in a few sentences..."
                    className="w-full h-24 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-white mb-2 block">
                    Problem Being Solved
                  </label>
                  <textarea
                    value={problemSolved}
                    onChange={(e) => setProblemSolved(e.target.value)}
                    placeholder="What problem does this project solve? What pain points does it address?"
                    className="w-full h-20 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-white mb-2 block">
                    Expected Deliverables
                  </label>
                  <textarea
                    value={expectedDeliverables}
                    onChange={(e) => setExpectedDeliverables(e.target.value)}
                    placeholder="What are the expected outputs? What should be delivered at the end?"
                    className="w-full h-20 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                    disabled={loading}
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleInitialSubmit}
                  disabled={!projectIdea.trim() || loading}
                  className="w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Continue
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Stage: Analyzing - Loading state while checking for similar projects */}
          {stage === 'analyzing' && (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-violet-400 animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Checking for similar projects...</h3>
                <p className="text-zinc-400 text-sm">
                  Looking through existing projects and tasks to find the best fit.
                </p>
              </div>
            </div>
          )}

          {/* Stage: Suggestions - Show similar projects found */}
          {stage === 'suggestions' && matchResult && (
            <div className="p-6">
              <div className="max-w-2xl mx-auto space-y-6">
                {/* AI Suggestion Banner */}
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-amber-300 font-medium mb-1">AI Suggestion</p>
                      <p className="text-sm text-zinc-300">
                        {matchResult.suggestion}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Match Cards */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    {matchResult.matchType === 'exact' ? 'Existing project found' :
                     matchResult.matchType === 'task_candidate' ? 'Could be added to existing project' :
                     'Similar projects'}
                  </h4>

                  {matchResult.matches.map((match) => (
                    <div
                      key={match.id}
                      className="bg-zinc-800/50 border border-zinc-700 rounded-xl overflow-hidden"
                    >
                      {/* Match Card Header */}
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-semibold text-white">{match.title}</h5>
                              <span className="px-2 py-0.5 text-xs bg-violet-500/20 text-violet-300 rounded">
                                Project
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-zinc-500">
                              {match.status && (
                                <span className="px-2 py-0.5 bg-zinc-700 rounded">{match.status}</span>
                              )}
                              {match.priority && (
                                <span className={`px-2 py-0.5 rounded ${
                                  match.priority === 'critical' ? 'bg-red-500/20 text-red-300' :
                                  match.priority === 'high' ? 'bg-orange-500/20 text-orange-300' :
                                  'bg-zinc-700 text-zinc-300'
                                }`}>{match.priority}</span>
                              )}
                              {match.pillar_name && (
                                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded">
                                  {match.pillar_name}
                                </span>
                              )}
                            </div>
                          </div>
                          {match.overlap_percentage && (
                            <div className="text-right">
                              <span className="text-lg font-bold text-emerald-400">{match.overlap_percentage}%</span>
                              <p className="text-xs text-zinc-500">match</p>
                            </div>
                          )}
                        </div>

                        {/* Problem Statement */}
                        {match.problem_statement && (
                          <p className="text-sm text-zinc-400 mb-3 line-clamp-2">
                            {match.problem_statement}
                          </p>
                        )}

                        {/* Match Reason */}
                        <div className="flex items-start gap-2 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg mb-3">
                          <Zap className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-emerald-300">{match.similarity_reason}</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleMatchExpansion(match.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded-lg transition-colors"
                          >
                            {expandedMatches.has(match.id) ? (
                              <>
                                <ChevronUp className="w-3.5 h-3.5" />
                                Hide Details
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-3.5 h-3.5" />
                                View Details
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleAddAsTask(match)}
                            disabled={loading}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add as Task to This Project
                          </button>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {expandedMatches.has(match.id) && (
                        <div className="px-4 pb-4 pt-0 border-t border-zinc-700 mt-2">
                          <div className="pt-4 space-y-3">
                            {match.deliverables && match.deliverables.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-zinc-400 mb-1.5 flex items-center gap-1">
                                  <Package className="w-3.5 h-3.5" />
                                  Deliverables
                                </p>
                                <ul className="space-y-1">
                                  {match.deliverables.slice(0, 4).map((d, i) => (
                                    <li key={i} className="text-xs text-zinc-300 flex items-start gap-2">
                                      <Check className="w-3 h-3 mt-0.5 text-emerald-500 flex-shrink-0" />
                                      {d}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {match.task_count !== undefined && (
                              <p className="text-xs text-zinc-400">
                                <span className="font-medium text-zinc-300">{match.task_count}</span> tasks in this project
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* User Difference Explanation */}
                <div>
                  <label className="text-sm font-medium text-zinc-400 mb-2 block">
                    Think this is different? Tell me why (optional)
                  </label>
                  <textarea
                    value={userDifferenceReason}
                    onChange={(e) => setUserDifferenceReason(e.target.value)}
                    placeholder="Explain how your request is different from the projects above..."
                    className="w-full h-20 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                    disabled={loading}
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
                    {error}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleStartOver}
                    className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleProceedWithNewProject}
                    disabled={loading}
                    className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-5 h-5" />
                        This is Different - Create New Project
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Stage: Task Preview - Show AI-generated task for existing project */}
          {stage === 'task_preview' && selectedProjectForTask && generatedTaskForExisting && (
            <div className="p-6">
              <div className="max-w-2xl mx-auto space-y-6">
                {/* Target Project Info */}
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Target className="w-5 h-5 text-emerald-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-emerald-300 font-medium mb-1">Adding task to:</p>
                      <p className="text-white font-semibold">{selectedProjectForTask.title}</p>
                    </div>
                  </div>
                </div>

                {/* Generated Task Card */}
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-1">
                        {generatedTaskForExisting.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="px-2 py-0.5 bg-violet-500/20 text-violet-300 rounded">
                          {generatedTaskForExisting.phase}
                        </span>
                        <span className={`px-2 py-0.5 rounded ${
                          generatedTaskForExisting.priority === 'critical' ? 'bg-red-500/20 text-red-300' :
                          generatedTaskForExisting.priority === 'high' ? 'bg-orange-500/20 text-orange-300' :
                          generatedTaskForExisting.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-green-500/20 text-green-300'
                        }`}>
                          {generatedTaskForExisting.priority}
                        </span>
                        <span className={`px-2 py-0.5 rounded ${
                          generatedTaskForExisting.difficulty === 'hard' ? 'bg-red-500/20 text-red-300' :
                          generatedTaskForExisting.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-green-500/20 text-green-300'
                        }`}>
                          {generatedTaskForExisting.difficulty}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-zinc-400 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {generatedTaskForExisting.estimated_hours}h
                      </span>
                      {generatedTaskForExisting.ai_potential && generatedTaskForExisting.ai_potential !== 'none' && (
                        <span className="text-xs text-violet-400 flex items-center gap-1 mt-1">
                          <Zap className="w-3 h-3" />
                          {generatedTaskForExisting.ai_potential} AI potential
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-zinc-300 mb-4">
                    {generatedTaskForExisting.description}
                  </p>

                  {/* Acceptance Criteria */}
                  {generatedTaskForExisting.acceptance_criteria && generatedTaskForExisting.acceptance_criteria.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-zinc-400 mb-2">Acceptance Criteria:</p>
                      <ul className="space-y-1">
                        {generatedTaskForExisting.acceptance_criteria.map((criterion, i) => (
                          <li key={i} className="text-xs text-zinc-300 flex items-start gap-2">
                            <Check className="w-3 h-3 mt-0.5 text-emerald-500 flex-shrink-0" />
                            {criterion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* AI Assist Description */}
                  {generatedTaskForExisting.ai_assist_description && (
                    <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-lg">
                      <p className="text-xs text-violet-300">
                        <Zap className="w-3 h-3 inline mr-1" />
                        <span className="font-medium">AI can help:</span> {generatedTaskForExisting.ai_assist_description}
                      </p>
                    </div>
                  )}
                </div>

                {/* Rationale */}
                {taskRationale && (
                  <div className="text-sm text-zinc-400 italic">
                    <Lightbulb className="w-4 h-4 inline mr-1 text-amber-400" />
                    {taskRationale}
                  </div>
                )}

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
                    {error}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setGeneratedTaskForExisting(null);
                      setSelectedProjectForTask(null);
                      setStage('suggestions');
                    }}
                    className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleConfirmTask}
                    disabled={creating}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {creating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Adding Task...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        Add Task to Project
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Stage 2: AI Questions */}
          {stage === 'questions' && (
            <div className="p-6">
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="p-4 bg-violet-500/10 border border-violet-500/30 rounded-xl">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-5 h-5 text-violet-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-violet-300 font-medium mb-1">A few quick questions</p>
                      <p className="text-sm text-zinc-400">
                        To create the best project plan, I need a bit more information.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {aiQuestions.map((question, index) => (
                    <div key={index}>
                      <label className="text-sm font-medium text-white mb-2 block">
                        {index + 1}. {question}
                      </label>
                      <textarea
                        value={questionAnswers[index] || ''}
                        onChange={(e) => setQuestionAnswers(prev => ({ ...prev, [index]: e.target.value }))}
                        placeholder="Your answer..."
                        className="w-full h-20 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                        disabled={loading}
                      />
                    </div>
                  ))}
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setStage('input')}
                    className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleAnswerQuestions}
                    disabled={loading}
                    className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Generate Project Plan
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Stage 3: Generating */}
          {stage === 'generating' && (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-violet-400 animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Creating your project plan...</h3>
                <p className="text-zinc-400 text-sm">
                  Generating detailed project structure with tasks, timelines, and more.
                </p>
              </div>
            </div>
          )}

          {/* Stage 4 & 5: Preview / Refining */}
          {(stage === 'preview' || stage === 'refining') && project && (
            <div className="p-6 space-y-6">
              {/* Draft Banner */}
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <Edit3 className="w-5 h-5 text-amber-400" />
                  <div>
                    <p className="text-sm text-amber-300 font-medium">Draft Preview</p>
                    <p className="text-sm text-zinc-400">
                      Review the plan below. Request changes or approve to publish.
                    </p>
                  </div>
                </div>
              </div>

              {/* Summary */}
              {summary && (
                <div className="p-4 bg-violet-500/10 border border-violet-500/30 rounded-xl">
                  <p className="text-sm text-violet-300">{summary}</p>
                </div>
              )}

              {/* Project Details */}
              <div className="bg-zinc-800/50 rounded-xl p-6 space-y-4">
                <h3 className="text-lg font-semibold text-white">Project Details</h3>

                {/* Title & Badges */}
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
                  {project.current_loa && project.potential_loa && (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-emerald-500/20 text-emerald-300">
                      {project.current_loa} → {project.potential_loa}
                    </span>
                  )}
                </div>

                {/* Problem Statement */}
                {project.problem_statement && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-xs font-medium text-red-400 mb-1">Problem Being Solved</p>
                    <p className="text-sm text-zinc-300">{project.problem_statement}</p>
                  </div>
                )}

                {/* Description */}
                <p className="text-sm text-zinc-300">{project.description}</p>

                {/* Why it matters */}
                {project.why_it_matters && (
                  <div className="text-sm text-zinc-400 pl-3 border-l-2 border-blue-500/50 italic">
                    <span className="text-blue-400 font-medium">Why it matters: </span>
                    {project.why_it_matters}
                  </div>
                )}

                {/* Deliverables */}
                {project.deliverables && project.deliverables.length > 0 && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                    <p className="text-xs font-medium text-emerald-400 mb-2">Expected Deliverables</p>
                    <ul className="space-y-1">
                      {project.deliverables.map((item, i) => (
                        <li key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 mt-0.5 text-emerald-500 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Benefits */}
                {project.benefits && project.benefits.length > 0 && (
                  <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-xs font-medium text-blue-400 mb-2">Key Benefits</p>
                    <ul className="space-y-1">
                      {project.benefits.map((item, i) => (
                        <li key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                          <Zap className="w-3.5 h-3.5 mt-0.5 text-blue-400 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Human Impact */}
                {(project.human_role_before || project.human_role_after) && (
                  <div className="grid grid-cols-2 gap-3">
                    {project.human_role_before && (
                      <div className="p-3 bg-zinc-800 rounded-lg">
                        <p className="text-xs text-zinc-500 mb-1">Before (Manual)</p>
                        <p className="text-sm text-zinc-300">{project.human_role_before}</p>
                      </div>
                    )}
                    {project.human_role_after && (
                      <div className="p-3 bg-zinc-800 rounded-lg">
                        <p className="text-xs text-zinc-500 mb-1">After (Automated)</p>
                        <p className="text-sm text-zinc-300">{project.human_role_after}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Tags Row */}
                <div className="flex flex-wrap gap-2">
                  {project.who_is_empowered?.map((item, i) => (
                    <span key={`emp-${i}`} className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-300 rounded">
                      {item}
                    </span>
                  ))}
                  {project.primary_users?.map((item, i) => (
                    <span key={`user-${i}`} className="px-2 py-0.5 text-xs bg-cyan-500/20 text-cyan-300 rounded">
                      {item}
                    </span>
                  ))}
                  {project.tags?.map((tag, i) => (
                    <span key={`tag-${i}`} className="px-2 py-0.5 text-xs bg-zinc-700 text-zinc-300 rounded">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Data Flow */}
                {(project.data_required?.length || project.data_generates?.length) && (
                  <div className="flex flex-wrap gap-1">
                    {project.data_required?.map((item, i) => (
                      <span key={`req-${i}`} className="px-2 py-0.5 text-xs bg-red-500/10 text-red-300 rounded">
                        ← {item}
                      </span>
                    ))}
                    {project.data_generates?.map((item, i) => (
                      <span key={`gen-${i}`} className="px-2 py-0.5 text-xs bg-green-500/10 text-green-300 rounded">
                        → {item}
                      </span>
                    ))}
                  </div>
                )}

                {/* Timeline & Stats */}
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

                {/* Next Milestone */}
                {project.next_milestone && (
                  <div className="pt-2">
                    <p className="text-xs text-amber-400">
                      🎯 Next Milestone: {project.next_milestone}
                    </p>
                  </div>
                )}
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
                              <div key={i} className="p-3 bg-zinc-900/50 rounded-lg border border-zinc-800">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <h5 className="text-sm font-medium text-white truncate">{task.title}</h5>
                                      {(task.ai_potential === 'high' || task.ai_potential === 'full') && (
                                        <Zap className="w-3.5 h-3.5 text-violet-400" />
                                      )}
                                      {task.is_critical_path && (
                                        <span className="text-xs text-red-400">Critical</span>
                                      )}
                                    </div>
                                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{task.description}</p>
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

              {/* Refinement Chat */}
              {messages.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-zinc-400">Refinement History</h4>
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-blue-500/10 border border-blue-500/30 ml-8'
                          : 'bg-zinc-800/50 mr-8'
                      }`}
                    >
                      <p className="text-sm text-zinc-300">{msg.content}</p>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}

              {/* Refinement Input */}
              <div className="bg-zinc-800/50 rounded-xl p-4">
                <p className="text-sm text-zinc-400 mb-3">
                  Want changes? Describe what you'd like to modify:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    placeholder="e.g., Add more testing tasks, change priority to critical, rename the project..."
                    className="flex-1 px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    disabled={loading}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleRefinementRequest();
                      }
                    }}
                  />
                  <button
                    onClick={handleRefinementRequest}
                    disabled={!currentInput.trim() || loading}
                    className="px-4 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 rounded-lg text-white transition-colors"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </button>
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
        {(stage === 'preview' || stage === 'refining') && project && (
          <div className="px-6 py-4 border-t border-zinc-800 flex items-center justify-between">
            <button
              onClick={handleStartOver}
              className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Start Over
            </button>
            <button
              onClick={handleCreate}
              disabled={creating || loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-xl text-white font-medium transition-colors"
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Approve & Publish
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
