'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, Search, Filter, LayoutGrid, List, Sparkles, RefreshCw, Lightbulb, ChevronDown, ChevronUp, ArrowUpDown } from 'lucide-react';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { AIProjectCreator } from '@/components/projects/AIProjectCreator';
import { Button, Modal, Select, Input } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { slugify } from '@/lib/utils';
import type { Project, Team, Pillar, CreateProjectInput } from '@/types/database';

function ProjectsPageContent() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAICreator, setShowAICreator] = useState(false);
  const [creating, setCreating] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [pillarFilter, setPillarFilter] = useState('all');
  const [showPredicted, setShowPredicted] = useState(true);
  const [refreshingPredicted, setRefreshingPredicted] = useState(false);
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'title' | 'priority' | 'progress'>('updated');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchData();
  }, []);

  // Handle URL params for create/ai modals
  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setShowCreateModal(true);
    }
    if (searchParams.get('ai') === 'true') {
      setShowAICreator(true);
    }
  }, [searchParams]);

  const fetchData = async () => {
    setLoading(true);

    try {
      // Use API route to bypass RLS
      const response = await fetch('/api/projects');

      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const projectsData = await response.json();
      setProjects(projectsData);

      // Fetch teams from the API
      const teamsResponse = await fetch('/api/teams');
      if (teamsResponse.ok) {
        const teamsData = await teamsResponse.json();
        setTeams(teamsData);
      }

      // Fetch pillars from the API
      const pillarsResponse = await fetch('/api/pillars');
      if (pillarsResponse.ok) {
        const pillarsData = await pillarsResponse.json();
        setPillars(pillarsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (data: CreateProjectInput) => {
    const supabase = createClient();
    setCreating(true);

    try {
      const slug = data.slug || slugify(data.title);

      const { error } = await supabase.from('projects').insert({
        ...data,
        slug,
      });

      if (error) throw error;

      setShowCreateModal(false);
      fetchData();
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  // Filter projects - separate regular and predicted
  const allFilteredProjects = projects.filter((project) => {
    if (searchQuery && !project.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (statusFilter !== 'all' && project.status !== statusFilter) {
      return false;
    }
    if (priorityFilter !== 'all' && project.priority !== priorityFilter) {
      return false;
    }
    if (pillarFilter !== 'all' && project.pillar_id !== pillarFilter) {
      return false;
    }
    return true;
  });

  // Sort function
  const sortProjects = (projectList: Project[]) => {
    return [...projectList].sort((a, b) => {
      let comparison = 0;
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };

      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'created':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'updated':
          comparison = new Date(a.updated_at || a.created_at).getTime() - new Date(b.updated_at || b.created_at).getTime();
          break;
        case 'priority':
          comparison = (priorityOrder[a.priority as keyof typeof priorityOrder] || 0) -
                       (priorityOrder[b.priority as keyof typeof priorityOrder] || 0);
          break;
        case 'progress':
          comparison = (a.progress_percentage || 0) - (b.progress_percentage || 0);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  };

  // Separate regular projects from predicted projects and sort
  const filteredProjects = sortProjects(allFilteredProjects.filter(p => !p.is_predicted));
  const predictedProjects = sortProjects(allFilteredProjects.filter(p => p.is_predicted));

  const sortOptions = [
    { value: 'updated', label: 'Last Updated' },
    { value: 'created', label: 'Date Created' },
    { value: 'title', label: 'Title' },
    { value: 'priority', label: 'Priority' },
    { value: 'progress', label: 'Progress' },
  ];

  // Handle refresh predicted projects (placeholder for AI regeneration)
  const handleRefreshPredicted = async () => {
    setRefreshingPredicted(true);
    // In the future, this could call an AI endpoint to regenerate predicted projects
    // For now, just refresh the data
    await fetchData();
    setRefreshingPredicted(false);
  };

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'idea', label: 'Idea' },
    { value: 'planning', label: 'Planning' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'completed', label: 'Completed' },
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'critical', label: 'Critical' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];

  const pillarOptions = [
    { value: 'all', label: 'All Pillars' },
    ...pillars.map((p) => ({ value: p.id, label: p.name })),
  ];

  return (
    <div className="min-h-screen">
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Projects</h1>
            <p className="text-sm text-zinc-400 mt-1">
              Manage and track all your automation initiatives
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="w-4 h-4" />
              New Project
            </Button>
            <Button
              onClick={() => setShowAICreator(true)}
              className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500"
            >
              <Sparkles className="w-4 h-4" />
              Create with AI
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {priorityOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <select
              value={pillarFilter}
              onChange={(e) => setPillarFilter(e.target.value)}
              className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {pillarOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Sort dropdown */}
            <div className="flex items-center gap-1 border-l border-zinc-700 pl-2 ml-2">
              <ArrowUpDown className="w-4 h-4 text-zinc-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-2 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 rounded-lg transition-colors"
                title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              >
                {sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-zinc-500">
          {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
          {predictedProjects.length > 0 && ` + ${predictedProjects.length} AI suggested`}
        </p>

        {/* Projects Grid/List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-zinc-900 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredProjects.length === 0 && predictedProjects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-500 mb-4">No projects found</p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4" />
              Create your first project
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Regular Projects */}
            {filteredProjects.length > 0 && (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                    : 'space-y-3'
                }
              >
                {filteredProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}

            {/* AI Predicted Projects Section */}
            {predictedProjects.length > 0 && (
              <div className="border-t border-zinc-800 pt-8">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setShowPredicted(!showPredicted)}
                    className="flex items-center gap-3 text-left group"
                  >
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-violet-900/30 rounded-lg">
                      <Lightbulb className="w-4 h-4 text-violet-400" />
                      <span className="text-sm font-medium text-violet-300">
                        AI Suggested Projects
                      </span>
                      <span className="text-xs text-violet-400 bg-violet-900/50 px-2 py-0.5 rounded-full">
                        {predictedProjects.length}
                      </span>
                    </div>
                    {showPredicted ? (
                      <ChevronUp className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
                    )}
                  </button>
                  <button
                    onClick={handleRefreshPredicted}
                    disabled={refreshingPredicted}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50"
                    title="Refresh AI suggestions"
                  >
                    <RefreshCw className={`w-4 h-4 ${refreshingPredicted ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Refresh Suggestions</span>
                  </button>
                </div>

                {showPredicted && (
                  <>
                    <p className="text-sm text-zinc-500 mb-4">
                      These projects are AI-predicted based on your business context and industry trends.
                      Review and promote them to active projects when ready.
                    </p>
                    <div
                      className={
                        viewMode === 'grid'
                          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                          : 'space-y-3'
                      }
                    >
                      {predictedProjects.map((project) => (
                        <div key={project.id} className="relative">
                          <div className="absolute -top-2 -right-2 z-10">
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-violet-600 text-white text-xs rounded-full shadow-lg">
                              <Sparkles className="w-3 h-3" />
                              AI
                            </span>
                          </div>
                          <ProjectCard project={project} />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Project"
        size="lg"
      >
        <ProjectForm
          teams={teams}
          pillars={pillars}
          onSubmit={handleCreateProject}
          onCancel={() => setShowCreateModal(false)}
          loading={creating}
        />
      </Modal>

      {/* AI Project Creator */}
      <AIProjectCreator
        isOpen={showAICreator}
        onClose={() => setShowAICreator(false)}
        onProjectCreated={fetchData}
      />
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-zinc-800 rounded-lg w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-zinc-800 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    }>
      <ProjectsPageContent />
    </Suspense>
  );
}
