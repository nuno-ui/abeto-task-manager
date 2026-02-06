'use client';

import { useState, useEffect } from 'react';
import { Button, Input, Select, Textarea } from '@/components/ui';
import { slugify } from '@/lib/utils';
import type { CreateProjectInput, Team, Pillar } from '@/types/database';

interface ProjectFormProps {
  initialData?: Partial<CreateProjectInput>;
  teams: Team[];
  pillars: Pillar[];
  onSubmit: (data: CreateProjectInput) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const statusOptions = [
  { value: 'idea', label: 'Idea' },
  { value: 'planning', label: 'Planning' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const priorityOptions = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const difficultyOptions = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

export function ProjectForm({
  initialData,
  teams,
  pillars,
  onSubmit,
  onCancel,
  loading,
}: ProjectFormProps) {
  const [formData, setFormData] = useState<CreateProjectInput>({
    title: '',
    slug: '',
    description: '',
    why_it_matters: '',
    pillar_id: '',
    category: '',
    status: 'idea',
    priority: 'medium',
    difficulty: 'medium',
    owner_team_id: '',
    estimated_hours_min: undefined,
    estimated_hours_max: undefined,
    start_date: '',
    target_date: '',
    prototype_url: '',
    notion_url: '',
    github_url: '',
    tags: [],
    ...initialData,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-generate slug from title
  useEffect(() => {
    if (!initialData?.slug && formData.title) {
      setFormData((prev) => ({
        ...prev,
        slug: slugify(formData.title),
      }));
    }
  }, [formData.title, initialData?.slug]);

  const handleChange = (field: keyof CreateProjectInput, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.slug?.trim()) {
      newErrors.slug = 'Slug is required';
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

  const pillarOptions = pillars.map((pillar) => ({
    value: pillar.id,
    label: pillar.name,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Basic Info</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            error={errors.title}
            placeholder="e.g., Unified Data Layer"
            required
          />
          <Input
            label="Slug"
            value={formData.slug}
            onChange={(e) => handleChange('slug', e.target.value)}
            error={errors.slug}
            placeholder="e.g., unified-data-layer"
            required
          />
        </div>
        <Textarea
          label="Description"
          value={formData.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="What is this project about?"
          rows={3}
        />
        <Textarea
          label="Why It Matters"
          value={formData.why_it_matters || ''}
          onChange={(e) => handleChange('why_it_matters', e.target.value)}
          placeholder="Why is this project important?"
          rows={2}
        />
      </div>

      {/* Classification */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Classification</h3>
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Pillar"
            options={pillarOptions}
            value={formData.pillar_id || ''}
            onChange={(e) => handleChange('pillar_id', e.target.value)}
            placeholder="Select pillar..."
          />
          <Select
            label="Owner Team"
            options={teamOptions}
            value={formData.owner_team_id || ''}
            onChange={(e) => handleChange('owner_team_id', e.target.value)}
            placeholder="Select team..."
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Select
            label="Status"
            options={statusOptions}
            value={formData.status || 'idea'}
            onChange={(e) => handleChange('status', e.target.value)}
          />
          <Select
            label="Priority"
            options={priorityOptions}
            value={formData.priority || 'medium'}
            onChange={(e) => handleChange('priority', e.target.value)}
          />
          <Select
            label="Difficulty"
            options={difficultyOptions}
            value={formData.difficulty || 'medium'}
            onChange={(e) => handleChange('difficulty', e.target.value)}
          />
        </div>
        <Input
          label="Category"
          value={formData.category || ''}
          onChange={(e) => handleChange('category', e.target.value)}
          placeholder="e.g., Data Infrastructure"
        />
      </div>

      {/* Estimates & Dates */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Estimates & Dates</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Est. Hours (Min)"
            type="number"
            value={formData.estimated_hours_min || ''}
            onChange={(e) => handleChange('estimated_hours_min', parseInt(e.target.value) || undefined)}
            placeholder="e.g., 40"
          />
          <Input
            label="Est. Hours (Max)"
            type="number"
            value={formData.estimated_hours_max || ''}
            onChange={(e) => handleChange('estimated_hours_max', parseInt(e.target.value) || undefined)}
            placeholder="e.g., 80"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Start Date"
            type="date"
            value={formData.start_date || ''}
            onChange={(e) => handleChange('start_date', e.target.value)}
          />
          <Input
            label="Target Date"
            type="date"
            value={formData.target_date || ''}
            onChange={(e) => handleChange('target_date', e.target.value)}
          />
        </div>
      </div>

      {/* Links */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Links</h3>
        <div className="grid grid-cols-1 gap-4">
          <Input
            label="Demo / Document Link"
            type="url"
            value={formData.demo_link || ''}
            onChange={(e) => handleChange('demo_link', e.target.value)}
            placeholder="https://... (Notion, Google Docs, demo URL, etc.)"
          />
          <Input
            label="Prototype URL"
            type="url"
            value={formData.prototype_url || ''}
            onChange={(e) => handleChange('prototype_url', e.target.value)}
            placeholder="https://..."
          />
          <Input
            label="Notion URL"
            type="url"
            value={formData.notion_url || ''}
            onChange={(e) => handleChange('notion_url', e.target.value)}
            placeholder="https://notion.so/..."
          />
          <Input
            label="GitHub URL"
            type="url"
            value={formData.github_url || ''}
            onChange={(e) => handleChange('github_url', e.target.value)}
            placeholder="https://github.com/..."
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {initialData ? 'Update Project' : 'Create Project'}
        </Button>
      </div>
    </form>
  );
}
