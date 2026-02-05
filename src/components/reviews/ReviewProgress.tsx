'use client';

import { Trophy, Flame, Target, Star } from 'lucide-react';

interface ReviewProgressProps {
  totalProjects: number;
  reviewedProjects: number;
  feedbackCount: number;
  commentCount: number;
}

export function ReviewProgress({
  totalProjects,
  reviewedProjects,
  feedbackCount,
  commentCount,
}: ReviewProgressProps) {
  const progress = totalProjects > 0 ? Math.round((reviewedProjects / totalProjects) * 100) : 0;
  const remaining = totalProjects - reviewedProjects;

  // Calculate milestone
  const getMilestone = () => {
    if (progress >= 100) return { label: 'Complete!', icon: Trophy, color: 'text-yellow-400' };
    if (progress >= 75) return { label: 'Almost there!', icon: Star, color: 'text-purple-400' };
    if (progress >= 50) return { label: 'Halfway!', icon: Target, color: 'text-blue-400' };
    if (progress >= 25) return { label: 'Great start!', icon: Flame, color: 'text-orange-400' };
    return { label: 'Just started', icon: Flame, color: 'text-zinc-400' };
  };

  const milestone = getMilestone();
  const MilestoneIcon = milestone.icon;

  // Calculate circle properties
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <div className="flex items-center gap-8">
        {/* Circular Progress */}
        <div className="relative w-40 h-40 shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="#27272a"
              strokeWidth="12"
            />
            {/* Progress circle */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke={progress >= 100 ? '#22c55e' : '#3b82f6'}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-500 ease-out"
            />
          </svg>
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-white">{progress}%</span>
            <span className="text-sm text-zinc-400">Complete</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-2">
            <MilestoneIcon className={`w-6 h-6 ${milestone.color}`} />
            <span className={`text-lg font-semibold ${milestone.color}`}>{milestone.label}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-800/50 rounded-lg p-3">
              <p className="text-2xl font-bold text-white">{reviewedProjects}</p>
              <p className="text-xs text-zinc-400">Projects Reviewed</p>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-3">
              <p className="text-2xl font-bold text-white">{remaining}</p>
              <p className="text-xs text-zinc-400">Remaining</p>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-3">
              <p className="text-2xl font-bold text-blue-400">{feedbackCount}</p>
              <p className="text-xs text-zinc-400">Changes Proposed</p>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-3">
              <p className="text-2xl font-bold text-green-400">{commentCount}</p>
              <p className="text-xs text-zinc-400">Comments Added</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-zinc-400">
              <span>{reviewedProjects} of {totalProjects} projects</span>
              <span>{remaining} to go</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  progress >= 100 ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
