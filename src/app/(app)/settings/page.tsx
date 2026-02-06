'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import {
  Settings,
  Database,
  Layers,
  Users,
  FolderKanban,
  CheckSquare,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  AlertTriangle,
  RefreshCw,
  Palette,
  FileText,
  BarChart3,
  Zap,
  Activity,
  Heart,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  Clock,
  Server,
  Code,
  Terminal,
  MessageSquare,
  Bug,
  Slack,
  Send,
  Loader2,
  CheckCircle,
  Bot,
  Bell,
} from 'lucide-react';

interface Pillar {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  icon: string | null;
  order_index: number;
}

interface Stats {
  teams: number;
  users: number;
  projects: number;
  tasks: number;
}

interface HealthData {
  status: 'healthy' | 'error';
  database: {
    connected: boolean;
    responseTimeMs: number;
    error: string | null;
  };
  tableStats: Array<{ table: string; count: number }>;
  totalRecords: number;
  missingData: {
    projectsWithoutPillar: number;
    projectsWithoutPillarList: Array<{ id: string; title: string }>;
    tasksWithoutOwner: number;
    tasksWithoutOwnerList: Array<{ id: string; title: string }>;
    projectsWithoutTeam: number;
    projectsWithoutTeamList: Array<{ id: string; title: string }>;
  };
  reviewStats: {
    totalProjects: number;
    fullyReviewed: number;
    partiallyReviewed: number;
    notReviewed: number;
  };
  supabaseUrl: string;
  supabaseAnonKey: string | null;
  supabaseProjectRef: string | null;
  developerLinks: {
    supabaseDashboard: string | null;
    supabaseTableEditor: string | null;
    supabaseSqlEditor: string | null;
    supabaseApiDocs: string | null;
    supabaseLogs: string | null;
    supabaseAuth: string | null;
    supabaseStorage: string | null;
    apiDocsApp: string;
    vercelDashboard: string;
    githubRepo: string;
  };
  environment: {
    nodeEnv: string;
    vercelEnv: string;
    region: string;
  };
  timestamp: string;
}

type SectionType = 'health' | 'bugs' | 'slack' | 'pillars' | 'data-quality' | 'developer' | 'about';

function SettingsPageContent() {
  const searchParams = useSearchParams();
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [stats, setStats] = useState<Stats>({ teams: 0, users: 0, projects: 0, tasks: 0 });
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<SectionType>('health');

  // Handle URL tab parameter
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['health', 'bugs', 'slack', 'pillars', 'data-quality', 'developer', 'about'].includes(tab)) {
      setActiveSection(tab as SectionType);
    }
  }, [searchParams]);

  // Bug report state
  const [bugTitle, setBugTitle] = useState('');
  const [bugDescription, setBugDescription] = useState('');
  const [bugPriority, setBugPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [bugCategory, setBugCategory] = useState<'ui' | 'functionality' | 'performance' | 'data' | 'other'>('functionality');
  const [submittingBug, setSubmittingBug] = useState(false);
  const [bugSubmitted, setBugSubmitted] = useState(false);

  // Health data
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [lastHealthCheck, setLastHealthCheck] = useState<Date | null>(null);

  // Pillar management
  const [showAddPillar, setShowAddPillar] = useState(false);
  const [editingPillar, setEditingPillar] = useState<string | null>(null);
  const [newPillar, setNewPillar] = useState({ name: '', description: '', color: '#6366f1' });
  const [editPillar, setEditPillar] = useState({ name: '', description: '', color: '' });
  const [saving, setSaving] = useState(false);

  // Copy state for developer tools
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
    fetchHealth();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setPillars(data.pillars || []);
        setStats(data.stats || { teams: 0, users: 0, projects: 0, tasks: 0 });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHealth = async () => {
    setHealthLoading(true);
    try {
      const response = await fetch('/api/health');
      if (response.ok) {
        const data = await response.json();
        setHealthData(data);
        setLastHealthCheck(new Date());
      }
    } catch (error) {
      console.error('Error fetching health:', error);
    } finally {
      setHealthLoading(false);
    }
  };

  const handleCreatePillar = async () => {
    if (!newPillar.name.trim()) return;
    setSaving(true);
    try {
      const response = await fetch('/api/pillars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPillar),
      });
      if (response.ok) {
        await fetchSettings();
        setShowAddPillar(false);
        setNewPillar({ name: '', description: '', color: '#6366f1' });
      }
    } catch (error) {
      console.error('Error creating pillar:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePillar = async (id: string) => {
    if (!editPillar.name.trim()) return;
    setSaving(true);
    try {
      const response = await fetch('/api/pillars', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...editPillar }),
      });
      if (response.ok) {
        await fetchSettings();
        setEditingPillar(null);
      }
    } catch (error) {
      console.error('Error updating pillar:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePillar = async (id: string) => {
    if (!window.confirm('Delete this pillar? Projects will be unassigned.')) return;
    try {
      const response = await fetch(`/api/pillars?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        await fetchSettings();
      }
    } catch (error) {
      console.error('Error deleting pillar:', error);
    }
  };

  const startEditPillar = (pillar: Pillar) => {
    setEditingPillar(pillar.id);
    setEditPillar({
      name: pillar.name,
      description: pillar.description || '',
      color: pillar.color,
    });
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const getSupabaseDashboardUrl = () => {
    if (!healthData?.supabaseUrl) return null;
    // Extract project ref from URL: https://xxx.supabase.co -> xxx
    const match = healthData.supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
    if (match) {
      return `https://supabase.com/dashboard/project/${match[1]}`;
    }
    return null;
  };

  const handleBugSubmit = async () => {
    if (!bugTitle.trim() || !bugDescription.trim()) return;

    setSubmittingBug(true);
    try {
      // For now, we'll create a GitHub issue via the API or store in Supabase
      // This is a placeholder - you can implement the actual submission later
      const response = await fetch('/api/bugs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: bugTitle,
          description: bugDescription,
          priority: bugPriority,
          category: bugCategory,
        }),
      });

      if (response.ok) {
        setBugSubmitted(true);
        setBugTitle('');
        setBugDescription('');
        setBugPriority('medium');
        setBugCategory('functionality');
        setTimeout(() => setBugSubmitted(false), 5000);
      }
    } catch (error) {
      console.error('Error submitting bug:', error);
    } finally {
      setSubmittingBug(false);
    }
  };

  const sections = [
    { id: 'health', label: 'System Health', icon: Heart, description: 'API and database status' },
    { id: 'bugs', label: 'Report Bug', icon: Bug, description: 'Report issues and feedback' },
    { id: 'slack', label: 'Slack Integration', icon: Slack, description: 'Connect your workspace' },
    { id: 'pillars', label: 'Pillars', icon: Layers, description: 'Strategic pillars management' },
    { id: 'data-quality', label: 'Data Quality', icon: AlertCircle, description: 'Missing data and issues' },
    { id: 'developer', label: 'Developer Tools', icon: Code, description: 'Supabase access and queries' },
    { id: 'about', label: 'About', icon: FileText, description: 'Application information' },
  ] as const;

  const totalDataIssues = healthData ?
    (healthData.missingData.projectsWithoutPillar +
     healthData.missingData.tasksWithoutOwner +
     healthData.missingData.projectsWithoutTeam) : 0;

  return (
    <div className="min-h-screen">
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <h3 className="text-sm font-medium text-zinc-400 mb-3">Configuration</h3>
              <nav className="space-y-1">
                {sections.map(section => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-600/20 text-blue-400'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    <section.icon className="w-4 h-4" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{section.label}</p>
                    </div>
                    {section.id === 'data-quality' && totalDataIssues > 0 && (
                      <span className="px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded-full">
                        {totalDataIssues}
                      </span>
                    )}
                  </button>
                ))}
              </nav>

              {/* Quick Stats */}
              <div className="mt-6 pt-6 border-t border-zinc-800">
                <h3 className="text-sm font-medium text-zinc-400 mb-3">Quick Stats</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500 flex items-center gap-2">
                      <Users className="w-4 h-4" /> Teams
                    </span>
                    <span className="text-white">{stats.teams}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500 flex items-center gap-2">
                      <Users className="w-4 h-4" /> Users
                    </span>
                    <span className="text-white">{stats.users}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500 flex items-center gap-2">
                      <FolderKanban className="w-4 h-4" /> Projects
                    </span>
                    <span className="text-white">{stats.projects}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500 flex items-center gap-2">
                      <CheckSquare className="w-4 h-4" /> Tasks
                    </span>
                    <span className="text-white">{stats.tasks}</span>
                  </div>
                </div>
              </div>

              {/* Last Health Check */}
              {lastHealthCheck && (
                <div className="mt-4 pt-4 border-t border-zinc-800">
                  <p className="text-xs text-zinc-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Last check: {lastHealthCheck.toLocaleTimeString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
                <div className="animate-pulse space-y-4">
                  <div className="h-8 bg-zinc-800 rounded w-1/3" />
                  <div className="h-4 bg-zinc-800 rounded w-2/3" />
                  <div className="h-32 bg-zinc-800 rounded" />
                </div>
              </div>
            ) : (
              <>
                {/* System Health Section */}
                {activeSection === 'health' && (
                  <div className="space-y-6">
                    {/* Health Overview Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className={`bg-zinc-900 border rounded-xl p-4 ${
                        healthData?.database.connected ? 'border-green-500/30' : 'border-red-500/30'
                      }`}>
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded-lg ${
                            healthData?.database.connected ? 'bg-green-500/20' : 'bg-red-500/20'
                          }`}>
                            <Database className={`w-5 h-5 ${
                              healthData?.database.connected ? 'text-green-400' : 'text-red-400'
                            }`} />
                          </div>
                          <span className="text-sm text-zinc-400">Database</span>
                        </div>
                        <p className={`text-lg font-semibold ${
                          healthData?.database.connected ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {healthData?.database.connected ? 'Connected' : 'Error'}
                        </p>
                      </div>

                      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Clock className="w-5 h-5 text-blue-400" />
                          </div>
                          <span className="text-sm text-zinc-400">Response</span>
                        </div>
                        <p className="text-lg font-semibold text-white">
                          {healthData?.database.responseTimeMs || 0}ms
                        </p>
                      </div>

                      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-purple-500/20 rounded-lg">
                            <Server className="w-5 h-5 text-purple-400" />
                          </div>
                          <span className="text-sm text-zinc-400">API</span>
                        </div>
                        <p className="text-lg font-semibold text-green-400">Online</p>
                      </div>

                      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-orange-500/20 rounded-lg">
                            <BarChart3 className="w-5 h-5 text-orange-400" />
                          </div>
                          <span className="text-sm text-zinc-400">Records</span>
                        </div>
                        <p className="text-lg font-semibold text-white">
                          {healthData?.totalRecords?.toLocaleString() || 0}
                        </p>
                      </div>
                    </div>

                    {/* Table Statistics */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h2 className="text-xl font-semibold text-white">Table Statistics</h2>
                          <p className="text-sm text-zinc-400 mt-1">
                            Record counts by table
                          </p>
                        </div>
                        <button
                          onClick={fetchHealth}
                          disabled={healthLoading}
                          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors disabled:opacity-50"
                        >
                          <RefreshCw className={`w-4 h-4 ${healthLoading ? 'animate-spin' : ''}`} />
                          Refresh
                        </button>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {healthData?.tableStats.map(({ table, count }) => (
                          <div key={table} className="bg-zinc-800/50 rounded-lg p-4">
                            <p className="text-sm text-zinc-400 capitalize">{table}</p>
                            <p className="text-2xl font-bold text-white">{count.toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Review Status Overview */}
                    {healthData?.reviewStats && (
                      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Review Status Overview</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-zinc-800/50 rounded-lg p-4">
                            <p className="text-sm text-zinc-400">Total Projects</p>
                            <p className="text-2xl font-bold text-white">{healthData.reviewStats.totalProjects}</p>
                          </div>
                          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                            <p className="text-sm text-green-400">Fully Reviewed</p>
                            <p className="text-2xl font-bold text-green-400">{healthData.reviewStats.fullyReviewed}</p>
                          </div>
                          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                            <p className="text-sm text-yellow-400">Partially Reviewed</p>
                            <p className="text-2xl font-bold text-yellow-400">{healthData.reviewStats.partiallyReviewed}</p>
                          </div>
                          <div className="bg-zinc-800/50 rounded-lg p-4">
                            <p className="text-sm text-zinc-400">Not Reviewed</p>
                            <p className="text-2xl font-bold text-zinc-400">{healthData.reviewStats.notReviewed}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Bug Report Section */}
                {activeSection === 'bugs' && (
                  <div className="space-y-6">
                    {/* Bug Report Form */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-red-500/20 rounded-lg">
                          <Bug className="w-6 h-6 text-red-400" />
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-white">Report a Bug</h2>
                          <p className="text-sm text-zinc-400">
                            Help us improve Abeto by reporting issues you encounter
                          </p>
                        </div>
                      </div>

                      {bugSubmitted ? (
                        <div className="p-6 bg-green-500/10 border border-green-500/30 rounded-xl text-center">
                          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-green-400 mb-2">Bug Report Submitted!</h3>
                          <p className="text-sm text-zinc-400">
                            Thank you for helping us improve Abeto. We&apos;ll look into this issue.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Bug Title */}
                          <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                              Bug Title <span className="text-red-400">*</span>
                            </label>
                            <input
                              type="text"
                              value={bugTitle}
                              onChange={(e) => setBugTitle(e.target.value)}
                              placeholder="Brief description of the issue"
                              className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50"
                            />
                          </div>

                          {/* Category and Priority */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Category
                              </label>
                              <select
                                value={bugCategory}
                                onChange={(e) => setBugCategory(e.target.value as typeof bugCategory)}
                                className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50"
                              >
                                <option value="ui">UI / Visual</option>
                                <option value="functionality">Functionality</option>
                                <option value="performance">Performance</option>
                                <option value="data">Data / Sync</option>
                                <option value="other">Other</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Priority
                              </label>
                              <select
                                value={bugPriority}
                                onChange={(e) => setBugPriority(e.target.value as typeof bugPriority)}
                                className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50"
                              >
                                <option value="low">Low - Minor inconvenience</option>
                                <option value="medium">Medium - Affects workflow</option>
                                <option value="high">High - Blocking issue</option>
                              </select>
                            </div>
                          </div>

                          {/* Bug Description */}
                          <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                              Description <span className="text-red-400">*</span>
                            </label>
                            <textarea
                              value={bugDescription}
                              onChange={(e) => setBugDescription(e.target.value)}
                              placeholder="Please describe the issue in detail. Include steps to reproduce if possible."
                              rows={5}
                              className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 resize-none"
                            />
                          </div>

                          {/* Tips */}
                          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                            <h4 className="text-sm font-medium text-amber-400 mb-2">💡 Tips for a great bug report:</h4>
                            <ul className="text-xs text-zinc-400 space-y-1">
                              <li>• Include the steps to reproduce the issue</li>
                              <li>• Mention what you expected vs what happened</li>
                              <li>• Include the URL or page where the issue occurred</li>
                              <li>• Note your browser (Chrome, Firefox, Safari, etc.)</li>
                            </ul>
                          </div>

                          {/* Submit Button */}
                          <div className="flex justify-end">
                            <button
                              onClick={handleBugSubmit}
                              disabled={submittingBug || !bugTitle.trim() || !bugDescription.trim()}
                              className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {submittingBug ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Submitting...
                                </>
                              ) : (
                                <>
                                  <Send className="w-4 h-4" />
                                  Submit Bug Report
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* GitHub Issues Link */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-zinc-700/50 rounded-lg">
                          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-white">View All Issues on GitHub</h3>
                          <p className="text-sm text-zinc-400">Track the status of reported bugs and feature requests</p>
                        </div>
                        <a
                          href="https://github.com/nunomfelix/abeto-task-manager/issues"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Open Issues
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Slack Integration Section */}
                {activeSection === 'slack' && (
                  <div className="space-y-6">
                    {/* Slack Overview */}
                    <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-xl p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-purple-500/20 rounded-lg">
                          <Slack className="w-8 h-8 text-purple-400" />
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-white">Slack Integration</h2>
                          <p className="text-sm text-zinc-400">
                            Connect Abeto to your Slack workspace for real-time notifications
                          </p>
                        </div>
                      </div>
                      <p className="text-zinc-300 text-sm leading-relaxed">
                        Get notified when projects are created, tasks are assigned, reviews are needed, and more.
                        The AI Companion can also send you personalized alerts and summaries directly in Slack.
                      </p>
                    </div>

                    {/* Setup Steps */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <Settings className="w-5 h-5 text-amber-400" />
                        Setup Guide
                      </h3>

                      <div className="space-y-6">
                        {/* Step 1 */}
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-semibold text-sm">
                            1
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-white mb-2">Create a Slack App</h4>
                            <p className="text-sm text-zinc-400 mb-3">
                              Go to the Slack API portal and create a new app for your workspace.
                            </p>
                            <a
                              href="https://api.slack.com/apps"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-sm text-white rounded-lg transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Open Slack API Portal
                            </a>
                          </div>
                        </div>

                        {/* Step 2 */}
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-semibold text-sm">
                            2
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-white mb-2">Configure Bot Permissions</h4>
                            <p className="text-sm text-zinc-400 mb-3">
                              Add the following OAuth scopes to your bot:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {['chat:write', 'users:read', 'users:read.email', 'channels:read', 'app_mentions:read'].map((scope) => (
                                <span key={scope} className="px-2 py-1 bg-zinc-800 text-xs font-mono text-zinc-300 rounded">
                                  {scope}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Step 3 */}
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-semibold text-sm">
                            3
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-white mb-2">Set Environment Variables</h4>
                            <p className="text-sm text-zinc-400 mb-3">
                              Add these environment variables to your Vercel deployment:
                            </p>
                            <div className="bg-zinc-800/50 rounded-lg p-4 space-y-2">
                              <div className="flex items-center justify-between">
                                <code className="text-xs text-amber-400">SLACK_BOT_TOKEN</code>
                                <span className="text-xs text-zinc-500">xoxb-...</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <code className="text-xs text-amber-400">SLACK_SIGNING_SECRET</code>
                                <span className="text-xs text-zinc-500">From app settings</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <code className="text-xs text-amber-400">SLACK_CHANNEL_ID</code>
                                <span className="text-xs text-zinc-500">C0123456789</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Step 4 */}
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-semibold text-sm">
                            4
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-white mb-2">Configure Webhook URL</h4>
                            <p className="text-sm text-zinc-400 mb-3">
                              Set up Event Subscriptions with this Request URL:
                            </p>
                            <div className="flex items-center gap-2">
                              <code className="flex-1 px-3 py-2 bg-zinc-800/50 rounded-lg text-xs text-zinc-300 font-mono">
                                https://your-domain.vercel.app/api/webhooks/slack
                              </code>
                              <button
                                onClick={() => copyToClipboard('https://abeto-task-manager.vercel.app/api/webhooks/slack', 'slack-webhook')}
                                className="p-2 text-zinc-400 hover:text-white transition-colors"
                              >
                                {copied === 'slack-webhook' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Step 5 */}
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-400 font-semibold text-sm">
                            ✓
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-white mb-2">Install to Workspace</h4>
                            <p className="text-sm text-zinc-400">
                              Install the app to your Slack workspace and invite the bot to your preferred channel.
                              You&apos;re all set!
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* AI Companion Settings Preview */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-amber-500/20 rounded-lg">
                          <Bot className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                          <h3 className="font-medium text-white">AI Companion Notifications</h3>
                          <p className="text-sm text-zinc-400">Coming soon - personalize your alerts</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-zinc-800/50 rounded-lg opacity-60">
                          <div className="flex items-center gap-3 mb-2">
                            <Bell className="w-4 h-4 text-blue-400" />
                            <span className="text-sm font-medium text-zinc-300">Daily Summary</span>
                          </div>
                          <p className="text-xs text-zinc-500">Get a morning digest of your tasks and priorities</p>
                        </div>
                        <div className="p-4 bg-zinc-800/50 rounded-lg opacity-60">
                          <div className="flex items-center gap-3 mb-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-400" />
                            <span className="text-sm font-medium text-zinc-300">Deadline Alerts</span>
                          </div>
                          <p className="text-xs text-zinc-500">Reminders when deadlines are approaching</p>
                        </div>
                        <div className="p-4 bg-zinc-800/50 rounded-lg opacity-60">
                          <div className="flex items-center gap-3 mb-2">
                            <CheckSquare className="w-4 h-4 text-green-400" />
                            <span className="text-sm font-medium text-zinc-300">Task Assignments</span>
                          </div>
                          <p className="text-xs text-zinc-500">Notify when you&apos;re assigned new tasks</p>
                        </div>
                        <div className="p-4 bg-zinc-800/50 rounded-lg opacity-60">
                          <div className="flex items-center gap-3 mb-2">
                            <BarChart3 className="w-4 h-4 text-purple-400" />
                            <span className="text-sm font-medium text-zinc-300">Weekly Reports</span>
                          </div>
                          <p className="text-xs text-zinc-500">Automated progress reports every week</p>
                        </div>
                      </div>

                      <p className="text-xs text-zinc-500 mt-4 text-center">
                        These settings will be available in a future update
                      </p>
                    </div>
                  </div>
                )}

                {/* Pillars Section */}
                {activeSection === 'pillars' && (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl">
                    <div className="p-6 border-b border-zinc-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-xl font-semibold text-white">Strategic Pillars</h2>
                          <p className="text-sm text-zinc-400 mt-1">
                            Pillars help organize projects into strategic categories for better alignment
                          </p>
                        </div>
                        <button
                          onClick={() => setShowAddPillar(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Add Pillar
                        </button>
                      </div>
                    </div>

                    <div className="p-6">
                      {pillars.length === 0 ? (
                        <div className="text-center py-8">
                          <Layers className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                          <p className="text-zinc-400">No pillars defined yet</p>
                          <button
                            onClick={() => setShowAddPillar(true)}
                            className="mt-4 text-blue-400 hover:text-blue-300"
                          >
                            Create your first pillar
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {pillars.map(pillar => (
                            <div
                              key={pillar.id}
                              className="flex items-center gap-4 p-4 bg-zinc-800/50 rounded-lg"
                            >
                              {editingPillar === pillar.id ? (
                                <>
                                  <input
                                    type="color"
                                    value={editPillar.color}
                                    onChange={(e) => setEditPillar({ ...editPillar, color: e.target.value })}
                                    className="w-10 h-10 rounded cursor-pointer"
                                  />
                                  <div className="flex-1 space-y-2">
                                    <input
                                      type="text"
                                      value={editPillar.name}
                                      onChange={(e) => setEditPillar({ ...editPillar, name: e.target.value })}
                                      className="w-full px-3 py-1.5 bg-zinc-700 border border-zinc-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                                      placeholder="Pillar name"
                                    />
                                    <input
                                      type="text"
                                      value={editPillar.description}
                                      onChange={(e) => setEditPillar({ ...editPillar, description: e.target.value })}
                                      className="w-full px-3 py-1.5 bg-zinc-700 border border-zinc-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                                      placeholder="Description (optional)"
                                    />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleUpdatePillar(pillar.id)}
                                      disabled={saving}
                                      className="p-2 text-green-400 hover:bg-green-400/10 rounded transition-colors"
                                    >
                                      <Save className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => setEditingPillar(null)}
                                      className="p-2 text-zinc-400 hover:text-white transition-colors"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                                    style={{ backgroundColor: pillar.color + '20' }}
                                  >
                                    <Layers className="w-5 h-5" style={{ color: pillar.color }} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-medium text-white">{pillar.name}</h4>
                                      <span className="text-xs text-zinc-500">({pillar.slug})</span>
                                    </div>
                                    {pillar.description && (
                                      <p className="text-sm text-zinc-400 truncate">{pillar.description}</p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => startEditPillar(pillar)}
                                      className="p-2 text-zinc-400 hover:text-white transition-colors"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeletePillar(pillar.id)}
                                      className="p-2 text-zinc-400 hover:text-red-400 transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Add Pillar Form */}
                    {showAddPillar && (
                      <div className="p-6 border-t border-zinc-800 bg-zinc-800/30">
                        <h3 className="text-sm font-medium text-white mb-4">New Pillar</h3>
                        <div className="space-y-4">
                          <div className="flex gap-4">
                            <div>
                              <label className="block text-xs text-zinc-400 mb-1">Color</label>
                              <input
                                type="color"
                                value={newPillar.color}
                                onChange={(e) => setNewPillar({ ...newPillar, color: e.target.value })}
                                className="w-12 h-12 rounded cursor-pointer"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="block text-xs text-zinc-400 mb-1">Name</label>
                              <input
                                type="text"
                                value={newPillar.name}
                                onChange={(e) => setNewPillar({ ...newPillar, name: e.target.value })}
                                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                placeholder="e.g., Customer Experience"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs text-zinc-400 mb-1">Description</label>
                            <input
                              type="text"
                              value={newPillar.description}
                              onChange={(e) => setNewPillar({ ...newPillar, description: e.target.value })}
                              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                              placeholder="Brief description of this pillar"
                            />
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={() => {
                                setShowAddPillar(false);
                                setNewPillar({ name: '', description: '', color: '#6366f1' });
                              }}
                              className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleCreatePillar}
                              disabled={saving || !newPillar.name.trim()}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                              {saving ? 'Creating...' : 'Create Pillar'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Data Quality Section */}
                {activeSection === 'data-quality' && (
                  <div className="space-y-6">
                    {/* Summary Banner */}
                    <div className={`p-4 rounded-xl border ${
                      totalDataIssues === 0
                        ? 'bg-green-500/10 border-green-500/30'
                        : 'bg-yellow-500/10 border-yellow-500/30'
                    }`}>
                      <div className="flex items-center gap-3">
                        {totalDataIssues === 0 ? (
                          <Check className="w-6 h-6 text-green-400" />
                        ) : (
                          <AlertTriangle className="w-6 h-6 text-yellow-400" />
                        )}
                        <div>
                          <p className={`font-medium ${totalDataIssues === 0 ? 'text-green-400' : 'text-yellow-400'}`}>
                            {totalDataIssues === 0
                              ? 'All data looks good!'
                              : `${totalDataIssues} data issue${totalDataIssues !== 1 ? 's' : ''} found`}
                          </p>
                          <p className="text-sm text-zinc-400">
                            {totalDataIssues === 0
                              ? 'No missing or orphaned data detected'
                              : 'Review the issues below and fix them in your database'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Projects without Pillar */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`p-2 rounded-lg ${
                          healthData?.missingData.projectsWithoutPillar === 0
                            ? 'bg-green-500/20'
                            : 'bg-yellow-500/20'
                        }`}>
                          <FolderKanban className={`w-5 h-5 ${
                            healthData?.missingData.projectsWithoutPillar === 0
                              ? 'text-green-400'
                              : 'text-yellow-400'
                          }`} />
                        </div>
                        <div>
                          <h3 className="font-medium text-white">Projects without Pillar</h3>
                          <p className="text-sm text-zinc-400">
                            {healthData?.missingData.projectsWithoutPillar || 0} project(s) missing pillar assignment
                          </p>
                        </div>
                      </div>
                      {healthData?.missingData.projectsWithoutPillarList &&
                       healthData.missingData.projectsWithoutPillarList.length > 0 && (
                        <div className="space-y-2">
                          {healthData.missingData.projectsWithoutPillarList.map(p => (
                            <div key={p.id} className="flex items-center gap-2 p-2 bg-zinc-800/50 rounded-lg text-sm">
                              <span className="text-zinc-400 font-mono text-xs">{p.id.slice(0, 8)}...</span>
                              <span className="text-white">{p.title}</span>
                            </div>
                          ))}
                          {healthData.missingData.projectsWithoutPillar > 5 && (
                            <p className="text-xs text-zinc-500">
                              and {healthData.missingData.projectsWithoutPillar - 5} more...
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Tasks without Owner */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`p-2 rounded-lg ${
                          healthData?.missingData.tasksWithoutOwner === 0
                            ? 'bg-green-500/20'
                            : 'bg-yellow-500/20'
                        }`}>
                          <CheckSquare className={`w-5 h-5 ${
                            healthData?.missingData.tasksWithoutOwner === 0
                              ? 'text-green-400'
                              : 'text-yellow-400'
                          }`} />
                        </div>
                        <div>
                          <h3 className="font-medium text-white">Tasks without Owner Team</h3>
                          <p className="text-sm text-zinc-400">
                            {healthData?.missingData.tasksWithoutOwner || 0} task(s) missing owner team assignment
                          </p>
                        </div>
                      </div>
                      {healthData?.missingData.tasksWithoutOwnerList &&
                       healthData.missingData.tasksWithoutOwnerList.length > 0 && (
                        <div className="space-y-2">
                          {healthData.missingData.tasksWithoutOwnerList.map(t => (
                            <div key={t.id} className="flex items-center gap-2 p-2 bg-zinc-800/50 rounded-lg text-sm">
                              <span className="text-zinc-400 font-mono text-xs">{t.id.slice(0, 8)}...</span>
                              <span className="text-white">{t.title}</span>
                            </div>
                          ))}
                          {healthData.missingData.tasksWithoutOwner > 5 && (
                            <p className="text-xs text-zinc-500">
                              and {healthData.missingData.tasksWithoutOwner - 5} more...
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Projects without Team */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`p-2 rounded-lg ${
                          healthData?.missingData.projectsWithoutTeam === 0
                            ? 'bg-green-500/20'
                            : 'bg-yellow-500/20'
                        }`}>
                          <Users className={`w-5 h-5 ${
                            healthData?.missingData.projectsWithoutTeam === 0
                              ? 'text-green-400'
                              : 'text-yellow-400'
                          }`} />
                        </div>
                        <div>
                          <h3 className="font-medium text-white">Projects without Owner Team</h3>
                          <p className="text-sm text-zinc-400">
                            {healthData?.missingData.projectsWithoutTeam || 0} project(s) missing owner team assignment
                          </p>
                        </div>
                      </div>
                      {healthData?.missingData.projectsWithoutTeamList &&
                       healthData.missingData.projectsWithoutTeamList.length > 0 && (
                        <div className="space-y-2">
                          {healthData.missingData.projectsWithoutTeamList.map(p => (
                            <div key={p.id} className="flex items-center gap-2 p-2 bg-zinc-800/50 rounded-lg text-sm">
                              <span className="text-zinc-400 font-mono text-xs">{p.id.slice(0, 8)}...</span>
                              <span className="text-white">{p.title}</span>
                            </div>
                          ))}
                          {healthData.missingData.projectsWithoutTeam > 5 && (
                            <p className="text-xs text-zinc-500">
                              and {healthData.missingData.projectsWithoutTeam - 5} more...
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Developer Tools Section */}
                {activeSection === 'developer' && (
                  <div className="space-y-6">
                    {/* Quick Links Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* API Documentation */}
                      <a
                        href={healthData?.developerLinks?.apiDocsApp || 'https://abeto-api-dashboard.vercel.app'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-xl hover:from-blue-500/30 hover:to-blue-600/20 transition-all group"
                      >
                        <div className="p-3 bg-blue-500/20 rounded-lg">
                          <Code className="w-6 h-6 text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-white">API Documentation</p>
                          <p className="text-sm text-zinc-400">Interactive API explorer</p>
                        </div>
                        <ExternalLink className="w-5 h-5 text-zinc-500 group-hover:text-blue-400 transition-colors" />
                      </a>

                      {/* GitHub Repository */}
                      <a
                        href={healthData?.developerLinks?.githubRepo || 'https://github.com/nunomfelix/abeto-task-manager'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-4 bg-gradient-to-br from-zinc-500/20 to-zinc-600/10 border border-zinc-500/30 rounded-xl hover:from-zinc-500/30 hover:to-zinc-600/20 transition-all group"
                      >
                        <div className="p-3 bg-zinc-500/20 rounded-lg">
                          <svg className="w-6 h-6 text-zinc-300" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-white">GitHub Repository</p>
                          <p className="text-sm text-zinc-400">Source code & issues</p>
                        </div>
                        <ExternalLink className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" />
                      </a>

                      {/* Vercel Dashboard */}
                      <a
                        href={healthData?.developerLinks?.vercelDashboard || 'https://vercel.com'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-4 bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-zinc-700/50 rounded-xl hover:border-zinc-600 transition-all group"
                      >
                        <div className="p-3 bg-zinc-700/50 rounded-lg">
                          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M24 22.525H0l12-21.05 12 21.05z"/>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-white">Vercel Dashboard</p>
                          <p className="text-sm text-zinc-400">Deployments & logs</p>
                        </div>
                        <ExternalLink className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" />
                      </a>
                    </div>

                    {/* Supabase Quick Access */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-500/20 rounded-lg">
                            <Database className="w-6 h-6 text-emerald-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">Supabase Quick Access</h3>
                            <p className="text-sm text-zinc-400">Project: {healthData?.supabaseProjectRef || 'Loading...'}</p>
                          </div>
                        </div>
                        {healthData?.environment && (
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              healthData.environment.vercelEnv === 'production'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {healthData.environment.vercelEnv}
                            </span>
                            {healthData.environment.region !== 'local' && (
                              <span className="px-2 py-1 text-xs bg-zinc-700 text-zinc-300 rounded-full">
                                {healthData.environment.region}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                        {[
                          { label: 'Table Editor', url: healthData?.developerLinks?.supabaseTableEditor, icon: '📊' },
                          { label: 'SQL Editor', url: healthData?.developerLinks?.supabaseSqlEditor, icon: '💻' },
                          { label: 'API Docs', url: healthData?.developerLinks?.supabaseApiDocs, icon: '📚' },
                          { label: 'Logs', url: healthData?.developerLinks?.supabaseLogs, icon: '📋' },
                          { label: 'Auth Users', url: healthData?.developerLinks?.supabaseAuth, icon: '👥' },
                          { label: 'Storage', url: healthData?.developerLinks?.supabaseStorage, icon: '📁' },
                          { label: 'Dashboard', url: healthData?.developerLinks?.supabaseDashboard, icon: '🏠' },
                        ].filter(item => item.url).map((item) => (
                          <a
                            key={item.label}
                            href={item.url!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-3 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition-colors group"
                          >
                            <span className="text-lg">{item.icon}</span>
                            <span className="text-sm text-zinc-300 group-hover:text-white">{item.label}</span>
                            <ExternalLink className="w-3 h-3 text-zinc-500 group-hover:text-emerald-400 ml-auto" />
                          </a>
                        ))}
                      </div>

                      {/* Connection Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-zinc-800/30 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-zinc-500 uppercase tracking-wide">Supabase URL</p>
                            <button
                              onClick={() => copyToClipboard(healthData?.supabaseUrl || '', 'url')}
                              className="text-zinc-400 hover:text-white transition-colors"
                            >
                              {copied === 'url' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                          <p className="text-white font-mono text-sm truncate">{healthData?.supabaseUrl || 'Not configured'}</p>
                        </div>
                        <div className="p-4 bg-zinc-800/30 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-zinc-500 uppercase tracking-wide">Anon Key (partial)</p>
                            <button
                              onClick={() => copyToClipboard(healthData?.supabaseAnonKey || '', 'anonKey')}
                              className="text-zinc-400 hover:text-white transition-colors"
                            >
                              {copied === 'anonKey' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                          <p className="text-white font-mono text-sm truncate">{healthData?.supabaseAnonKey || 'Not available'}</p>
                        </div>
                      </div>
                    </div>

                    {/* API Endpoints Reference */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                          <Terminal className="w-5 h-5 text-violet-400" />
                          Internal API Endpoints
                        </h3>
                        <a
                          href={healthData?.developerLinks?.apiDocsApp || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                          Full API Docs <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      <div className="space-y-2">
                        {[
                          { method: 'GET', path: '/api/projects', desc: 'List all projects with review status' },
                          { method: 'POST', path: '/api/projects', desc: 'Create a new project' },
                          { method: 'PATCH', path: '/api/projects', desc: 'Update a project (requires id in body)' },
                          { method: 'DELETE', path: '/api/projects?id=<uuid>', desc: 'Delete a project' },
                          { method: 'GET', path: '/api/projects/[slug]', desc: 'Get single project with tasks' },
                          { method: 'GET', path: '/api/tasks', desc: 'List tasks (supports ?status=, ?project_id=, etc.)' },
                          { method: 'POST', path: '/api/tasks', desc: 'Create task(s) - supports bulk creation' },
                          { method: 'PATCH', path: '/api/tasks', desc: 'Update a task (requires id in body)' },
                          { method: 'DELETE', path: '/api/tasks?id=<uuid>', desc: 'Delete a task' },
                          { method: 'GET', path: '/api/teams', desc: 'List all teams' },
                          { method: 'GET', path: '/api/pillars', desc: 'List all strategic pillars' },
                          { method: 'GET', path: '/api/reviews', desc: 'List review sessions' },
                          { method: 'POST', path: '/api/reviews', desc: 'Submit review feedback' },
                          { method: 'GET', path: '/api/health', desc: 'System health & developer info' },
                          { method: 'GET', path: '/api/settings', desc: 'App settings and stats' },
                        ].map((endpoint, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors">
                            <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                              endpoint.method === 'GET' ? 'bg-green-500/20 text-green-400' :
                              endpoint.method === 'POST' ? 'bg-blue-500/20 text-blue-400' :
                              endpoint.method === 'PATCH' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {endpoint.method}
                            </span>
                            <code className="text-sm text-white font-mono flex-1">{endpoint.path}</code>
                            <span className="text-xs text-zinc-500 hidden md:block">{endpoint.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quick SQL Queries */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-cyan-400" />
                        SQL Queries for Claude / Supabase
                      </h3>
                      <p className="text-sm text-zinc-400 mb-4">
                        Copy and paste these into Supabase SQL Editor or share with Claude for data operations
                      </p>

                      <div className="space-y-4">
                        {[
                          {
                            title: 'Get all projects with review status',
                            id: 'query1',
                            sql: `SELECT p.*, prs.management_reviewed, prs.operations_sales_reviewed,
       prs.product_tech_reviewed, prs.all_reviewed
FROM projects p
LEFT JOIN project_review_status prs ON p.id = prs.project_id
ORDER BY p.created_at DESC;`
                          },
                          {
                            title: 'Task counts by status per project',
                            id: 'query2',
                            sql: `SELECT p.title as project, t.status, COUNT(*) as count
FROM tasks t
JOIN projects p ON t.project_id = p.id
GROUP BY p.title, t.status
ORDER BY p.title, t.status;`
                          },
                          {
                            title: 'Team workload summary',
                            id: 'query3',
                            sql: `SELECT t.name as team,
       COUNT(DISTINCT p.id) as projects,
       COUNT(DISTINCT tk.id) as tasks,
       SUM(CASE WHEN tk.status = 'completed' THEN 1 ELSE 0 END) as completed
FROM teams t
LEFT JOIN projects p ON p.owner_team_id = t.id
LEFT JOIN tasks tk ON tk.owner_team_id = t.id
GROUP BY t.id, t.name
ORDER BY projects DESC;`
                          },
                          {
                            title: 'Find high AI-potential tasks',
                            id: 'query4',
                            sql: `SELECT t.title, t.ai_potential, t.status, p.title as project
FROM tasks t
JOIN projects p ON t.project_id = p.id
WHERE t.ai_potential IN ('high', 'medium')
ORDER BY t.ai_potential DESC, t.created_at DESC;`
                          },
                          {
                            title: 'Recent review feedback',
                            id: 'query5',
                            sql: `SELECT rf.*, p.title as project, u.name as reviewer
FROM review_feedback rf
JOIN project_review_sessions prs ON rf.review_session_id = prs.id
JOIN projects p ON prs.project_id = p.id
JOIN users u ON prs.reviewer_id = u.id
ORDER BY rf.created_at DESC
LIMIT 50;`
                          }
                        ].map((query) => (
                          <div key={query.id} className="p-4 bg-zinc-800/50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-medium text-white">{query.title}</p>
                              <button
                                onClick={() => copyToClipboard(query.sql, query.id)}
                                className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors"
                              >
                                {copied === query.id ? (
                                  <>
                                    <Check className="w-3 h-3 text-green-400" />
                                    <span className="text-green-400">Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <pre className="text-xs text-zinc-400 font-mono overflow-x-auto whitespace-pre-wrap">{query.sql}</pre>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* About Section */}
                {activeSection === 'about' && (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <div className="text-center py-8">
                      <div className="w-24 h-20 mx-auto mb-6">
                        <Image
                          src="/abeto-logo.svg"
                          alt="Abeto"
                          width={96}
                          height={80}
                          className="w-full h-full"
                        />
                      </div>
                      <h2 className="text-2xl font-bold text-white mb-2">Abeto Task Manager</h2>
                      <p className="text-zinc-400 mb-6">AI-Powered Project & Task Management</p>

                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-full text-sm text-zinc-300 mb-8">
                        <span>Version 1.0.0</span>
                        <span className="text-zinc-600">|</span>
                        <span>Next.js 15</span>
                        <span className="text-zinc-600">|</span>
                        <span>Supabase</span>
                      </div>

                      <div className="max-w-md mx-auto space-y-4 text-left">
                        <div className="flex items-start gap-3 p-4 bg-zinc-800/50 rounded-lg">
                          <BarChart3 className="w-5 h-5 text-blue-400 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-white">Dashboard Analytics</h4>
                            <p className="text-sm text-zinc-400">Track project progress, team performance, and task metrics</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-4 bg-zinc-800/50 rounded-lg">
                          <Zap className="w-5 h-5 text-purple-400 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-white">AI-Powered Creation</h4>
                            <p className="text-sm text-zinc-400">Generate projects with tasks using AI assistance</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-4 bg-zinc-800/50 rounded-lg">
                          <Users className="w-5 h-5 text-green-400 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-white">Team Management</h4>
                            <p className="text-sm text-zinc-400">Organize teams, assign projects, and track workloads</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-4 bg-zinc-800/50 rounded-lg">
                          <Layers className="w-5 h-5 text-orange-400 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-white">Strategic Pillars</h4>
                            <p className="text-sm text-zinc-400">Organize projects by strategic business objectives</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 pt-8 border-t border-zinc-800">
                        <p className="text-sm text-zinc-500">
                          Built with Next.js, TypeScript, Tailwind CSS, and Supabase
                        </p>
                        <p className="text-sm text-zinc-600 mt-2">
                          © 2024 Abeto. All rights reserved.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    }>
      <SettingsPageContent />
    </Suspense>
  );
}
