'use client';

import { ReviewerArea } from '@/types/database';
import { Briefcase, Users, Code2, CheckCircle, Star } from 'lucide-react';

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
}[] = [
  {
    id: 'management',
    name: 'Management',
    description: 'Strategic leadership and resource allocation',
    icon: Briefcase,
    color: '#6366f1',
    focuses: [
      'Priority & strategic alignment',
      'Team assignments',
      'Target dates & milestones',
      'Resource allocation',
    ],
  },
  {
    id: 'operations_sales',
    name: 'Operations / Sales',
    description: 'Customer impact and operational efficiency',
    icon: Users,
    color: '#10b981',
    focuses: [
      'Operational processes',
      'Customer benefits',
      'Training & empowerment',
      'Prerequisites & integrations',
    ],
  },
  {
    id: 'product_tech',
    name: 'Product / Tech',
    description: 'Technical feasibility and implementation',
    icon: Code2,
    color: '#f59e0b',
    focuses: [
      'Technical difficulty',
      'API & resource needs',
      'AI potential per task',
      'Dependencies & architecture',
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
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Select Your Review Perspective</h2>
        <p className="text-zinc-400">
          {userName ? (
            <>Welcome, <span className="text-white font-medium">{userName}</span>! </>
          ) : null}
          Choose the area that best represents your role. You can review from different perspectives in separate sessions.
        </p>
      </div>

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
              className={`relative p-6 rounded-xl border-2 transition-all text-left ${
                isSelected
                  ? 'border-blue-500 bg-blue-500/10'
                  : isRecommended
                  ? 'border-amber-500/50 bg-amber-500/5 hover:border-amber-500 hover:bg-amber-500/10'
                  : 'border-zinc-700 bg-zinc-900 hover:border-zinc-600 hover:bg-zinc-800/50'
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
                  <span className="text-xs text-amber-400 font-medium">Recommended</span>
                </div>
              )}

              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: area.color + '20' }}
              >
                <Icon className="w-7 h-7" style={{ color: area.color }} />
              </div>

              <h3 className="text-lg font-semibold text-white mb-1">{area.name}</h3>
              <p className="text-sm text-zinc-400 mb-4">{area.description}</p>

              <div className="space-y-1">
                <p className="text-xs font-medium text-zinc-500 uppercase">You&apos;ll focus on:</p>
                <ul className="space-y-1">
                  {area.focuses.map((focus, idx) => (
                    <li key={idx} className="text-xs text-zinc-400 flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full" style={{ backgroundColor: area.color }} />
                      {focus}
                    </li>
                  ))}
                </ul>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
