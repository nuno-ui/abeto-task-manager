'use client';

import { useEffect, useState } from 'react';
import { Trophy, PartyPopper, Star, ArrowRight } from 'lucide-react';

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: {
    reviewedProjects: number;
    feedbackCount: number;
    commentCount: number;
  };
  onContinue: () => void;
}

export function CelebrationModal({
  isOpen,
  onClose,
  stats,
  onContinue,
}: CelebrationModalProps) {
  const [confetti, setConfetti] = useState<{ id: number; left: number; delay: number; color: string }[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Generate confetti
      const colors = ['#fbbf24', '#22c55e', '#3b82f6', '#ec4899', '#8b5cf6'];
      const newConfetti = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
      }));
      setConfetti(newConfetti);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 overflow-hidden">
      {/* Confetti */}
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="absolute w-3 h-3 rounded-sm animate-confetti"
          style={{
            left: `${piece.left}%`,
            top: '-20px',
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
          }}
        />
      ))}

      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 max-w-md w-full mx-4 text-center relative">
        {/* Trophy icon with glow */}
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-yellow-400/30 rounded-full blur-2xl animate-pulse" />
          <div className="relative w-24 h-24 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center">
            <Trophy className="w-12 h-12 text-white" />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-white mb-2">
          All Done!
          <PartyPopper className="inline-block ml-2 w-8 h-8 text-yellow-400" />
        </h2>

        <p className="text-zinc-400 mb-6">
          You&apos;ve reviewed all available projects. Great work!
        </p>

        {/* Stats summary */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-zinc-800 rounded-lg p-4">
            <p className="text-3xl font-bold text-white">{stats.reviewedProjects}</p>
            <p className="text-xs text-zinc-400">Projects</p>
          </div>
          <div className="bg-zinc-800 rounded-lg p-4">
            <p className="text-3xl font-bold text-blue-400">{stats.feedbackCount}</p>
            <p className="text-xs text-zinc-400">Changes</p>
          </div>
          <div className="bg-zinc-800 rounded-lg p-4">
            <p className="text-3xl font-bold text-green-400">{stats.commentCount}</p>
            <p className="text-xs text-zinc-400">Comments</p>
          </div>
        </div>

        {/* Achievement badges */}
        <div className="flex justify-center gap-2 mb-8">
          <div className="flex items-center gap-1 px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">
            <Star className="w-4 h-4" />
            Thorough Reviewer
          </div>
          {stats.feedbackCount >= 5 && (
            <div className="flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
              <Star className="w-4 h-4" />
              Change Maker
            </div>
          )}
        </div>

        {/* Action button */}
        <button
          onClick={onClose}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-medium rounded-lg transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          Return to Dashboard
        </button>
      </div>

      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti 4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
