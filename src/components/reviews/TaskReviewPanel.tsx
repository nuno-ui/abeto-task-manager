'use client';

import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MessageSquare,
  Star,
  Check,
  X,
} from 'lucide-react';
import { Task } from '@/types/database';

interface TaskFeedback {
  taskId: string;
  hoursCheck?: 'too_low' | 'accurate' | 'too_high';
  hasBlockers?: boolean;
  comment?: string;
}

interface TaskReviewPanelProps {
  tasks: Task[];
  taskFeedback: Record<string, TaskFeedback>;
  onTaskFeedback: (taskId: string, feedback: Partial<TaskFeedback>) => void;
  selectedTaskId: string | null;
  onSelectTask: (taskId: string | null) => void;
  disabled?: boolean;
}

const statusColors: Record<string, string> = {
  not_started: 'bg-zinc-500',
  in_progress: 'bg-yellow-500',
  blocked: 'bg-red-500',
  completed: 'bg-green-500',
  done: 'bg-green-500',
  cancelled: 'bg-zinc-600',
};

const statusLabels: Record<string, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  blocked: 'Blocked',
  completed: 'Done',
  done: 'Done',
  cancelled: 'Cancelled',
};

const aiPotentialColors: Record<string, string> = {
  high: 'text-green-400 bg-green-500/20',
  medium: 'text-yellow-400 bg-yellow-500/20',
  low: 'text-orange-400 bg-orange-500/20',
  none: 'text-zinc-400 bg-zinc-500/20',
};

const difficultyColors: Record<string, string> = {
  easy: 'text-green-400',
  medium: 'text-yellow-400',
  hard: 'text-red-400',
};

export function TaskReviewPanel({
  tasks,
  taskFeedback,
  onTaskFeedback,
  selectedTaskId,
  onSelectTask,
  disabled,
}: TaskReviewPanelProps) {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  const toggleTask = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  // Group tasks by phase
  const tasksByPhase = tasks.reduce((acc, task) => {
    const phase = task.phase || 'other';
    if (!acc[phase]) acc[phase] = [];
    acc[phase].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const phaseOrder = ['discovery', 'planning', 'development', 'testing', 'training', 'rollout', 'monitoring', 'other'];
  const phaseLabels: Record<string, string> = {
    discovery: 'Discovery',
    planning: 'Planning',
    development: 'Development',
    testing: 'Testing',
    training: 'Training',
    rollout: 'Rollout',
    monitoring: 'Monitoring',
    other: 'Other',
  };

  const reviewedCount = Object.keys(taskFeedback).filter(
    id => taskFeedback[id].hoursCheck || taskFeedback[id].hasBlockers !== undefined || taskFeedback[id].comment
  ).length;

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-zinc-800/50 rounded-lg">
        <span className="text-sm text-zinc-400">
          {tasks.length} tasks total
        </span>
        <span className="text-sm text-blue-400">
          {reviewedCount} reviewed
        </span>
      </div>

      {/* Tasks grouped by phase */}
      <div className="space-y-4 max-h-[500px] overflow-y-auto">
        {phaseOrder.map((phase) => {
          const phaseTasks = tasksByPhase[phase];
          if (!phaseTasks || phaseTasks.length === 0) return null;

          return (
            <div key={phase}>
              <h4 className="text-xs font-medium text-zinc-500 uppercase mb-2">
                {phaseLabels[phase]} ({phaseTasks.length})
              </h4>
              <div className="space-y-2">
                {phaseTasks.map((task) => {
                  const isExpanded = expandedTasks.has(task.id);
                  const isSelected = selectedTaskId === task.id;
                  const feedback = taskFeedback[task.id] || {};
                  const hasFeedback = feedback.hoursCheck || feedback.hasBlockers !== undefined || feedback.comment;

                  return (
                    <div
                      key={task.id}
                      className={`bg-zinc-800/40 rounded-lg overflow-hidden border transition-colors ${
                        isSelected ? 'border-blue-500' : hasFeedback ? 'border-green-500/50' : 'border-zinc-700/50'
                      }`}
                    >
                      {/* Task header */}
                      <div
                        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-zinc-800/60 transition-colors"
                        onClick={() => toggleTask(task.id)}
                      >
                        <div className={`w-2 h-2 rounded-full shrink-0 ${statusColors[task.status]}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{task.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs ${difficultyColors[task.difficulty] || 'text-zinc-400'}`}>
                              {task.difficulty}
                            </span>
                            <span className="text-xs text-zinc-500">•</span>
                            <span className="text-xs text-zinc-400">
                              {task.estimated_hours || '?'}h
                            </span>
                            {task.ai_potential && (
                              <>
                                <span className="text-xs text-zinc-500">•</span>
                                <span className={`text-xs px-1.5 py-0.5 rounded ${aiPotentialColors[task.ai_potential]}`}>
                                  AI: {task.ai_potential}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        {hasFeedback && (
                          <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                        )}
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-zinc-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-zinc-400" />
                        )}
                      </div>

                      {/* Expanded details */}
                      {isExpanded && (
                        <div className="p-3 pt-0 border-t border-zinc-700/50 space-y-4">
                          {/* Task description */}
                          {task.description && (
                            <p className="text-xs text-zinc-400">{task.description}</p>
                          )}

                          {/* Task details */}
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-zinc-500">Status: </span>
                              <span className="text-zinc-300">{statusLabels[task.status]}</span>
                            </div>
                            <div>
                              <span className="text-zinc-500">Est. Hours: </span>
                              <span className="text-zinc-300">{task.estimated_hours || 'Not set'}</span>
                            </div>
                            {task.ai_assist_description && (
                              <div className="col-span-2">
                                <span className="text-zinc-500">AI Assist: </span>
                                <span className="text-cyan-300">{task.ai_assist_description}</span>
                              </div>
                            )}
                          </div>

                          {/* Quick review inputs */}
                          <div className="space-y-3 pt-2 border-t border-zinc-700/30">
                            <p className="text-xs text-zinc-500 uppercase font-medium">Your Review</p>

                            {/* Hours estimate check */}
                            <div>
                              <p className="text-xs text-zinc-400 mb-1">Hours estimate accurate?</p>
                              <div className="flex gap-2">
                                {[
                                  { value: 'too_low', label: 'Under', color: 'red' },
                                  { value: 'accurate', label: 'Good', color: 'green' },
                                  { value: 'too_high', label: 'Over', color: 'blue' },
                                ].map((opt) => (
                                  <button
                                    key={opt.value}
                                    onClick={() => onTaskFeedback(task.id, { hoursCheck: opt.value as any })}
                                    disabled={disabled}
                                    className={`px-2 py-1 text-xs rounded border transition-colors ${
                                      feedback.hoursCheck === opt.value
                                        ? opt.color === 'red'
                                          ? 'bg-red-500 text-white border-red-500'
                                          : opt.color === 'green'
                                          ? 'bg-green-500 text-white border-green-500'
                                          : 'bg-blue-500 text-white border-blue-500'
                                        : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-500'
                                    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  >
                                    {opt.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Blockers */}
                            <div>
                              <p className="text-xs text-zinc-400 mb-1">Any blockers/concerns?</p>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => onTaskFeedback(task.id, { hasBlockers: true })}
                                  disabled={disabled}
                                  className={`flex items-center gap-1 px-2 py-1 text-xs rounded border transition-colors ${
                                    feedback.hasBlockers === true
                                      ? 'bg-red-500/20 text-red-400 border-red-500/50'
                                      : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-500'
                                  } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  <AlertTriangle className="w-3 h-3" />
                                  Yes
                                </button>
                                <button
                                  onClick={() => onTaskFeedback(task.id, { hasBlockers: false })}
                                  disabled={disabled}
                                  className={`flex items-center gap-1 px-2 py-1 text-xs rounded border transition-colors ${
                                    feedback.hasBlockers === false
                                      ? 'bg-green-500/20 text-green-400 border-green-500/50'
                                      : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-500'
                                  } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  <Check className="w-3 h-3" />
                                  No
                                </button>
                              </div>
                            </div>

                            {/* Comment input */}
                            <div>
                              <p className="text-xs text-zinc-400 mb-1">Notes (optional)</p>
                              <textarea
                                value={feedback.comment || ''}
                                onChange={(e) => onTaskFeedback(task.id, { comment: e.target.value })}
                                placeholder="Any specific feedback for this task..."
                                disabled={disabled}
                                className="w-full px-2 py-1 text-xs bg-zinc-900 border border-zinc-700 rounded text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 resize-none disabled:opacity-50"
                                rows={2}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
