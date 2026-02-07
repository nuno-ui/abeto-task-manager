'use client';

import { useState, useEffect } from 'react';
import { ReviewProgress } from '@/components/reviews/ReviewProgress';
import { ReviewQuestionCard } from '@/components/reviews/ReviewQuestionCard';
import { ProjectReviewInfo } from '@/components/reviews/ProjectReviewInfo';
import { TaskReviewPanel } from '@/components/reviews/TaskReviewPanel';
import { CelebrationModal } from '@/components/reviews/CelebrationModal';
import { Project, Task, ReviewFeedback } from '@/types/database';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  SkipForward,
  MessageSquare,
  Send,
  Layers,
  Users,
  Target,
  Zap,
  CheckCircle,
  Clock,
  X,
  Star,
  Info,
  Briefcase,
  Code2,
  Eye,
} from 'lucide-react';

interface EnrichedProject extends Project {
  tasks: Task[];
  review_status: {
    review_count: number;
    all_reviewed: boolean;
    alignment_score: number | null;
  };
  my_review_session: {
    id: string;
    status: string;
  } | null;
  is_reviewed_by_me: boolean;
}

interface ReviewStats {
  totalProjects: number;
  reviewedProjects: number;
  pendingProjects: number;
  progress: number;
}

// Unified review questions - applicable regardless of reviewer's background
interface ReviewQuestion {
  id: string;
  question: string;
  description: string;
  type: 'rating' | 'boolean' | 'text' | 'select';
  options?: { value: string; label: string; color?: string }[];
  fieldRef?: string;
}

const REVIEW_QUESTIONS: ReviewQuestion[] = [
  {
    id: 'strategic_alignment',
    question: 'Strategic Alignment',
    description: 'How well does this project align with company goals?',
    type: 'select',
    options: [
      { value: 'weak', label: 'Weak alignment', color: 'red' },
      { value: 'moderate', label: 'Moderate alignment', color: 'yellow' },
      { value: 'strong', label: 'Strong alignment', color: 'green' },
    ],
  },
  {
    id: 'priority_check',
    question: 'Priority Assessment',
    description: 'Is the priority level appropriate?',
    type: 'select',
    options: [
      { value: 'too_high', label: 'Should be lower', color: 'red' },
      { value: 'correct', label: 'Priority is correct', color: 'green' },
      { value: 'too_low', label: 'Should be higher', color: 'blue' },
    ],
    fieldRef: 'priority',
  },
  {
    id: 'complexity_check',
    question: 'Complexity Assessment',
    description: 'Is the difficulty rating accurate?',
    type: 'select',
    options: [
      { value: 'overestimated', label: 'Simpler than stated', color: 'blue' },
      { value: 'accurate', label: 'Complexity is accurate', color: 'green' },
      { value: 'underestimated', label: 'More complex than stated', color: 'red' },
    ],
    fieldRef: 'difficulty',
  },
  {
    id: 'hours_check',
    question: 'Hours Estimate',
    description: 'Are the estimated hours realistic?',
    type: 'select',
    options: [
      { value: 'too_low', label: 'Will take longer', color: 'red' },
      { value: 'realistic', label: 'Estimate is good', color: 'green' },
      { value: 'too_high', label: 'Could be faster', color: 'blue' },
    ],
    fieldRef: 'estimated_hours_min',
  },
  {
    id: 'pain_point_valid',
    question: 'Pain Point Validation',
    description: 'Does this solve a real problem?',
    type: 'select',
    options: [
      { value: 'low', label: 'Not a real pain point', color: 'red' },
      { value: 'medium', label: 'Moderate pain', color: 'yellow' },
      { value: 'high', label: 'Critical pain point', color: 'green' },
    ],
  },
  {
    id: 'roi_confidence',
    question: 'ROI Confidence',
    description: 'How confident are you in the expected value?',
    type: 'select',
    options: [
      { value: 'low', label: 'Low confidence', color: 'red' },
      { value: 'medium', label: 'Moderate confidence', color: 'yellow' },
      { value: 'high', label: 'High confidence', color: 'green' },
    ],
  },
  {
    id: 'task_list_quality',
    question: 'Task List Quality',
    description: 'Is the task breakdown well-structured?',
    type: 'select',
    options: [
      { value: 'needs_work', label: 'Needs significant work', color: 'red' },
      { value: 'acceptable', label: 'Acceptable', color: 'yellow' },
      { value: 'well_structured', label: 'Well structured', color: 'green' },
    ],
  },
  {
    id: 'review_comment',
    question: 'Additional Notes',
    description: 'Any concerns, suggestions, or feedback?',
    type: 'text',
  },
];

const statusColors: Record<string, string> = {
  idea: 'bg-indigo-500',
  planning: 'bg-blue-500',
  in_progress: 'bg-yellow-500',
  on_hold: 'bg-orange-500',
  completed: 'bg-green-500',
  cancelled: 'bg-red-500',
};

const priorityColors: Record<string, string> = {
  critical: 'text-red-400',
  high: 'text-orange-400',
  medium: 'text-yellow-400',
  low: 'text-green-400',
};

export default function ReviewsPage() {
  const router = useRouter();
  const { user, preferredArea, isLoading: authLoading, isAuthenticated } = useAuth();
  const [projects, setProjects] = useState<EnrichedProject[]>([]);
  const [pendingProjects, setPendingProjects] = useState<EnrichedProject[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stats, setStats] = useState<ReviewStats>({ totalProjects: 0, reviewedProjects: 0, pendingProjects: 0, progress: 0 });
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, ReviewFeedback>>({});
  const [comments, setComments] = useState<{ id: string; content: string; task_id?: string }[]>([]);
  const [newComment, setNewComment] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [leftPanel, setLeftPanel] = useState<'info' | 'tasks'>('info');
  const [reviewAnswers, setReviewAnswers] = useState<Record<string, string | number>>({});
  const [taskFeedback, setTaskFeedback] = useState<Record<string, { taskId: string; hoursCheck?: 'too_low' | 'accurate' | 'too_high'; hasBlockers?: boolean; comment?: string }>>({});
  const [streak, setStreak] = useState(0);
  const [showKeyboardHints, setShowKeyboardHints] = useState(true);
  const [showIntro, setShowIntro] = useState(true);

  const reviewerId = user?.id || null;

  // Load streak from localStorage
  useEffect(() => {
    const savedStreak = localStorage.getItem('reviewStreak');
    const lastReviewDate = localStorage.getItem('lastReviewDate');
    const today = new Date().toDateString();

    if (savedStreak && lastReviewDate === today) {
      setStreak(parseInt(savedStreak, 10));
    } else if (lastReviewDate && lastReviewDate !== today) {
      localStorage.setItem('reviewStreak', '0');
      setStreak(0);
    }

    // Check if user has seen intro
    const hasSeenIntro = localStorage.getItem('reviewIntroSeen');
    if (hasSeenIntro) {
      setShowIntro(false);
    }
  }, []);

  // Fetch projects when authenticated
  useEffect(() => {
    if (reviewerId && !authLoading) {
      fetchProjects();
    }
  }, [reviewerId, authLoading]);

  const fetchProjects = async () => {
    if (!reviewerId) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/reviews?reviewer_id=${reviewerId}`);
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
        setPendingProjects(data.pendingReview || []);
        setStats(data.stats || { totalProjects: 0, reviewedProjects: 0, pendingProjects: 0, progress: 0 });
        setFeedbackCount(data.stats?.reviewedProjects || 0);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismissIntro = () => {
    setShowIntro(false);
    localStorage.setItem('reviewIntroSeen', 'true');
  };

  const startReviewSession = async (projectId: string) => {
    if (!reviewerId) return;
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          reviewer_id: reviewerId,
        }),
      });
      if (response.ok) {
        const session = await response.json();
        setSessionId(session.id);
        return session.id;
      }
    } catch (error) {
      console.error('Error starting review session:', error);
    }
    return null;
  };

  const handleSubmitFeedback = async (fieldName: string, proposedValue: string, comment?: string) => {
    if (!sessionId) return;
    try {
      const currentProject = pendingProjects[currentIndex];
      const response = await fetch('/api/reviews/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          review_session_id: sessionId,
          field_name: fieldName,
          current_value: String((currentProject as any)[fieldName] || ''),
          proposed_value: proposedValue,
          comment: comment || null,
        }),
      });
      if (response.ok) {
        const newFeedback = await response.json();
        setFeedback(prev => ({ ...prev, [fieldName]: newFeedback }));
        setFeedbackCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const handleAddComment = async () => {
    if (!sessionId || !newComment.trim()) return;
    const currentProject = pendingProjects[currentIndex];
    try {
      const response = await fetch('/api/reviews/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          review_session_id: sessionId,
          project_id: currentProject.id,
          task_id: selectedTaskId || null,
          content: newComment,
        }),
      });
      if (response.ok) {
        const comment = await response.json();
        setComments(prev => [...prev, comment]);
        setNewComment('');
        setSelectedTaskId(null);
        setCommentCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleCompleteReview = async () => {
    if (!sessionId) return;
    setSubmitting(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: sessionId,
          status: 'completed',
        }),
      });
      if (response.ok) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        localStorage.setItem('reviewStreak', newStreak.toString());
        localStorage.setItem('lastReviewDate', new Date().toDateString());

        if (currentIndex < pendingProjects.length - 1) {
          setCurrentIndex(prev => prev + 1);
          setSessionId(null);
          setFeedback({});
          setComments([]);
          setReviewAnswers({});
          setTaskFeedback({});
          setLeftPanel('info');
          setStats(prev => ({
            ...prev,
            reviewedProjects: prev.reviewedProjects + 1,
            pendingProjects: prev.pendingProjects - 1,
            progress: Math.round(((prev.reviewedProjects + 1) / prev.totalProjects) * 100),
          }));
        } else {
          setShowCelebration(true);
        }
      }
    } catch (error) {
      console.error('Error completing review:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    if (currentIndex < pendingProjects.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSessionId(null);
      setFeedback({});
      setComments([]);
      setReviewAnswers({});
      setTaskFeedback({});
      setLeftPanel('info');
    }
  };

  const handleAnswerChange = async (questionId: string, value: string | number) => {
    setReviewAnswers(prev => ({ ...prev, [questionId]: value }));

    if (sessionId) {
      try {
        await fetch('/api/reviews/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            review_session_id: sessionId,
            field_name: questionId,
            current_value: '',
            proposed_value: String(value),
          }),
        });
        setFeedbackCount(prev => prev + 1);
      } catch (error) {
        console.error('Error saving answer:', error);
      }
    }
  };

  const handleTaskFeedback = (taskId: string, feedback: Partial<{ hoursCheck?: 'too_low' | 'accurate' | 'too_high'; hasBlockers?: boolean; comment?: string }>) => {
    setTaskFeedback(prev => ({
      ...prev,
      [taskId]: { ...prev[taskId], taskId, ...feedback },
    }));
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setSessionId(null);
      setFeedback({});
      setComments([]);
      setReviewAnswers({});
      setTaskFeedback({});
      setLeftPanel('info');
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (!pendingProjects[currentIndex]) return;

      switch (e.key) {
        case '1':
          setLeftPanel('info');
          break;
        case '2':
          if (pendingProjects[currentIndex]?.tasks?.length) setLeftPanel('tasks');
          break;
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleSkip();
          break;
        case 'Escape':
          setShowKeyboardHints(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, pendingProjects]);

  // Start session when viewing a new project
  useEffect(() => {
    if (pendingProjects.length > 0 && !sessionId) {
      const currentProject = pendingProjects[currentIndex];
      if (currentProject && !currentProject.is_reviewed_by_me) {
        startReviewSession(currentProject.id);
      }
    }
  }, [currentIndex, pendingProjects]);

  const currentProject = pendingProjects[currentIndex];

  // Get role-specific tips based on preferred area
  const getRoleTips = () => {
    switch (preferredArea) {
      case 'management':
        return {
          icon: Briefcase,
          color: '#6366f1',
          tips: ['Focus on strategic alignment and ROI', 'Consider resource allocation', 'Evaluate timeline feasibility'],
        };
      case 'operations_sales':
        return {
          icon: Users,
          color: '#10b981',
          tips: ['Validate real operational pain points', 'Assess adoption feasibility', 'Consider workflow impact'],
        };
      case 'product_tech':
        return {
          icon: Code2,
          color: '#f59e0b',
          tips: ['Check technical complexity', 'Evaluate hours estimates', 'Consider tech debt implications'],
        };
      default:
        return {
          icon: Target,
          color: '#8b5cf6',
          tips: ['Review from your area of expertise', 'Be honest in assessments', 'Add helpful comments'],
        };
    }
  };

  const roleTips = getRoleTips();
  const RoleIcon = roleTips.icon;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-12 gap-4">
        <p className="text-zinc-400">Please sign in to access the review system.</p>
        <a href="/login" className="px-4 py-2 bg-amber-500 text-zinc-900 font-medium rounded-lg hover:bg-amber-400">
          Sign In
        </a>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-40 bg-zinc-900 rounded-xl" />
          <div className="h-96 bg-zinc-900 rounded-xl" />
        </div>
      </div>
    );
  }

  // All done state
  if (pendingProjects.length === 0) {
    return (
      <div className="min-h-screen p-6 max-w-4xl mx-auto">
        <ReviewProgress
          totalProjects={stats.totalProjects}
          reviewedProjects={stats.reviewedProjects}
          feedbackCount={feedbackCount}
          commentCount={commentCount}
          streak={streak}
        />
        <div className="mt-8 text-center py-16 bg-zinc-900 rounded-xl border border-zinc-800">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">All Caught Up!</h2>
          <p className="text-zinc-400 mb-6">
            You&apos;ve reviewed all available projects. Great work!
          </p>
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-medium rounded-lg transition-colors inline-block"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden flex flex-col">
      <div className="p-4 flex-1 overflow-hidden flex flex-col space-y-3">
        {/* Progress */}
        <ReviewProgress
          totalProjects={stats.totalProjects}
          reviewedProjects={stats.reviewedProjects}
          feedbackCount={feedbackCount}
          commentCount={commentCount}
          streak={streak}
          currentProjectName={currentProject?.title}
        />

        {/* Intro banner - dismissible */}
        {showIntro && (
          <div className="bg-gradient-to-r from-violet-900/30 to-blue-900/20 border border-violet-700/30 rounded-xl p-4 flex-shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg" style={{ backgroundColor: roleTips.color + '20' }}>
                  <RoleIcon className="w-5 h-5" style={{ color: roleTips.color }} />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white mb-1">
                    Welcome to Project Reviews!
                  </h3>
                  <p className="text-xs text-zinc-400 mb-2">
                    Each project needs <span className="text-violet-300 font-medium">3 reviews</span> from different team members. Focus on what you know best:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {roleTips.tips.map((tip, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 bg-zinc-800/50 text-zinc-300 rounded-full">
                        {tip}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={handleDismissIntro}
                className="text-zinc-500 hover:text-zinc-300 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Keyboard hints */}
        {showKeyboardHints && currentProject && !showIntro && (
          <div className="flex items-center justify-between px-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-xs text-zinc-400">
            <div className="flex items-center gap-4">
              <span><kbd className="px-1.5 py-0.5 bg-zinc-700 rounded text-zinc-300">1</kbd> <kbd className="px-1.5 py-0.5 bg-zinc-700 rounded text-zinc-300">2</kbd> Switch Info/Tasks</span>
              <span><kbd className="px-1.5 py-0.5 bg-zinc-700 rounded text-zinc-300">←</kbd> <kbd className="px-1.5 py-0.5 bg-zinc-700 rounded text-zinc-300">→</kbd> Navigate projects</span>
            </div>
            <button onClick={() => setShowKeyboardHints(false)} className="text-zinc-500 hover:text-zinc-300">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Current Project Review Card */}
        {currentProject && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex-1 flex flex-col min-h-0">
            {/* Project Header */}
            <div className="p-4 border-b border-zinc-800 flex-shrink-0">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`w-3 h-3 rounded-full ${statusColors[currentProject.status]}`} />
                    <h2 className="text-xl font-bold text-white">{currentProject.title}</h2>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityColors[currentProject.priority]}`}>
                      {currentProject.priority}
                    </span>
                  </div>
                  <p className="text-zinc-400 text-sm">{currentProject.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-zinc-500">Project {currentIndex + 1} of {pendingProjects.length}</p>
                </div>
              </div>

              {/* Review count badge */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">Reviews:</span>
                <div className="flex items-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                        i < (currentProject.review_status?.review_count || 0)
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-zinc-800 text-zinc-500'
                      }`}
                    >
                      {i < (currentProject.review_status?.review_count || 0) ? <Check className="w-3 h-3" /> : i + 1}
                    </div>
                  ))}
                </div>
                <span className="text-xs text-zinc-500">
                  ({currentProject.review_status?.review_count || 0}/3 completed)
                </span>
              </div>
            </div>

            {/* Split-Panel Content */}
            <div className="p-4 flex-1 min-h-0 overflow-hidden">
              <div className="flex gap-4 h-full">
                {/* LEFT PANEL */}
                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex gap-2 mb-3 flex-shrink-0">
                    <button
                      onClick={() => setLeftPanel('info')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        leftPanel === 'info' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                      }`}
                    >
                      <Layers className="w-4 h-4 inline mr-2" />
                      Project Info
                      <span className="ml-1 text-xs opacity-60">[1]</span>
                    </button>
                    {currentProject.tasks.length > 0 && (
                      <button
                        onClick={() => setLeftPanel('tasks')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          leftPanel === 'tasks' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                        }`}
                      >
                        <CheckCircle className="w-4 h-4 inline mr-2" />
                        Tasks ({currentProject.tasks.length})
                        <span className="ml-1 text-xs opacity-60">[2]</span>
                      </button>
                    )}
                  </div>

                  <div className="bg-zinc-800/30 rounded-xl p-4 flex-1 overflow-y-auto min-h-0">
                    {leftPanel === 'info' && (
                      <ProjectReviewInfo project={currentProject} />
                    )}

                    {leftPanel === 'tasks' && currentProject.tasks.length > 0 && (
                      <TaskReviewPanel
                        tasks={currentProject.tasks}
                        taskFeedback={taskFeedback}
                        onTaskFeedback={handleTaskFeedback}
                        selectedTaskId={selectedTaskId}
                        onSelectTask={setSelectedTaskId}
                        disabled={submitting}
                      />
                    )}
                  </div>
                </div>

                {/* RIGHT PANEL - Review Form */}
                <div className="w-80 flex-shrink-0 flex flex-col">
                  <div className="flex items-center justify-between mb-3 flex-shrink-0">
                    <h3 className="text-xs font-medium text-zinc-400 uppercase flex items-center gap-2">
                      <Star className="w-3 h-3" />
                      Your Review
                    </h3>
                    <span className="text-xs text-zinc-500">
                      {Object.keys(reviewAnswers).length}/{REVIEW_QUESTIONS.length}
                    </span>
                  </div>

                  <div className="bg-zinc-800/30 rounded-xl p-3 flex-1 overflow-y-auto space-y-2 min-h-0">
                    {REVIEW_QUESTIONS.map((question) => (
                      <ReviewQuestionCard
                        key={question.id}
                        question={question}
                        currentFieldValue={question.fieldRef ? (currentProject as any)[question.fieldRef] : undefined}
                        value={reviewAnswers[question.id]}
                        onChange={(value) => handleAnswerChange(question.id, value)}
                        disabled={submitting}
                        compact={true}
                      />
                    ))}

                    {/* Comments section */}
                    {comments.length > 0 && (
                      <div className="pt-2 border-t border-zinc-700">
                        <p className="text-xs text-zinc-500 mb-1">Your comments ({comments.length})</p>
                        {comments.map((comment) => (
                          <div key={comment.id} className="text-xs text-zinc-300 bg-zinc-800/50 p-1.5 rounded mb-1">
                            {comment.content}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-950/50 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePrevious}
                    disabled={currentIndex === 0 || submitting}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <button
                    onClick={handleSkip}
                    disabled={currentIndex >= pendingProjects.length - 1 || submitting}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-50"
                  >
                    <SkipForward className="w-4 h-4" />
                    Skip
                  </button>
                </div>

                <button
                  onClick={handleCompleteReview}
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {submitting ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Complete Review
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Celebration Modal */}
      <CelebrationModal
        isOpen={showCelebration}
        onClose={() => {
          setShowCelebration(false);
          router.push('/dashboard');
        }}
        stats={{
          reviewedProjects: stats.reviewedProjects,
          feedbackCount,
          commentCount,
        }}
        onContinue={() => setShowCelebration(false)}
      />
    </div>
  );
}
