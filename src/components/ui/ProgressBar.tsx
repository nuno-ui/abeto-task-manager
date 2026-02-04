'use client';

import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  color?: 'blue' | 'green' | 'yellow' | 'red';
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  size = 'md',
  showLabel = false,
  color = 'blue',
  className,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
  };

  // Auto-color based on percentage
  const autoColor =
    percentage >= 100
      ? 'bg-green-500'
      : percentage >= 75
      ? 'bg-blue-500'
      : percentage >= 50
      ? 'bg-yellow-500'
      : percentage >= 25
      ? 'bg-orange-500'
      : 'bg-zinc-600';

  return (
    <div className={cn('space-y-1', className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-zinc-400">
          <span>Progress</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={cn('w-full bg-zinc-800 rounded-full overflow-hidden', sizes[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-300', color ? colors[color] : autoColor)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
