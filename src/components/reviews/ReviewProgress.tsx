'use client';

import { useState, useEffect } from 'react';
import { Trophy, Flame, Target, Star, Zap, Clock, TrendingUp, Award } from 'lucide-react';

interface ReviewProgressProps {
  totalProjects: number;
  reviewedProjects: number;
  feedbackCount: number;
  commentCount: number;
  streak?: number;
  currentProjectName?: string;
}

export function ReviewProgress({
  totalProjects,
  reviewedProjects,
  feedbackCount,
  commentCount,
  streak = 0,
  currentProjectName,
}: ReviewProgressProps) {
  const [sessionTime, setSessionTime] = useState(0);
  const [showMotivation, setShowMotivation] = useState(false);

  const progress = totalProjects > 0 ? Math.round((reviewedProjects / totalProjects) * 100) : 0;
  const remaining = totalProjects - reviewedProjects;

  // Track session time
  useEffect(() => {
    const interval = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Show motivation when hitting milestones
  useEffect(() => {
    if (progress === 25 || progress === 50 || progress === 75 || progress === 100) {
      setShowMotivation(true);
      setTimeout(() => setShowMotivation(false), 3000);
    }
  }, [progress]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate engagement score (0-100 based on feedback and comments)
  const engagementScore = Math.min(100, Math.round(
    ((feedbackCount * 10) + (commentCount * 15)) / Math.max(1, reviewedProjects)
  ));

  // Calculate milestone
  const getMilestone = () => {
    if (progress >= 100) return { label: 'Complete!', icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-500/10', motivate: '🏆 Amazing work!' };
    if (progress >= 75) return { label: 'Almost there!', icon: Star, color: 'text-purple-400', bg: 'bg-purple-500/10', motivate: '⭐ So close!' };
    if (progress >= 50) return { label: 'Halfway!', icon: Target, color: 'text-blue-400', bg: 'bg-blue-500/10', motivate: '🎯 Halfway point!' };
    if (progress >= 25) return { label: 'Great start!', icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10', motivate: '🔥 Keep going!' };
    return { label: 'Let\'s go!', icon: Zap, color: 'text-cyan-400', bg: 'bg-cyan-500/10', motivate: '⚡ Let\'s do this!' };
  };

  const milestone = getMilestone();
  const MilestoneIcon = milestone.icon;

  // Calculate circle properties
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Estimate time remaining based on average time per project
  const avgTimePerProject = reviewedProjects > 0 ? sessionTime / reviewedProjects : 120; // default 2 min
  const estTimeRemaining = Math.round((remaining * avgTimePerProject) / 60);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      {/* Motivation Toast */}
      {showMotivation && (
        <div className={`${milestone.bg} border-b border-zinc-800 px-4 py-2 text-center animate-pulse`}>
          <span className={`${milestone.color} font-semibold`}>{milestone.motivate}</span>
        </div>
      )}

      <div className="p-6">
        <div className="flex items-center gap-6">
          {/* Compact Circular Progress */}
          <div className="relative w-32 h-32 shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="64"
                cy="64"
                r={radius}
                fill="none"
                stroke="#27272a"
                strokeWidth="10"
              />
              {/* Progress circle */}
              <circle
                cx="64"
                cy="64"
                r={radius}
                fill="none"
                stroke={progress >= 100 ? '#22c55e' : progress >= 50 ? '#3b82f6' : '#06b6d4'}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-700 ease-out"
              />
            </svg>
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-white">{progress}%</span>
              <span className="text-xs text-zinc-500">Complete</span>
            </div>
          </div>

          {/* Main Stats */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <MilestoneIcon className={`w-5 h-5 ${milestone.color}`} />
              <span className={`text-base font-semibold ${milestone.color}`}>{milestone.label}</span>

              {/* Streak Badge */}
              {streak > 0 && (
                <span className="ml-2 flex items-center gap-1 px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded-full text-xs font-medium">
                  <Flame className="w-3 h-3" />
                  {streak} streak
                </span>
              )}
            </div>

            {/* Compact Stats Row */}
            <div className="grid grid-cols-4 gap-2">
              <StatBox value={reviewedProjects} label="Done" color="text-green-400" />
              <StatBox value={remaining} label="Left" color="text-white" />
              <StatBox value={feedbackCount} label="Ratings" color="text-blue-400" />
              <StatBox value={commentCount} label="Notes" color="text-purple-400" />
            </div>

            {/* Progress bar with milestones */}
            <div className="mt-3 space-y-1">
              <div className="relative h-2 bg-zinc-800 rounded-full overflow-visible">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    progress >= 100 ? 'bg-gradient-to-r from-green-500 to-emerald-400' :
                    progress >= 50 ? 'bg-gradient-to-r from-blue-500 to-cyan-400' :
                    'bg-gradient-to-r from-cyan-500 to-blue-400'
                  }`}
                  style={{ width: `${progress}%` }}
                />
                {/* Milestone markers */}
                <div className="absolute top-1/2 -translate-y-1/2 left-1/4 w-1.5 h-1.5 rounded-full bg-zinc-600" />
                <div className="absolute top-1/2 -translate-y-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-zinc-600" />
                <div className="absolute top-1/2 -translate-y-1/2 left-3/4 w-1.5 h-1.5 rounded-full bg-zinc-600" />
              </div>
              <div className="flex justify-between text-xs text-zinc-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTime(sessionTime)}
                </span>
                {remaining > 0 && (
                  <span>~{estTimeRemaining} min left</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Engagement Summary */}
        {reviewedProjects > 0 && (
          <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-zinc-400" />
              <span className="text-xs text-zinc-400">Engagement Score</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    engagementScore >= 70 ? 'bg-green-500' :
                    engagementScore >= 40 ? 'bg-yellow-500' :
                    'bg-zinc-600'
                  }`}
                  style={{ width: `${engagementScore}%` }}
                />
              </div>
              <span className={`text-xs font-medium ${
                engagementScore >= 70 ? 'text-green-400' :
                engagementScore >= 40 ? 'text-yellow-400' :
                'text-zinc-400'
              }`}>
                {engagementScore >= 70 ? 'Thorough' : engagementScore >= 40 ? 'Good' : 'Quick'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatBox({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="text-center">
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-[10px] text-zinc-500 uppercase tracking-wide">{label}</p>
    </div>
  );
}
