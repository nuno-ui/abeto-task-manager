'use client';

import { useState, useEffect } from 'react';
import { ReviewerIdentification } from '@/components/reviews/ReviewerIdentification';
import { ReviewProgress } from '@/components/reviews/ReviewProgress';
import { ReviewQuestionCard } from '@/components/reviews/ReviewQuestionCard';
import { ProjectReviewInfo } from '@/components/reviews/ProjectReviewInfo';
import { TaskReviewPanel } from '@/components/reviews/TaskReviewPanel';
import { CelebrationModal } from '@/components/reviews/CelebrationModal';
import { ReviewOnboardingModal } from '@/components/reviews/ReviewOnboardingModal';
import { ReviewerArea, Project, Task, ReviewFeedback } from '@/types/database';
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
  Calendar,
  Target,
  Zap,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Star,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Database,
  Link2,
  ArrowRight,
  FileText,
  Workflow,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Info,
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

// NEW: Review Questions organized by perspective
// These are meaningful questions reviewers should consider and rate
interface ReviewQuestion {
  id: string;
  question: string;
  description: string;
  type: 'rating' | 'boolean' | 'text' | 'select';
  options?: { value: string; label: string; color?: string }[];
  fieldRef?: string; // Reference to project field for context
}

const REVIEW_QUESTIONS: Record<ReviewerArea, ReviewQuestion[]> = {
  management: [
    {
      id: 'strategic_alignment',
      question: 'Strategic Alignment',
      description: 'How well does this project align with Abeto\'s vision and strategic goals?',
      type: 'select',
      options: [
        { value: 'weak', label: 'Weak alignment', color: 'red' },
        { value: 'moderate', label: 'Moderate alignment', color: 'yellow' },
        { value: 'strong', label: 'Strong alignment', color: 'green' },
      ],
      fieldRef: 'strategic_alignment',
    },
    {
      id: 'priority_appropriate',
      question: 'Priority Assessment',
      description: 'Is the current priority level appropriate given other initiatives?',
      type: 'select',
      options: [
        { value: 'too_high', label: 'Should be lower priority', color: 'red' },
        { value: 'correct', label: 'Priority is correct', color: 'green' },
        { value: 'too_low', label: 'Should be higher priority', color: 'blue' },
      ],
      fieldRef: 'priority',
    },
    {
      id: 'resource_justified',
      question: 'Resource Justification',
      description: 'Is the estimated effort/cost justified by the expected business value?',
      type: 'select',
      options: [
        { value: 'poor', label: 'Poor ROI', color: 'red' },
        { value: 'acceptable', label: 'Acceptable ROI', color: 'yellow' },
        { value: 'strong', label: 'Strong ROI', color: 'green' },
      ],
      fieldRef: 'resource_justified',
    },
    {
      id: 'timeline_realistic',
      question: 'Timeline Feasibility',
      description: 'Is the project timeline realistic given current team capacity?',
      type: 'select',
      options: [
        { value: 'too_aggressive', label: 'Timeline too aggressive', color: 'red' },
        { value: 'realistic', label: 'Timeline is realistic', color: 'green' },
        { value: 'conservative', label: 'Could be faster', color: 'blue' },
      ],
      fieldRef: 'timeline_realistic',
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
      id: 'time_horizon',
      question: 'Time Horizon Value',
      description: 'When will this project deliver the most value?',
      type: 'select',
      options: [
        { value: 'short', label: 'Short-term (0-3 months)', color: 'green' },
        { value: 'medium', label: 'Mid-term (3-12 months)', color: 'yellow' },
        { value: 'long', label: 'Long-term (12+ months)', color: 'blue' },
      ],
      fieldRef: 'time_horizon',
    },
    {
      id: 'task_list_quality',
      question: 'Task List Quality',
      description: 'Is the task breakdown well-structured and complete?',
      type: 'select',
      options: [
        { value: 'needs_work', label: 'Needs significant work', color: 'red' },
        { value: 'acceptable', label: 'Acceptable', color: 'yellow' },
        { value: 'well_structured', label: 'Well structured', color: 'green' },
      ],
      fieldRef: 'task_list_quality',
    },
    {
      id: 'dependencies_ok',
      question: 'Dependencies Review',
      description: 'Are all dependencies identified? Any blocking concerns?',
      type: 'boolean',
      fieldRef: 'depends_on',
    },
    {
      id: 'management_comment',
      question: 'Strategic Notes',
      description: 'Any strategic concerns, suggestions, or things to consider?',
      type: 'text',
    },
  ],
  operations_sales: [
    {
      id: 'pain_point_valid',
      question: 'Pain Point Validation',
      description: 'Does this solve a real operational pain point?',
      type: 'select',
      options: [
        { value: 'low', label: 'Not a real pain point', color: 'red' },
        { value: 'medium', label: 'Moderate pain', color: 'yellow' },
        { value: 'high', label: 'Critical pain point', color: 'green' },
      ],
      fieldRef: 'pain_point_level',
    },
    {
      id: 'adoption_risk',
      question: 'Adoption Risk',
      description: 'How likely is the team to actually adopt and use this?',
      type: 'select',
      options: [
        { value: 'high_risk', label: 'High resistance expected', color: 'red' },
        { value: 'medium_risk', label: 'Some change management needed', color: 'yellow' },
        { value: 'low_risk', label: 'Easy adoption expected', color: 'green' },
      ],
      fieldRef: 'adoption_risk',
    },
    {
      id: 'roi_confidence',
      question: 'ROI Confidence',
      description: 'How confident are you in the claimed benefits/time savings?',
      type: 'select',
      options: [
        { value: 'low', label: 'Low confidence', color: 'red' },
        { value: 'medium', label: 'Moderate confidence', color: 'yellow' },
        { value: 'high', label: 'High confidence', color: 'green' },
      ],
      fieldRef: 'roi_confidence',
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
      id: 'time_horizon',
      question: 'Time Horizon Value',
      description: 'When will this project deliver the most value?',
      type: 'select',
      options: [
        { value: 'short', label: 'Short-term (0-3 months)', color: 'green' },
        { value: 'medium', label: 'Mid-term (3-12 months)', color: 'yellow' },
        { value: 'long', label: 'Long-term (12+ months)', color: 'blue' },
      ],
      fieldRef: 'time_horizon',
    },
    {
      id: 'task_list_quality',
      question: 'Task List Quality',
      description: 'Is the task breakdown well-structured and complete?',
      type: 'select',
      options: [
        { value: 'needs_work', label: 'Needs significant work', color: 'red' },
        { value: 'acceptable', label: 'Acceptable', color: 'yellow' },
        { value: 'well_structured', label: 'Well structured', color: 'green' },
      ],
      fieldRef: 'task_list_quality',
    },
    {
      id: 'ops_comment',
      question: 'Operational Notes',
      description: 'Any operational concerns, workflow suggestions, or user insights?',
      type: 'text',
    },
  ],
  product_tech: [
    {
      id: 'complexity_accurate',
      question: 'Complexity Assessment',
      description: 'Is the difficulty rating accurate? Any hidden complexity?',
      type: 'select',
      options: [
        { value: 'underestimated', label: 'More complex than stated', color: 'red' },
        { value: 'accurate', label: 'Complexity is accurate', color: 'green' },
        { value: 'overestimated', label: 'Simpler than stated', color: 'blue' },
      ],
      fieldRef: 'difficulty',
    },
    {
      id: 'hours_realistic',
      question: 'Hours Estimate',
      description: 'Are the estimated hours realistic for this scope?',
      type: 'select',
      options: [
        { value: 'too_low', label: 'Will take longer', color: 'red' },
        { value: 'realistic', label: 'Estimate is good', color: 'green' },
        { value: 'too_high', label: 'Could be faster', color: 'blue' },
      ],
      fieldRef: 'estimated_hours_min',
    },
    {
      id: 'tech_debt_risk',
      question: 'Tech Debt Risk',
      description: 'Will this create technical debt or maintenance burden?',
      type: 'select',
      options: [
        { value: 'high', label: 'High debt risk', color: 'red' },
        { value: 'medium', label: 'Moderate debt', color: 'yellow' },
        { value: 'low', label: 'Low debt risk', color: 'green' },
      ],
      fieldRef: 'tech_debt_risk',
    },
    {
      id: 'data_ready',
      question: 'Data Readiness',
      description: 'Is the required data available and accessible?',
      type: 'select',
      options: [
        { value: 'not_ready', label: 'Data not available', color: 'red' },
        { value: 'partial', label: 'Partial data available', color: 'yellow' },
        { value: 'ready', label: 'Data is ready', color: 'green' },
      ],
      fieldRef: 'data_readiness',
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
      id: 'time_horizon',
      question: 'Time Horizon Value',
      description: 'When will this project deliver the most value?',
      type: 'select',
      options: [
        { value: 'short', label: 'Short-term (0-3 months)', color: 'green' },
        { value: 'medium', label: 'Mid-term (3-12 months)', color: 'yellow' },
        { value: 'long', label: 'Long-term (12+ months)', color: 'blue' },
      ],
      fieldRef: 'time_horizon',
    },
    {
      id: 'task_list_quality',
      question: 'Task List Quality',
      description: 'Is the task breakdown well-structured and complete?',
      type: 'select',
      options: [
        { value: 'needs_work', label: 'Needs significant work', color: 'red' },
        { value: 'acceptable', label: 'Acceptable', color: 'yellow' },
        { value: 'well_structured', label: 'Well structured', color: 'green' },
      ],
      fieldRef: 'task_list_quality',
    },
    {
      id: 'integration_concerns',
      question: 'Integration Complexity',
      description: 'Any concerns about API integrations or system compatibility?',
      type: 'boolean',
      fieldRef: 'integrations_needed',
    },
    {
      id: 'tech_comment',
      question: 'Technical Notes',
      description: 'Any technical concerns, architecture suggestions, or blockers?',
      type: 'text',
    },
  ],
};

// Task-level review questions (same for all areas)
const TASK_REVIEW_QUESTIONS: ReviewQuestion[] = [
  {
    id: 'task_hours_check',
    question: 'Hours Estimate',
    description: 'Are the estimated hours for this task realistic?',
    type: 'select',
    options: [
      { value: 'too_low', label: 'Underestimated', color: 'red' },
      { value: 'accurate', label: 'Accurate', color: 'green' },
      { value: 'too_high', label: 'Overestimated', color: 'blue' },
    ],
  },
  {
    id: 'task_blocker',
    question: 'Blockers',
    description: 'Are there any blockers or dependencies for this task?',
    type: 'boolean',
  },
  {
    id: 'task_comment',
    question: 'Task Notes',
    description: 'Any specific feedback on this task?',
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
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [pendingArea, setPendingArea] = useState<ReviewerArea | null>(null);
  const [leftPanel, setLeftPanel] = useState<'info' | 'tasks'>('info');
  const [reviewAnswers, setReviewAnswers] = useState<Record<string, string | number>>({});
  const [taskFeedback, setTaskFeedback] = useState<Record<string, { taskId: string; hoursCheck?: 'too_low' | 'accurate' | 'too_high'; hasBlockers?: boolean; comment?: string }>>({});
  const [streak, setStreak] = useState(0);
  const [showKeyboardHints, setShowKeyboardHints] = useState(true);

  // Get reviewer ID from auth
  const reviewerId = user?.id || null;

  // Load streak from localStorage
  useEffect(() => {
    const savedStreak = localStorage.getItem('reviewStreak');
    const lastReviewDate = localStorage.getItem('lastReviewDate');
    const today = new Date().toDateString();

    if (savedStreak && lastReviewDate === today) {
      setStreak(parseInt(savedStreak, 10));
    } else if (lastReviewDate && lastReviewDate !== today) {
      // Reset streak if not reviewed today
      localStorage.setItem('reviewStreak', '0');
      setStreak(0);
    }
  }, []);

  // Keyboard shortcuts - defined later after handlers are created

  // Load saved area from localStorage ONLY - don't auto-force preferredArea
  // User should always be able to choose their perspective freely
  useEffect(() => {
    if (authLoading) return;

    // Only load from localStorage - don't auto-set from preferredArea
    // This allows user to freely switch perspectives without being forced
    const savedArea = localStorage.getItem('reviewerArea') as ReviewerArea | null;
    if (savedArea) {
      setReviewerArea(savedArea);
    }
    // If no saved area, user will see the perspective selection screen
  }, [authLoading]);

  // Fetch projects when area is selected and user is authenticated
  useEffect(() => {
    if (reviewerArea && reviewerId) {
      fetchProjects();
    }
  }, [reviewerArea, reviewerId]);

  const fetchProjects = async () => {
    if (!reviewerArea || !reviewerId) return;
    setLoading(true);
    try {
      const response = await fetch(
        `/api/reviews?reviewer_area=${reviewerArea}&reviewer_id=${reviewerId}`
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
    // Check if user has seen onboarding for this area
    const onboardingKey = `reviewOnboarding_${area}`;
    const hasSeenOnboarding = localStorage.getItem(onboardingKey);

    if (!hasSeenOnboarding) {
      // Show onboarding modal
      setPendingArea(area);
      setShowOnboarding(true);
    } else {
      // Skip onboarding, go directly to review
      setReviewerArea(area);
      localStorage.setItem('reviewerArea', area);
    }
  };

  const handleStartReviewing = () => {
    if (pendingArea) {
      // Mark onboarding as seen
      localStorage.setItem(`reviewOnboarding_${pendingArea}`, 'true');
      setReviewerArea(pendingArea);
      localStorage.setItem('reviewerArea', pendingArea);
      setShowOnboarding(false);
      setPendingArea(null);
    }
  };

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
    setPendingArea(null);
  };

  const startReviewSession = async (projectId: string) => {
    if (!reviewerArea || !reviewerId) return;
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          reviewer_id: reviewerId,
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
        // Update streak
        const newStreak = streak + 1;
        setStreak(newStreak);
        localStorage.setItem('reviewStreak', newStreak.toString());
        localStorage.setItem('lastReviewDate', new Date().toDateString());

        // Move to next project or show celebration
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
      setReviewAnswers({});
      setTaskFeedback({});
      setLeftPanel('info');
    }
  };

  // Handle review question answer change
  const handleAnswerChange = async (questionId: string, value: string | number) => {
    setReviewAnswers(prev => ({ ...prev, [questionId]: value }));

    // Save to backend if session exists
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
            is_area_specific: true,
          }),
        });
        setFeedbackCount(prev => prev + 1);
      } catch (error) {
        console.error('Error saving answer:', error);
      }
    }
  };

  // Handle task feedback
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

  // Keyboard shortcuts for faster navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      // Don't trigger if no project loaded
      if (!pendingProjects[currentIndex]) return;

      switch (e.key) {
        case '1':
          setLeftPanel('info');
          break;
        case '2':
          // Tasks tab
          if (pendingProjects[currentIndex]?.tasks?.length) setLeftPanel('tasks');
          break;
        case 'ArrowLeft':
          if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            setSessionId(null);
            setFeedback({});
            setComments([]);
            setReviewAnswers({});
            setTaskFeedback({});
            setLeftPanel('info');
          }
          break;
        case 'ArrowRight':
          if (currentIndex < pendingProjects.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSessionId(null);
            setFeedback({});
            setComments([]);
            setReviewAnswers({});
            setTaskFeedback({});
            setLeftPanel('info');
          }
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
    if (reviewerArea && pendingProjects.length > 0 && !sessionId) {
      const currentProject = pendingProjects[currentIndex];
      if (currentProject && !currentProject.is_reviewed_by_me) {
        startReviewSession(currentProject.id);
      }
    }
  }, [currentIndex, pendingProjects, reviewerArea]);

  const currentProject = pendingProjects[currentIndex];

  // Show auth loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    );
  }

  // Redirect if not authenticated
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

  // Show identification screen if no area selected
  if (!reviewerArea) {
    return (
      <div className="min-h-screen p-6 max-w-4xl mx-auto">
        <ReviewerIdentification
          currentArea={reviewerArea}
          onSelectArea={handleSelectArea}
          preferredArea={preferredArea}
          userName={user?.full_name || user?.email}
        />
      </div>
    );
  }

  // Loading state
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
            You&apos;ve reviewed all projects from the {reviewerArea.replace('_', ' / ')} perspective.
          </p>
          <button
            onClick={() => {
              setReviewerArea(null);
              localStorage.removeItem('reviewerArea');
            }}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-medium rounded-lg transition-colors"
          >
            Review from Another Perspective
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="p-6 space-y-6">
        {/* Progress with gamification */}
        <ReviewProgress
          totalProjects={stats.totalProjects}
          reviewedProjects={stats.reviewedProjects}
          feedbackCount={feedbackCount}
          commentCount={commentCount}
          streak={streak}
          currentProjectName={currentProject?.title}
        />

        {/* Keyboard hints (dismissible) */}
        {showKeyboardHints && currentProject && (
          <div className="flex items-center justify-between px-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-xs text-zinc-400">
            <div className="flex items-center gap-4">
              <span><kbd className="px-1.5 py-0.5 bg-zinc-700 rounded text-zinc-300">1</kbd> <kbd className="px-1.5 py-0.5 bg-zinc-700 rounded text-zinc-300">2</kbd> Switch Info/Tasks</span>
              <span><kbd className="px-1.5 py-0.5 bg-zinc-700 rounded text-zinc-300">←</kbd> <kbd className="px-1.5 py-0.5 bg-zinc-700 rounded text-zinc-300">→</kbd> Navigate projects</span>
              <span><kbd className="px-1.5 py-0.5 bg-zinc-700 rounded text-zinc-300">Ctrl+Enter</kbd> Complete review</span>
            </div>
            <button onClick={() => setShowKeyboardHints(false)} className="text-zinc-500 hover:text-zinc-300">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Area indicator and switch */}
        <div className="flex items-center justify-between bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-400">Reviewing as:</span>
            <span className="px-3 py-1.5 bg-violet-500/20 text-violet-300 border border-violet-500/30 rounded-full text-sm font-medium capitalize">
              {reviewerArea.replace('_', ' / ')}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowOnboarding(true)}
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1"
              title="Re-read intro & guidelines"
            >
              <Info className="w-4 h-4" />
              <span className="hidden sm:inline">Help</span>
            </button>
            <button
              onClick={() => {
                setReviewerArea(null);
                localStorage.removeItem('reviewerArea');
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg text-sm font-medium transition-colors"
            >
              <Layers className="w-4 h-4" />
              Switch Perspective
            </button>
          </div>
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
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityColors[currentProject.priority]}`}>
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
              <div className="flex items-center gap-2 flex-wrap">
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

            {/* Review Flow Guide Banner */}
            {!sessionId && (
              <div className="mx-6 mt-6 mb-0 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <h4 className="text-sm font-medium text-blue-400 mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Review Flow Guide
                </h4>
                <ol className="text-sm text-zinc-400 space-y-1.5 list-decimal list-inside">
                  <li>
                    <strong className="text-zinc-300">Read Project Info</strong> - Understand the project context, goals, and scope
                  </li>
                  <li>
                    <strong className="text-zinc-300">Review Tasks</strong> - Examine tasks, especially those related to your area ({reviewerArea.replace('_', '/')})
                  </li>
                  <li>
                    <strong className="text-zinc-300">Complete Your Review</strong> - Answer the review questions and submit your assessment
                  </li>
                </ol>
              </div>
            )}

            {/* Split-Panel Content - Info/Tasks on Left, Review on Right */}
            <div className="p-6">
              <div className="flex gap-6">
                {/* LEFT PANEL - Project Info / Tasks (switchable) */}
                <div className="flex-1 min-w-0">
                  {/* Left Panel Tab Navigation */}
                  <div className="flex gap-2 mb-4">
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

                  {/* Left Panel Content */}
                  <div className="bg-zinc-800/30 rounded-xl p-4 max-h-[600px] overflow-y-auto">
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

                {/* RIGHT PANEL - Review Form (always visible) */}
                <div className="w-96 flex-shrink-0">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-zinc-400 uppercase flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Your Review
                    </h3>
                    <span className="text-xs text-zinc-500">
                      {Object.keys(reviewAnswers).length} of {REVIEW_QUESTIONS[reviewerArea].length} answered
                    </span>
                  </div>

                  <div className="bg-zinc-800/30 rounded-xl p-4 max-h-[600px] overflow-y-auto space-y-3">
                    {/* Review Questions */}
                    {REVIEW_QUESTIONS[reviewerArea].map((question) => (
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

                    {/* General Comment */}
                    <div className="bg-zinc-900/50 rounded-lg p-3 space-y-2 mt-4 border border-zinc-700/50">
                      <h4 className="text-xs font-medium text-white flex items-center gap-2">
                        <MessageSquare className="w-3 h-3" />
                        Additional Comments
                      </h4>
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Any other thoughts..."
                        className="w-full px-2 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-white text-xs focus:outline-none focus:border-blue-500 resize-none"
                        rows={2}
                      />
                      {newComment.trim() && (
                        <button
                          onClick={handleAddComment}
                          disabled={submitting}
                          className="flex items-center gap-1 px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white rounded text-xs transition-colors disabled:opacity-50"
                        >
                          <Send className="w-3 h-3" />
                          Save
                        </button>
                      )}

                      {/* Show added comments */}
                      {comments.length > 0 && (
                        <div className="space-y-1 pt-2 border-t border-zinc-700">
                          <p className="text-xs text-zinc-500">Your comments ({comments.length})</p>
                          {comments.map((comment) => (
                            <div key={comment.id} className="text-xs text-zinc-300 bg-zinc-800/50 p-1.5 rounded">
                              {comment.task_id && (
                                <span className="text-xs text-blue-400 block mb-0.5">On task</span>
                              )}
                              {comment.content}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
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

      {/* Onboarding Modal */}
      {showOnboarding && pendingArea && (
        <ReviewOnboardingModal
          area={pendingArea}
          onClose={handleCloseOnboarding}
          onStart={handleStartReviewing}
        />
      )}
    </div>
  );
}
