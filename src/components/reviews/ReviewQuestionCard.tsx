'use client';

import { useState } from 'react';
import { Star, Check, X, AlertTriangle, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface ReviewQuestion {
  id: string;
  question: string;
  description: string;
  type: 'rating' | 'boolean' | 'text' | 'select';
  options?: { value: string; label: string; color?: string }[];
  fieldRef?: string;
}

interface ReviewQuestionCardProps {
  question: ReviewQuestion;
  currentFieldValue?: string | number | string[] | null;
  value?: string | number | null;
  onChange: (value: string | number) => void;
  disabled?: boolean;
}

const colorMap: Record<string, string> = {
  red: 'bg-red-500/20 text-red-400 border-red-500/50 hover:bg-red-500/30',
  yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50 hover:bg-yellow-500/30',
  green: 'bg-green-500/20 text-green-400 border-green-500/50 hover:bg-green-500/30',
  blue: 'bg-blue-500/20 text-blue-400 border-blue-500/50 hover:bg-blue-500/30',
};

const selectedColorMap: Record<string, string> = {
  red: 'bg-red-500 text-white border-red-500',
  yellow: 'bg-yellow-500 text-black border-yellow-500',
  green: 'bg-green-500 text-white border-green-500',
  blue: 'bg-blue-500 text-white border-blue-500',
};

export function ReviewQuestionCard({
  question,
  currentFieldValue,
  value,
  onChange,
  disabled,
}: ReviewQuestionCardProps) {
  const [showContext, setShowContext] = useState(false);

  // Format field value for display
  const formatFieldValue = (val: string | number | string[] | null | undefined) => {
    if (val === null || val === undefined) return 'Not set';
    if (Array.isArray(val)) return val.length > 0 ? val.join(', ') : 'None';
    return String(val);
  };

  return (
    <div className="bg-zinc-800/40 rounded-lg p-4 space-y-3 border border-zinc-700/50">
      {/* Question header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <h4 className="text-sm font-medium text-white">{question.question}</h4>
          <p className="text-xs text-zinc-400 mt-0.5">{question.description}</p>
        </div>
        {question.fieldRef && currentFieldValue !== undefined && (
          <button
            onClick={() => setShowContext(!showContext)}
            className="flex items-center gap-1 px-2 py-1 text-xs text-zinc-400 hover:text-white bg-zinc-800 rounded transition-colors"
          >
            <HelpCircle className="w-3 h-3" />
            Context
            {showContext ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}
      </div>

      {/* Context panel - shows current field value */}
      {showContext && currentFieldValue !== undefined && (
        <div className="bg-zinc-900/50 rounded p-2 text-xs">
          <span className="text-zinc-500">Current value: </span>
          <span className="text-zinc-300">{formatFieldValue(currentFieldValue)}</span>
        </div>
      )}

      {/* Rating input (1-5 stars) */}
      {question.type === 'rating' && (
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => onChange(star)}
              disabled={disabled}
              className={`p-1 rounded transition-colors ${
                value && Number(value) >= star
                  ? 'text-yellow-400'
                  : 'text-zinc-600 hover:text-zinc-400'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Star className="w-6 h-6" fill={value && Number(value) >= star ? 'currentColor' : 'none'} />
            </button>
          ))}
          {value && (
            <span className="ml-2 text-xs text-zinc-400">
              {Number(value) <= 2 ? 'Concern' : Number(value) === 3 ? 'Neutral' : 'Good'}
            </span>
          )}
        </div>
      )}

      {/* Boolean input (Yes/No) */}
      {question.type === 'boolean' && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onChange('yes')}
            disabled={disabled}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              value === 'yes'
                ? 'bg-green-500/20 text-green-400 border-green-500/50'
                : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Check className="w-4 h-4" />
            Yes
          </button>
          <button
            onClick={() => onChange('no')}
            disabled={disabled}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              value === 'no'
                ? 'bg-red-500/20 text-red-400 border-red-500/50'
                : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <X className="w-4 h-4" />
            No
          </button>
        </div>
      )}

      {/* Select input (colored options) */}
      {question.type === 'select' && question.options && (
        <div className="flex flex-wrap gap-2">
          {question.options.map((option) => {
            const isSelected = value === option.value;
            const color = option.color || 'blue';
            return (
              <button
                key={option.value}
                onClick={() => onChange(option.value)}
                disabled={disabled}
                className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                  isSelected
                    ? selectedColorMap[color]
                    : colorMap[color]
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Text input */}
      {question.type === 'text' && (
        <textarea
          value={value as string || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="Enter your feedback..."
          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 resize-none disabled:opacity-50"
          rows={2}
        />
      )}
    </div>
  );
}
