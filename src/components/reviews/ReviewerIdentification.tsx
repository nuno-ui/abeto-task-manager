'use client';

import { ReviewerArea } from '@/types/database';
import {
  Briefcase,
  Users,
  Code2,
  CheckCircle,
  Star,
  Target,
  Eye,
  MessageSquare,
  BarChart3,
  ArrowRight,
  Lightbulb,
  Layers,
  Zap,
  Shield,
  TrendingUp,
} from 'lucide-react';

interface ReviewerIdentificationProps {
  currentArea?: ReviewerArea | null;
  onSelectArea: (area: ReviewerArea) => void;
  disabled?: boolean;
  preferredArea?: ReviewerArea | null;
  userName?: string | null;
}

const areas: {
  id: ReviewerArea;
  name: string;
  description: string;
  icon: typeof Briefcase;
  color: string;
  focuses: string[];
  keyQuestions: string[];
}[] = [
  {
    id: 'management',
    name: 'Management',
    description: 'Strategic leadership, resources & fundraising alignment',
    icon: Briefcase,
    color: '#6366f1',
    focuses: [
      'Strategic alignment with company vision',
      'Resource allocation & ROI justification',
      'Timeline feasibility vs. team capacity',
      'Fundraising & investor priorities',
    ],
    keyQuestions: [
      'Does this support our fundraising narrative?',
      'Is the priority aligned with strategic goals?',
      'Are resources justified by business value?',
    ],
  },
  {
    id: 'operations_sales',
    name: 'Operations / Sales',
    description: 'Real-world pain points & adoption feasibility',
    icon: Users,
    color: '#10b981',
    focuses: [
      'Validates actual operational pain points',
      'Adoption risk & change management needs',
      'Training requirements & user readiness',
      'Impact on daily workflows & efficiency',
    ],
    keyQuestions: [
      'Is this solving a real pain point?',
      'Will the team actually adopt this?',
      'What training will be needed?',
    ],
  },
  {
    id: 'product_tech',
    name: 'Product / Tech',
    description: 'Technical feasibility, tools & future development path',
    icon: Code2,
    color: '#f59e0b',
    focuses: [
      'Technical complexity & hidden risks',
      'Tools & integrations available/needed',
      'Data readiness & API dependencies',
      'Path for future development & scalability',
    ],
    keyQuestions: [
      'Is the complexity estimate accurate?',
      'Do we have the right tools for this?',
      'Will this create tech debt?',
    ],
  },
];

export function ReviewerIdentification({
  currentArea,
  onSelectArea,
  disabled,
  preferredArea,
  userName,
}: ReviewerIdentificationProps) {
  return (
    <div className="space-y-8">
      {/* Hero Welcome Section */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/30 rounded-full mb-4">
          <Eye className="w-4 h-4 text-violet-400" />
          <span className="text-sm text-violet-300 font-medium">Project Review System</span>
        </div>

        <h1 className="text-3xl font-bold text-white mb-3">
          {userName ? (
            <>Welcome, <span className="text-violet-400">{userName}</span>!</>
          ) : (
            <>Welcome to Project Reviews</>
          )}
        </h1>

        <p className="text-lg text-zinc-400">
          Help shape Abeto's roadmap by reviewing projects from your unique perspective.
        </p>
      </div>

      {/* Why Multi-Perspective Reviews Matter */}
      <div className="bg-gradient-to-br from-blue-900/20 to-zinc-900 border border-blue-800/30 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-500/20 rounded-xl">
            <Target className="w-6 h-6 text-blue-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-white mb-2">Why Multiple Perspectives?</h2>
            <p className="text-zinc-400 mb-4">
              Projects that span multiple areas need <span className="text-blue-300 font-medium">at least 3 different perspectives</span> to ensure they align with:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-center gap-2 p-3 bg-zinc-800/50 rounded-lg">
                <Shield className="w-5 h-5 text-indigo-400" />
                <span className="text-sm text-zinc-300">Overall Strategy</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-zinc-800/50 rounded-lg">
                <Users className="w-5 h-5 text-green-400" />
                <span className="text-sm text-zinc-300">Operations Needs</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-zinc-800/50 rounded-lg">
                <Code2 className="w-5 h-5 text-amber-400" />
                <span className="text-sm text-zinc-300">Product Roadmap</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
          How the Review Process Works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 font-bold text-sm">1</div>
              <h3 className="font-medium text-white">Read Project Info</h3>
            </div>
            <p className="text-sm text-zinc-500 pl-11">
              Understand goals, scope, deliverables, and current estimates
            </p>
            <div className="hidden md:block absolute top-4 -right-2 text-zinc-700">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 font-bold text-sm">2</div>
              <h3 className="font-medium text-white">Examine Tasks</h3>
            </div>
            <p className="text-sm text-zinc-500 pl-11">
              Review detailed tasks, especially those in your area of expertise
            </p>
            <div className="hidden md:block absolute top-4 -right-2 text-zinc-700">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 font-bold text-sm">3</div>
              <h3 className="font-medium text-white">Answer Questions</h3>
            </div>
            <p className="text-sm text-zinc-500 pl-11">
              Rate key aspects and provide comments from your perspective
            </p>
            <div className="hidden md:block absolute top-4 -right-2 text-zinc-700">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold text-sm">4</div>
              <h3 className="font-medium text-white">Submit & Next</h3>
            </div>
            <p className="text-sm text-zinc-500 pl-11">
              Complete review and move to the next project
            </p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
          <p className="text-sm text-zinc-400">
            <span className="text-yellow-400">💡 Tip:</span> Each perspective should focus on their area of expertise.
            Management considers <span className="text-indigo-400">strategy & resources</span>,
            Operations evaluates <span className="text-green-400">real-world impact & adoption</span>,
            Product/Tech assesses <span className="text-amber-400">feasibility & technical debt</span>.
          </p>
        </div>
      </div>

      {/* The Goal */}
      <div className="bg-gradient-to-r from-green-900/20 to-zinc-900 border border-green-800/30 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-green-500/20 rounded-xl">
            <TrendingUp className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white mb-2">The Goal: Smart Prioritization</h2>
            <p className="text-zinc-400">
              After all perspectives are collected, we'll have <span className="text-green-300 font-medium">clear alignment data</span> to prioritize projects that best answer
              <span className="text-white"> all areas' critical needs</span>, in the right order. No more guessing — data-driven decisions.
            </p>
          </div>
        </div>
      </div>

      {/* Choose Your Perspective */}
      <div>
        <h2 className="text-xl font-bold text-white mb-2 text-center">Choose Your Perspective</h2>
        <p className="text-sm text-zinc-500 text-center mb-6">
          Select the area that best matches your role. You can review from different perspectives in separate sessions.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {areas.map((area) => {
            const Icon = area.icon;
            const isSelected = currentArea === area.id;
            const isRecommended = preferredArea === area.id;

            return (
              <button
                key={area.id}
                onClick={() => onSelectArea(area.id)}
                disabled={disabled}
                className={`relative p-6 rounded-xl border-2 transition-all text-left group ${
                  isSelected
                    ? 'border-blue-500 bg-blue-500/10'
                    : isRecommended
                    ? 'border-amber-500/50 bg-amber-500/5 hover:border-amber-500 hover:bg-amber-500/10'
                    : 'border-zinc-700 bg-zinc-900 hover:border-zinc-500 hover:bg-zinc-800/50'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3">
                    <CheckCircle className="w-6 h-6 text-blue-500" />
                  </div>
                )}
                {isRecommended && !isSelected && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-amber-500/20 rounded-full">
                    <Star className="w-3 h-3 text-amber-500" fill="currentColor" />
                    <span className="text-xs text-amber-400 font-medium">Your Role</span>
                  </div>
                )}

                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: area.color + '20' }}
                >
                  <Icon className="w-7 h-7" style={{ color: area.color }} />
                </div>

                <h3 className="text-lg font-semibold text-white mb-1">{area.name}</h3>
                <p className="text-sm text-zinc-400 mb-4">{area.description}</p>

                {/* Focus areas */}
                <div className="space-y-1 mb-4">
                  <p className="text-xs font-medium text-zinc-500 uppercase">You'll evaluate:</p>
                  <ul className="space-y-1">
                    {area.focuses.map((focus, idx) => (
                      <li key={idx} className="text-xs text-zinc-400 flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: area.color }} />
                        {focus}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Key questions */}
                <div className="pt-3 border-t border-zinc-800">
                  <p className="text-xs font-medium text-zinc-500 uppercase mb-2">Key questions you'll answer:</p>
                  <ul className="space-y-1">
                    {area.keyQuestions.map((q, idx) => (
                      <li key={idx} className="text-xs text-zinc-500 italic">"{q}"</li>
                    ))}
                  </ul>
                </div>

                {/* Start button hint */}
                <div className="mt-4 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: isSelected ? area.color + '30' : 'transparent',
                    color: isSelected ? area.color : '#71717a'
                  }}
                >
                  {isSelected ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Selected
                    </>
                  ) : (
                    <>
                      Click to select
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
        <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-400" />
          Quick Tips for Effective Reviews
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-zinc-400">
          <div className="flex items-start gap-2">
            <span className="text-green-400">✓</span>
            <span>Read all project info and tasks before answering questions</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-400">✓</span>
            <span>Focus comments on your area of expertise</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-400">✓</span>
            <span>Be honest about concerns — it helps everyone</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-400">✓</span>
            <span>Use keyboard shortcuts: 1/2 for tabs, ←/→ for navigation</span>
          </div>
        </div>
      </div>
    </div>
  );
}
