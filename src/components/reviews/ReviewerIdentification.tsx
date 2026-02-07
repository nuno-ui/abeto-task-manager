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
  ArrowRight,
  Zap,
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
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Compact Welcome Section */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-500/10 border border-violet-500/30 rounded-full mb-3">
          <Eye className="w-4 h-4 text-violet-400" />
          <span className="text-sm text-violet-300 font-medium">Project Review System</span>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">
          {userName ? (
            <>Welcome, <span className="text-violet-400">{userName}</span>!</>
          ) : (
            <>Welcome to Project Reviews</>
          )}
        </h1>

        <p className="text-zinc-400">
          Choose your perspective to start reviewing projects.
        </p>
      </div>

      {/* Choose Your Perspective - Main Focus */}
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
              className={`relative p-5 rounded-xl border-2 transition-all text-left group ${
                isSelected
                  ? 'border-blue-500 bg-blue-500/10'
                  : isRecommended
                  ? 'border-amber-500/50 bg-amber-500/5 hover:border-amber-500 hover:bg-amber-500/10'
                  : 'border-zinc-700 bg-zinc-900 hover:border-zinc-500 hover:bg-zinc-800/50'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {isRecommended && !isSelected && (
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-amber-500/20 rounded-full">
                  <Star className="w-3 h-3 text-amber-500" fill="currentColor" />
                  <span className="text-xs text-amber-400 font-medium">Recommended</span>
                </div>
              )}

              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                style={{ backgroundColor: area.color + '20' }}
              >
                <Icon className="w-6 h-6" style={{ color: area.color }} />
              </div>

              <h3 className="text-lg font-semibold text-white mb-1">{area.name}</h3>
              <p className="text-sm text-zinc-400 mb-3">{area.description}</p>

              {/* Key questions preview */}
              <div className="pt-3 border-t border-zinc-800">
                <p className="text-xs text-zinc-500 mb-1">You'll answer questions like:</p>
                <p className="text-xs text-zinc-400 italic">"{area.keyQuestions[0]}"</p>
              </div>

              {/* Hover hint */}
              <div className="mt-3 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors"
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
                    Click to start
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Compact info footer */}
      <div className="flex items-center justify-center gap-6 text-xs text-zinc-500 pt-2">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-blue-400" />
          <span>Each project needs 3 perspectives</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-400" />
          <span>Detailed guidance shown after selection</span>
        </div>
      </div>
    </div>
  );
}
