'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { ReviewerIdentification } from '@/components/reviews/ReviewerIdentification';
import { ReviewProgress } from '@/components/reviews/ReviewProgress';
import { ReviewFeedbackForm } from '@/components/reviews/ReviewFeedbackForm';
import { CelebrationModal } from '@/components/reviews/CelebrationModal';
import { ReviewerArea, Project, Task, ReviewFeedback } from '@/types/database';
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
  Calendar,
  Target,
  Zap,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
} from 'lucide-react';

interface EnrichedProject extends Project {
  tasks: Task[];
  review_status: {
    management_reviewed: boolean;
    operations_sales_reviewed: boolean;
    product_tech_reviewed: boolean;
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

const REVIEWER_ID = 'demo-reviewer-001'; // In production, get from auth

// Field configurations by area
const AREA_FIELDS: Record<ReviewerArea, { name: string; label: string; type: 'select' | 'text' | 'textarea'; options?: { value: string; label: string }[] }[]> = {
  management: [
    {
      name: 'priority',
      label: 'Priority',
      type: 'select',
      options: [
        { value: 'critical', label: 'Critical' },
        { value: 'high', label: 'High' },
        { value: 'medium', label: 'Medium' },
        { value: 'low', label: 'Low' },
      ],
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'idea', label: 'Idea' },
        { value: 'planning', label: 'Planning' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'on_hold', label: 'On Hold' },
        { value: 'completed', label: 'Completed' },
      ],
    },
    { name: 'target_date', label: 'Target Date', type: 'text' },
    { name: 'next_milestone', label: 'Next Milestone', type: 'textarea' },
  ],
  operations_sales: [
    { name: 'ops_process', label: 'Operational Process', type: 'textarea' },
    { name: 'current_loa', label: 'Current Level of Automation', type: 'text' },
    { name: 'potential_loa', label: 'Potential Level of Automation', type: 'text' },
    { name: 'human_role_before', label: 'Human Role Before', type: 'textarea' },
    { name: 'human_role_after', label: 'Human Role After', type: 'textarea' },
  ],
  product_tech: [
    {
      name: 'difficulty',
      label: 'Difficulty',
      type: 'select',
      options: [
        { value: 'easy', label: 'Easy' },
        { value: 'medium', label: 'Medium' },
        { value: 'hard', label: 'Hard' },
      ],
    },
    { name: 'estimated_hours_min', label: 'Estimated Hours (Min)', type: 'text' },
    { name: 'estimated_hours_max', label: 'Estimated Hours (Max)', type: 'text' },
    { name: 'data_status', label: 'Data Status', type: 'text' },
  ],
};

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
  const [reviewerArea, setReviewerArea] = useState<ReviewerArea | null>(null);
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

  // Load saved area from localStorage
  useEffect(() => {
    const savedArea = localStorage.getItem('reviewerArea') as ReviewerArea | null;
    if (savedArea) {
      setReviewerArea(savedArea);
    }
  }, []);

  // Fetch projects when area is selected
  useEffect(() => {
    if (reviewerArea) {
      fetchProjects();
    }
  }, [reviewerArea]);

  const fetchProjects = async () => {
    if (!reviewerArea) return;
    setLoading(true);
    try {
      const response = await fetch(
        `/api/reviews?reviewer_area=${reviewerArea}&reviewer_id=${REVIEWER_ID}`
      );
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

  const handleSelectArea = async (area: ReviewerArea) => {
    setReviewerArea(area);
    localStorage.setItem('reviewerArea', area);
  };

  const startReviewSession = async (projectId: string) => {
    if (!reviewerArea) return;
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          reviewer_id: REVIEWER_ID,
          reviewer_area: reviewerArea,
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
          is_area_specific: true,
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
        // Move to next project or show celebration
        if (currentIndex < pendingProjects.length - 1) {
          setCurrentIndex(prev => prev + 1);
          setSessionId(null);
          setFeedback({});
          setComments([]);
          setStats(prev => ({
            ...prev,
            reviewedProjects: prev.reviewedProjects + 1,
            pendingProjects: prev.pendingProjects - 1,
            progress: Math.round(((prev.reviewedProjects + 1) / prev.totalProjects) * 100),
          }));
        } else {
          // All done!
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
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setSessionId(null);
      setFeedback({});
      setComments([]);
    }
  };

  // Start session when viewing a new project
  useEffect(() => {
    if (reviewerArea && pendingProjects.length > 0 && !sessionId) {
      const currentProject = pendingProjects[currentIndex];
      if (currentProject && !currentProject.is_reviewed_by_me) {
        startReviewSession(currentProject.id);
      }
    }
  }, [currentIndex, pendingProjects, reviewerArea]);

  const currentProject = pendingProjects[currentIndex];

  // Show identification screen if no area selected
  if (!reviewerArea) {
    return (
      <div className="min-h-screen">
        <Header title="Project Reviews" />
        <div className="p-6 max-w-4xl mx-auto">
          <ReviewerIdentification
            currentArea={reviewerArea}
            onSelectArea={handleSelectArea}
          />
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen">
        <Header title="Project Reviews" />
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-40 bg-zinc-900 rounded-xl" />
            <div className="h-96 bg-zinc-900 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // All done state
  if (pendingProjects.length === 0) {
    return (
      <div className="min-h-screen">
        <Header title="Project Reviews" />
        <div className="p-6 max-w-4xl mx-auto">
          <ReviewProgress
            totalProjects={stats.totalProjects}
            reviewedProjects={stats.reviewedProjects}
            feedbackCount={feedbackCount}
            commentCount={commentCount}
          />
          <div className="mt-8 text-center py-16 bg-zinc-900 rounded-xl border border-zinc-800">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">All Caught Up!</h2>
            <p className="text-zinc-400 mb-6">
              You&apos;ve reviewed all projects from the {reviewerArea.replace('_', ' / ')} perspective.
            </p>
            <button
              onClick={() => {
                setReviewerArea(null);
                localStorage.removeItem('reviewerArea');
              }}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Review from Another Perspective
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header title="Project Reviews" />

      <div className="p-6 space-y-6">
        {/* Progress */}
        <ReviewProgress
          totalProjects={stats.totalProjects}
          reviewedProjects={stats.reviewedProjects}
          feedbackCount={feedbackCount}
          commentCount={commentCount}
        />

        {/* Area indicator and switch */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-400">Reviewing as:</span>
            <span className="px-3 py-1 bg-zinc-800 text-white rounded-full text-sm font-medium capitalize">
              {reviewerArea.replace('_', ' / ')}
            </span>
          </div>
          <button
            onClick={() => {
              setReviewerArea(null);
              localStorage.removeItem('reviewerArea');
            }}
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Switch perspective
          </button>
        </div>

        {/* Current Project Review Card */}
        {currentProject && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            {/* Project Header */}
            <div className="p-6 border-b border-zinc-800">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`w-3 h-3 rounded-full ${statusColors[currentProject.status]}`} />
                    <h2 className="text-xl font-bold text-white">{currentProject.title}</h2>
                    <span className={`text-sm ${priorityColors[currentProject.priority]}`}>
                      {currentProject.priority}
                    </span>
                  </div>
                  <p className="text-zinc-400">{currentProject.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-zinc-500">Project {currentIndex + 1} of {pendingProjects.length}</p>
                </div>
              </div>

              {/* Review status badges */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">Review Status:</span>
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs ${
                  currentProject.review_status.management_reviewed ? 'bg-green-500/20 text-green-400' : 'bg-zinc-800 text-zinc-500'
                }`}>
                  {currentProject.review_status.management_reviewed ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  Management
                </div>
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs ${
                  currentProject.review_status.operations_sales_reviewed ? 'bg-green-500/20 text-green-400' : 'bg-zinc-800 text-zinc-500'
                }`}>
                  {currentProject.review_status.operations_sales_reviewed ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  Ops/Sales
                </div>
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs ${
                  currentProject.review_status.product_tech_reviewed ? 'bg-green-500/20 text-green-400' : 'bg-zinc-800 text-zinc-500'
                }`}>
                  {currentProject.review_status.product_tech_reviewed ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  Product/Tech
                </div>
              </div>
            </div>

            {/* Project Details */}
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left column - Key Info */}
              <div className="space-y-6">
                {/* Quick stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                    <p className="text-lg font-bold text-white">{currentProject.tasks.length}</p>
                    <p className="text-xs text-zinc-400">Tasks</p>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                    <p className="text-lg font-bold text-white">{currentProject.progress_percentage}%</p>
                    <p className="text-xs text-zinc-400">Progress</p>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                    <p className="text-lg font-bold text-white">
                      {currentProject.estimated_hours_min || '?'}-{currentProject.estimated_hours_max || '?'}
                    </p>
                    <p className="text-xs text-zinc-400">Hours Est.</p>
                  </div>
                </div>

                {/* Why it matters */}
                {currentProject.why_it_matters && (
                  <div className="bg-zinc-800/30 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-zinc-400 mb-2">Why It Matters</h4>
                    <p className="text-sm text-white">{currentProject.why_it_matters}</p>
                  </div>
                )}

                {/* Benefits */}
                {currentProject.benefits && currentProject.benefits.length > 0 && (
                  <div className="bg-zinc-800/30 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-zinc-400 mb-2">Benefits</h4>
                    <ul className="space-y-1">
                      {currentProject.benefits.map((benefit, idx) => (
                        <li key={idx} className="text-sm text-white flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tasks list */}
                <div className="bg-zinc-800/30 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-zinc-400 mb-3">Tasks ({currentProject.tasks.length})</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {currentProject.tasks.map((task) => (
                      <div
                        key={task.id}
                        className={`flex items-center gap-3 p-2 rounded-lg transition-colors cursor-pointer ${
                          selectedTaskId === task.id ? 'bg-blue-500/20 border border-blue-500/50' : 'bg-zinc-800/50 hover:bg-zinc-800'
                        }`}
                        onClick={() => setSelectedTaskId(selectedTaskId === task.id ? null : task.id)}
                      >
                        <div className={`w-2 h-2 rounded-full ${statusColors[task.status] || 'bg-zinc-500'}`} />
                        <span className="text-sm text-white flex-1 truncate">{task.title}</span>
                        <span className={`text-xs ${
                          task.ai_potential === 'high' ? 'text-green-400' :
                          task.ai_potential === 'medium' ? 'text-yellow-400' :
                          task.ai_potential === 'low' ? 'text-red-400' : 'text-zinc-500'
                        }`}>
                          AI: {task.ai_potential || 'none'}
                        </span>
                        <MessageSquare className="w-4 h-4 text-zinc-500" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right column - Review Fields */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-zinc-400 uppercase">
                  Your Review ({reviewerArea.replace('_', ' / ')})
                </h3>

                {/* Area-specific fields */}
                {AREA_FIELDS[reviewerArea].map((field) => (
                  <ReviewFeedbackForm
                    key={field.name}
                    fieldName={field.name}
                    fieldLabel={field.label}
                    fieldType={field.type}
                    currentValue={(currentProject as any)[field.name]}
                    options={field.options}
                    onSubmit={(value, comment) => handleSubmitFeedback(field.name, value, comment)}
                    existingProposedValue={feedback[field.name]?.proposed_value}
                    existingComment={feedback[field.name]?.comment}
                    disabled={submitting}
                  />
                ))}

                {/* Add comment section */}
                <div className="bg-zinc-800/30 rounded-lg p-4 space-y-3">
                  <h4 className="text-sm font-medium text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Add Comment
                    {selectedTaskId && (
                      <span className="text-xs text-blue-400 bg-blue-500/20 px-2 py-0.5 rounded">
                        on task
                        <button onClick={() => setSelectedTaskId(null)} className="ml-1 hover:text-white">
                          <X className="w-3 h-3 inline" />
                        </button>
                      </span>
                    )}
                  </h4>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={selectedTaskId ? 'Comment on selected task...' : 'Add a general comment about this project...'}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
                    rows={3}
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || submitting}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    Add Comment
                  </button>

                  {/* Show added comments */}
                  {comments.length > 0 && (
                    <div className="space-y-2 pt-3 border-t border-zinc-700">
                      <p className="text-xs text-zinc-500">Your comments ({comments.length})</p>
                      {comments.map((comment) => (
                        <div key={comment.id} className="text-sm text-zinc-300 bg-zinc-800/50 p-2 rounded">
                          {comment.task_id && (
                            <span className="text-xs text-blue-400 block mb-1">On task</span>
                          )}
                          {comment.content}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="p-6 border-t border-zinc-800 bg-zinc-950/50">
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
        onSwitchArea={() => {
          setShowCelebration(false);
          setReviewerArea(null);
          localStorage.removeItem('reviewerArea');
        }}
      />
    </div>
  );
}
