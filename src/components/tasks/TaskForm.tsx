'use client';

import { useState } from 'react';
import { Button, Input, Select, Textarea } from '@/components/ui';
import { X, Plus } from 'lucide-react';
import type { CreateTaskInput, Team, User } from '@/types/database';

interface TaskFormProps {
  projectId: string;
  initialData?: Partial<CreateTaskInput>;
  teams: Team[];
  users: User[];
  onSubmit: (data: CreateTaskInput) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const phaseOptions = [
  { value: 'discovery', label: 'Discovery' },
  { value: 'planning', label: 'Planning' },
  { value: 'development', label: 'Development' },
  { value: 'testing', label: 'Testing' },
  { value: 'training', label: 'Training' },
  { value: 'rollout', label: 'Rollout' },
  { value: 'monitoring', label: 'Monitoring' },
];

const statusOptions = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'in_review', label: 'In Review' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const difficultyOptions = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

const aiPotentialOptions = [
  { value: 'none', label: 'None' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export function TaskForm({
  projectId,
  initialData,
  teams,
  users,
  onSubmit,
  onCancel,
  loading,
}: TaskFormProps) {
  const [formData, setFormData] = useState<CreateTaskInput>({
    project_id: projectId,
    title: '',
    description: '',
    phase: 'planning',
    status: 'not_started',
    difficulty: 'medium',
    owner_team_id: '',
    assignee_id: '',
    estimated_hours: '',
    ai_potential: 'medium',
    ai_assist_description: '',
    tools_needed: [],
    knowledge_areas: [],
    acceptance_criteria: [],
    success_metrics: [],
    risks: [],
    blocked_by: [],
    due_date: '',
    demo_link: '',
    google_drive_folder_url: '',
    is_foundational: false,
    is_critical_path: false,
    ...initialData,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newItem, setNewItem] = useState<Record<string, string>>({});

  const handleChange = (field: keyof CreateTaskInput, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleArrayAdd = (field: 'tools_needed' | 'knowledge_areas' | 'acceptance_criteria' | 'success_metrics' | 'risks') => {
    const value = newItem[field]?.trim();
    if (value && !formData[field]?.includes(value)) {
      setFormData((prev) => ({
        ...prev,
        [field]: [...(prev[field] || []), value],
      }));
      setNewItem((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleArrayRemove = (field: 'tools_needed' | 'knowledge_areas' | 'acceptance_criteria' | 'success_metrics' | 'risks', index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field]?.filter((_, i) => i !== index),
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      await onSubmit(formData);
    }
  };

  const teamOptions = teams.map((team) => ({
    value: team.id,
    label: team.name,
  }));

  const userOptions = users.map((user) => ({
    value: user.id,
    label: user.full_name || user.email,
  }));

  const ArrayInput = ({
    label,
    field,
    placeholder,
  }: {
    label: string;
    field: 'tools_needed' | 'knowledge_areas' | 'acceptance_criteria' | 'success_metrics' | 'risks';
    placeholder: string;
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-zinc-300">{label}</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={newItem[field] || ''}
          onChange={(e) => setNewItem((prev) => ({ ...prev, [field]: e.target.value }))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleArrayAdd(field);
            }
          }}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button type="button" variant="secondary" size="sm" onClick={() => handleArrayAdd(field)}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      {formData[field] && formData[field].length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {formData[field].map((item, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-800 text-zinc-300 text-xs rounded-full"
            >
              {item}
              <button
                type="button"
                onClick={() => handleArrayRemove(field, index)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Basic Info</h3>
        <Input
          label="Title"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          error={errors.title}
          placeholder="e.g., Data Audit & Gap Analysis"
          required
        />
        <Textarea
          label="Description"
          value={formData.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="What needs to be done?"
          rows={3}
        />
      </div>

      {/* Classification */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Classification</h3>
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Phase"
            options={phaseOptions}
            value={formData.phase || 'planning'}
            onChange={(e) => handleChange('phase', e.target.value)}
          />
          <Select
            label="Status"
            options={statusOptions}
            value={formData.status || 'not_started'}
            onChange={(e) => handleChange('status', e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Difficulty"
            options={difficultyOptions}
            value={formData.difficulty || 'medium'}
            onChange={(e) => handleChange('difficulty', e.target.value)}
          />
          <Select
            label="Owner Team"
            options={teamOptions}
            value={formData.owner_team_id || ''}
            onChange={(e) => handleChange('owner_team_id', e.target.value)}
            placeholder="Select team..."
          />
        </div>
        <Select
          label="Assignee"
          options={userOptions}
          value={formData.assignee_id || ''}
          onChange={(e) => handleChange('assignee_id', e.target.value)}
          placeholder="Select assignee..."
        />
      </div>

      {/* Estimates */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Estimates</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Estimated Hours"
            value={formData.estimated_hours || ''}
            onChange={(e) => handleChange('estimated_hours', e.target.value)}
            placeholder="e.g., 8-12h"
          />
          <Input
            label="Due Date"
            type="date"
            value={formData.due_date || ''}
            onChange={(e) => handleChange('due_date', e.target.value)}
          />
        </div>
      </div>

      {/* Links */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Links</h3>
        <Input
          label="Demo / Document Link"
          type="url"
          value={formData.demo_link || ''}
          onChange={(e) => handleChange('demo_link', e.target.value)}
          placeholder="https://... (Notion, Google Docs, demo URL, etc.)"
        />
        <Input
          label="Google Drive Folder"
          type="url"
          value={formData.google_drive_folder_url || ''}
          onChange={(e) => handleChange('google_drive_folder_url', e.target.value)}
          placeholder="https://drive.google.com/drive/folders/..."
        />
      </div>

      {/* AI Assessment */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">AI Assessment</h3>
        <Select
          label="AI Potential"
          options={aiPotentialOptions}
          value={formData.ai_potential || 'medium'}
          onChange={(e) => handleChange('ai_potential', e.target.value)}
        />
        <Textarea
          label="AI Assist Description"
          value={formData.ai_assist_description || ''}
          onChange={(e) => handleChange('ai_assist_description', e.target.value)}
          placeholder="How can AI help with this task?"
          rows={2}
        />
      </div>

      {/* Requirements */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Requirements</h3>
        <ArrayInput label="Tools Needed" field="tools_needed" placeholder="e.g., PostgreSQL" />
        <ArrayInput label="Knowledge Areas" field="knowledge_areas" placeholder="e.g., API Integration" />
        <ArrayInput label="Acceptance Criteria" field="acceptance_criteria" placeholder="e.g., API returns valid data" />
        <ArrayInput label="Success Metrics" field="success_metrics" placeholder="e.g., 99% uptime" />
        <ArrayInput label="Risks" field="risks" placeholder="e.g., API rate limits" />
      </div>

      {/* Flags */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Flags</h3>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_foundational || false}
              onChange={(e) => handleChange('is_foundational', e.target.checked)}
              className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-zinc-300">Foundational Task</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_critical_path || false}
              onChange={(e) => handleChange('is_critical_path', e.target.checked)}
              className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-zinc-300">Critical Path</span>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800 sticky bottom-0 bg-zinc-900">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {initialData ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
}
