'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { TaskCard } from '@/components/tasks/TaskCard';
import { Badge } from '@/components/ui';

interface Task {
  id: string;
  title: string;
  description: string | null;
  phase: string;
  status: string;
  difficulty: string;
  ai_potential: string | null;
  ai_assist_description: string | null;
  tools_needed: string[] | null;
  knowledge_areas: string[] | null;
  acceptance_criteria: string[] | null;
  success_metrics: string[] | null;
  risks: string[] | null;
  is_foundational: boolean;
  is_critical_path: boolean;
  estimated_hours: string | null;
  order_index: number;
  owner_team: { name: string; color: string } | null;
  project: { title: string; slug: string } | null;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [phaseFilter, setPhaseFilter] = useState('all');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const phases = ['discovery', 'planning', 'development', 'testing', 'training', 'rollout', 'monitoring'];
  const filteredTasks = phaseFilter === 'all' ? tasks : tasks.filter(t => t.phase === phaseFilter);

  // Group tasks by phase
  const tasksByPhase = phases.reduce((acc, phase) => {
    acc[phase] = filteredTasks.filter(t => t.phase === phase);
    return acc;
  }, {} as Record<string, Task[]>);

  return (
    <div className="min-h-screen">
      <Header title="All Tasks" />

      <div className="p-6 space-y-6">
        {/* Filters */}
        <div className="flex items-center gap-4">
          <select
            value={phaseFilter}
            onChange={(e) => setPhaseFilter(e.target.value)}
            className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white"
          >
            <option value="all">All Phases</option>
            {phases.map(phase => (
              <option key={phase} value={phase}>
                {phase.charAt(0).toUpperCase() + phase.slice(1)}
              </option>
            ))}
          </select>
          <p className="text-sm text-zinc-500">{filteredTasks.length} tasks</p>
        </div>

        {/* Tasks */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-24 bg-zinc-900 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900 border border-zinc-800 rounded-xl">
            <p className="text-zinc-500">No tasks found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {phases.map(phase => {
              const phaseTasks = tasksByPhase[phase];
              if (phaseTasks.length === 0) return null;

              return (
                <div key={phase}>
                  <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Badge variant="phase" value={phase}>
                      {phase}
                    </Badge>
                    <span className="text-zinc-600">({phaseTasks.length})</span>
                  </h3>
                  <div className="grid gap-3">
                    {phaseTasks.map(task => (
                      <TaskCard
                        key={task.id}
                        task={task as any}
                        showProject
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
