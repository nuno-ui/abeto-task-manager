'use client';

import { useState } from 'react';
import { ReviewerArea } from '@/types/database';
import {
  X,
  Briefcase,
  Users,
  Code2,
  Target,
  CheckCircle,
  MessageSquare,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';

interface ReviewOnboardingModalProps {
  area: ReviewerArea;
  onClose: () => void;
  onStart: () => void;
}

const areaContent: Record<ReviewerArea, {
  icon: typeof Briefcase;
  color: string;
  title: string;
  description: string;
  focusAreas: string[];
  questions: string[];
  tips: string[];
}> = {
  management: {
    icon: Briefcase,
    color: '#6366f1',
    title: 'Management Review',
    description: 'You\'ll be evaluating projects from a strategic leadership perspective, focusing on priorities, team allocation, and timeline alignment.',
    focusAreas: [
      'Priority & strategic alignment',
      'Team assignments and ownership',
      'Target dates & milestones',
      'Resource allocation',
    ],
    questions: [
      'Is this project aligned with our company goals?',
      'Is the priority level appropriate given other initiatives?',
      'Are the timelines realistic and well-planned?',
      'Is the right team assigned to this project?',
    ],
    tips: [
      'Consider the project\'s impact on overall company strategy',
      'Think about resource constraints and team capacity',
      'Flag any misalignments with company objectives',
    ],
  },
  operations_sales: {
    icon: Users,
    color: '#10b981',
    title: 'Operations / Sales Review',
    description: 'You\'ll be evaluating projects from an operational efficiency perspective, focusing on process changes, customer impact, and team empowerment.',
    focusAreas: [
      'Operational processes affected',
      'Current & potential automation levels',
      'Human role changes (before/after)',
      'Customer benefits & impact',
    ],
    questions: [
      'How will this change our current workflows?',
      'What\'s the potential for automation here?',
      'How will team roles evolve after implementation?',
      'What prerequisites or integrations are needed?',
    ],
    tips: [
      'Think about the day-to-day impact on operations',
      'Consider training needs for the team',
      'Identify potential bottlenecks or dependencies',
    ],
  },
  product_tech: {
    icon: Code2,
    color: '#f59e0b',
    title: 'Product / Tech Review',
    description: 'You\'ll be evaluating projects from a technical feasibility perspective, focusing on complexity, architecture, and implementation requirements.',
    focusAreas: [
      'Technical difficulty assessment',
      'Time & resource estimates',
      'API & data requirements',
      'Dependencies & architecture',
    ],
    questions: [
      'Is the difficulty level accurately assessed?',
      'Are the time estimates realistic?',
      'What AI potential exists for each task?',
      'What technical dependencies should we be aware of?',
    ],
    tips: [
      'Consider technical debt and scalability',
      'Identify opportunities for AI assistance',
      'Flag any missing technical requirements',
    ],
  },
};

export function ReviewOnboardingModal({ area, onClose, onStart }: ReviewOnboardingModalProps) {
  const [step, setStep] = useState(0);
  const content = areaContent[area];
  const Icon = content.icon;

  const steps = [
    { title: 'Welcome', content: 'intro' },
    { title: 'Your Focus', content: 'focus' },
    { title: 'Key Questions', content: 'questions' },
    { title: 'Tips', content: 'tips' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg mx-4 bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ backgroundColor: content.color + '15' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: content.color + '30' }}
            >
              <Icon className="w-5 h-5" style={{ color: content.color }} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">{content.title}</h2>
              <p className="text-xs text-zinc-400">Step {step + 1} of {steps.length}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress */}
        <div className="px-6 py-2 bg-zinc-800/50">
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i <= step ? 'bg-blue-500' : 'bg-zinc-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 0 && (
            <div className="space-y-4">
              <p className="text-zinc-300">{content.description}</p>
              <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                <p className="text-sm text-zinc-400">
                  During your review, you&apos;ll be able to:
                </p>
                <ul className="mt-3 space-y-2">
                  <li className="flex items-center gap-2 text-sm text-zinc-300">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    View complete project details
                  </li>
                  <li className="flex items-center gap-2 text-sm text-zinc-300">
                    <Target className="w-4 h-4 text-blue-500" />
                    Propose changes to key fields
                  </li>
                  <li className="flex items-center gap-2 text-sm text-zinc-300">
                    <MessageSquare className="w-4 h-4 text-purple-500" />
                    Add comments on projects & tasks
                  </li>
                </ul>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-zinc-400">As a {content.title.toLowerCase()} reviewer, you&apos;ll focus on:</p>
              <div className="space-y-2">
                {content.focusAreas.map((focus, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700"
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: content.color }}
                    />
                    <span className="text-zinc-300">{focus}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-zinc-400">Consider these questions during your review:</p>
              <div className="space-y-3">
                {content.questions.map((question, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700"
                  >
                    <span className="text-lg" style={{ color: content.color }}>?</span>
                    <span className="text-zinc-300 text-sm">{question}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-zinc-400">Pro tips for effective reviewing:</p>
              <div className="space-y-3">
                {content.tips.map((tip, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700"
                  >
                    <Lightbulb className="w-4 h-4 text-amber-400 mt-0.5" />
                    <span className="text-zinc-300 text-sm">{tip}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <p className="text-sm text-blue-300">
                  Your feedback will be saved and reviewed by the admin. They&apos;ll consider all perspectives before making changes.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-zinc-800/30 flex items-center justify-between">
          {step > 0 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
            >
              Back
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
            >
              Skip
            </button>
          )}

          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onStart}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Start Reviewing
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
