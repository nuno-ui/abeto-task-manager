'use client';

import { useState } from 'react';
import { Edit2, Check, X, MessageSquare } from 'lucide-react';

interface ReviewFeedbackFormProps {
  fieldName: string;
  fieldLabel: string;
  fieldType: 'select' | 'text' | 'textarea' | 'number';
  currentValue: string | number | null;
  options?: { value: string; label: string }[];
  onSubmit: (proposedValue: string, comment?: string) => void;
  existingProposedValue?: string | null;
  existingComment?: string | null;
  disabled?: boolean;
}

export function ReviewFeedbackForm({
  fieldName,
  fieldLabel,
  fieldType,
  currentValue,
  options,
  onSubmit,
  existingProposedValue,
  existingComment,
  disabled,
}: ReviewFeedbackFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [proposedValue, setProposedValue] = useState(existingProposedValue || '');
  const [comment, setComment] = useState(existingComment || '');
  const [showComment, setShowComment] = useState(!!existingComment);

  const handleSubmit = () => {
    if (proposedValue && proposedValue !== String(currentValue)) {
      onSubmit(proposedValue, comment || undefined);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setProposedValue(existingProposedValue || '');
    setComment(existingComment || '');
    setIsEditing(false);
  };

  const hasChange = existingProposedValue && existingProposedValue !== String(currentValue);

  if (!isEditing) {
    return (
      <div className="flex items-center gap-3 p-3 bg-zinc-800/30 rounded-lg">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-zinc-500 uppercase">{fieldLabel}</p>
          <div className="flex items-center gap-2">
            <p className="text-sm text-white">
              {currentValue || <span className="text-zinc-500">Not set</span>}
            </p>
            {hasChange && (
              <>
                <span className="text-zinc-500">→</span>
                <p className="text-sm text-blue-400 font-medium">{existingProposedValue}</p>
              </>
            )}
          </div>
          {existingComment && (
            <p className="text-xs text-zinc-400 mt-1 italic">&ldquo;{existingComment}&rdquo;</p>
          )}
        </div>
        <button
          onClick={() => setIsEditing(true)}
          disabled={disabled}
          className={`p-2 rounded-lg transition-colors ${
            hasChange
              ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
              : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600 hover:text-white'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Edit2 className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-white">{fieldLabel}</p>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCancel}
            className="p-1.5 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            onClick={handleSubmit}
            disabled={!proposedValue || proposedValue === String(currentValue)}
            className="p-1.5 text-green-400 hover:text-green-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 text-sm">
        <span className="text-zinc-500">Current:</span>
        <span className="text-zinc-300">{currentValue || 'Not set'}</span>
      </div>

      <div>
        <label className="block text-xs text-zinc-400 mb-1">Proposed Value</label>
        {fieldType === 'select' && options ? (
          <select
            value={proposedValue}
            onChange={(e) => setProposedValue(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="">Select a value...</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : fieldType === 'textarea' ? (
          <textarea
            value={proposedValue}
            onChange={(e) => setProposedValue(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
            rows={2}
            placeholder={`Suggest a new value for ${fieldLabel.toLowerCase()}...`}
          />
        ) : (
          <input
            type={fieldType === 'number' ? 'number' : 'text'}
            value={proposedValue}
            onChange={(e) => setProposedValue(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
            placeholder={`Suggest a new value for ${fieldLabel.toLowerCase()}...`}
          />
        )}
      </div>

      {/* Comment toggle and input */}
      {!showComment ? (
        <button
          onClick={() => setShowComment(true)}
          className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <MessageSquare className="w-3 h-3" />
          Add a comment explaining this change
        </button>
      ) : (
        <div>
          <label className="block text-xs text-zinc-400 mb-1">Comment (optional)</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
            rows={2}
            placeholder="Why are you suggesting this change?"
          />
        </div>
      )}
    </div>
  );
}
