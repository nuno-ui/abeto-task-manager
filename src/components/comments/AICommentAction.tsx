'use client';

import { useState } from 'react';
import { Sparkles, X, Loader2, Check, ArrowRight, AlertCircle } from 'lucide-react';
import { UpdateSuggestion } from '@/lib/ai';

interface AICommentActionProps {
  commentContent: string;
  projectId?: string;
  taskId?: string;
  onUpdatesApplied?: () => void;
}

export function AICommentAction({
  commentContent,
  projectId,
  taskId,
  onUpdatesApplied
}: AICommentActionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [suggestions, setSuggestions] = useState<UpdateSuggestion[]>([]);
  const [summary, setSummary] = useState('');
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);

  const handleAnalyze = async () => {
    setIsOpen(true);
    setLoading(true);
    setError(null);
    setSuggestions([]);
    setSelectedSuggestions(new Set());

    try {
      const response = await fetch('/api/ai/process-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: commentContent,
          projectId,
          taskId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze comment');
      }

      setSuggestions(data.suggestions || []);
      setSummary(data.summary || '');

      // Select all suggestions by default
      const allIndices = new Set<number>(data.suggestions.map((_: any, i: number) => i));
      setSelectedSuggestions(allIndices);

    } catch (err) {
      console.error('Error analyzing comment:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze comment');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (selectedSuggestions.size === 0) return;

    setApplying(true);
    setError(null);

    try {
      const suggestionsToApply = suggestions.filter((_, i) => selectedSuggestions.has(i));

      const response = await fetch('/api/ai/apply-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suggestions: suggestionsToApply })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to apply suggestions');
      }

      setApplied(true);
      onUpdatesApplied?.();

      // Close modal after a short delay
      setTimeout(() => {
        setIsOpen(false);
        setApplied(false);
      }, 1500);

    } catch (err) {
      console.error('Error applying suggestions:', err);
      setError(err instanceof Error ? err.message : 'Failed to apply suggestions');
    } finally {
      setApplying(false);
    }
  };

  const toggleSuggestion = (index: number) => {
    setSelectedSuggestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'not set';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) return value.join(', ');
    return String(value);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={handleAnalyze}
        className="flex items-center gap-1.5 px-2 py-1 text-xs text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 rounded transition-colors"
        title="Analyze comment with AI"
      >
        <Sparkles className="w-3.5 h-3.5" />
        Apply with AI
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-500/20 rounded-lg">
                  <Sparkles className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">AI Analysis</h2>
                  <p className="text-sm text-zinc-400">Review suggested updates</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-violet-400 mb-4" />
                  <p className="text-zinc-400">Analyzing comment...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertCircle className="w-8 h-8 text-red-400 mb-4" />
                  <p className="text-red-400 mb-4">{error}</p>
                  <button
                    onClick={handleAnalyze}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm text-white transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : applied ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                    <Check className="w-6 h-6 text-green-400" />
                  </div>
                  <p className="text-green-400 font-medium">Updates Applied!</p>
                </div>
              ) : (
                <>
                  {/* Comment */}
                  <div className="mb-6">
                    <p className="text-xs text-zinc-500 mb-2">Original Comment</p>
                    <div className="bg-zinc-800/50 rounded-lg px-4 py-3">
                      <p className="text-sm text-zinc-300">{commentContent}</p>
                    </div>
                  </div>

                  {/* Summary */}
                  {summary && (
                    <div className="mb-6">
                      <p className="text-xs text-zinc-500 mb-2">AI Understanding</p>
                      <p className="text-sm text-zinc-300">{summary}</p>
                    </div>
                  )}

                  {/* Suggestions */}
                  {suggestions.length > 0 ? (
                    <div className="space-y-3">
                      <p className="text-xs text-zinc-500">Suggested Updates ({suggestions.length})</p>
                      {suggestions.map((suggestion, index) => (
                        <label
                          key={index}
                          className={`block p-4 rounded-xl border transition-colors cursor-pointer ${
                            selectedSuggestions.has(index)
                              ? 'bg-violet-500/10 border-violet-500/50'
                              : 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-600'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={selectedSuggestions.has(index)}
                              onChange={() => toggleSuggestion(index)}
                              className="mt-1 w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-violet-500 focus:ring-violet-500"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`px-2 py-0.5 text-xs rounded ${
                                  suggestion.type === 'project'
                                    ? 'bg-blue-500/20 text-blue-400'
                                    : 'bg-green-500/20 text-green-400'
                                }`}>
                                  {suggestion.type}
                                </span>
                                <span className="text-sm text-white font-medium">
                                  {suggestion.field}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-zinc-500 line-through">
                                  {formatValue(suggestion.currentValue)}
                                </span>
                                <ArrowRight className="w-4 h-4 text-zinc-600" />
                                <span className="text-violet-400 font-medium">
                                  {formatValue(suggestion.suggestedValue)}
                                </span>
                              </div>
                              {suggestion.reason && (
                                <p className="mt-2 text-xs text-zinc-400">
                                  {suggestion.reason}
                                </p>
                              )}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-zinc-400 mb-2">No actionable updates found</p>
                      <p className="text-sm text-zinc-500">
                        This comment appears to be informational and doesn't suggest any field changes.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            {!loading && !error && !applied && suggestions.length > 0 && (
              <div className="px-6 py-4 border-t border-zinc-800 flex items-center justify-between">
                <p className="text-sm text-zinc-400">
                  {selectedSuggestions.size} of {suggestions.length} selected
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApply}
                    disabled={selectedSuggestions.size === 0 || applying}
                    className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm text-white font-medium transition-colors"
                  >
                    {applying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Applying...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Apply Selected
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
