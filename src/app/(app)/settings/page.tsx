'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Header } from '@/components/layout/Header';
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
  timestamp: string;
}

export default function SettingsPage() {
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [stats, setStats] = useState<Stats>({ teams: 0, users: 0, projects: 0, tasks: 0 });
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'health' | 'pillars' | 'data-quality' | 'developer' | 'about'>('health');

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

  const sections = [
    { id: 'health', label: 'System Health', icon: Heart, description: 'API and database status' },
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
      <Header title="Health & Status" />

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
                    {/* Supabase Dashboard Link */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Database className="w-5 h-5 text-emerald-400" />
                        Supabase Access
                      </h3>
                      <div className="space-y-4">
                        {getSupabaseDashboardUrl() && (
                          <a
                            href={getSupabaseDashboardUrl()!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/20 transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-emerald-500/20 rounded-lg">
                                <ExternalLink className="w-5 h-5 text-emerald-400" />
                              </div>
                              <div>
                                <p className="font-medium text-white">Open Supabase Dashboard</p>
                                <p className="text-sm text-zinc-400">Manage tables, run SQL, view logs</p>
                              </div>
                            </div>
                            <ExternalLink className="w-5 h-5 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
                          </a>
                        )}

                        <div className="p-4 bg-zinc-800/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-zinc-400">Supabase URL</p>
                            <button
                              onClick={() => copyToClipboard(healthData?.supabaseUrl || '', 'url')}
                              className="text-zinc-400 hover:text-white transition-colors"
                            >
                              {copied === 'url' ? (
                                <Check className="w-4 h-4 text-green-400" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          <p className="text-white font-mono text-sm truncate">
                            {healthData?.supabaseUrl || 'Not configured'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Quick Queries for Claude */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                        <Terminal className="w-5 h-5 text-violet-400" />
                        Quick SQL Queries
                      </h3>
                      <p className="text-sm text-zinc-400 mb-4">
                        Copy these queries to use in Supabase SQL Editor or with Claude
                      </p>

                      <div className="space-y-4">
                        <div className="p-4 bg-zinc-800/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-white">Get all projects with review status</p>
                            <button
                              onClick={() => copyToClipboard(
                                `SELECT p.*, prs.management_reviewed, prs.operations_sales_reviewed, prs.product_tech_reviewed, prs.all_reviewed
FROM projects p
LEFT JOIN project_review_status prs ON p.id = prs.project_id
ORDER BY p.created_at DESC;`,
                                'query1'
                              )}
                              className="text-zinc-400 hover:text-white transition-colors"
                            >
                              {copied === 'query1' ? (
                                <Check className="w-4 h-4 text-green-400" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          <pre className="text-xs text-zinc-400 font-mono overflow-x-auto">
{`SELECT p.*, prs.management_reviewed, prs.operations_sales_reviewed,
       prs.product_tech_reviewed, prs.all_reviewed
FROM projects p
LEFT JOIN project_review_status prs ON p.id = prs.project_id
ORDER BY p.created_at DESC;`}
                          </pre>
                        </div>

                        <div className="p-4 bg-zinc-800/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-white">Get task counts by status per project</p>
                            <button
                              onClick={() => copyToClipboard(
                                `SELECT p.title as project, t.status, COUNT(*) as count
FROM tasks t
JOIN projects p ON t.project_id = p.id
GROUP BY p.title, t.status
ORDER BY p.title, t.status;`,
                                'query2'
                              )}
                              className="text-zinc-400 hover:text-white transition-colors"
                            >
                              {copied === 'query2' ? (
                                <Check className="w-4 h-4 text-green-400" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          <pre className="text-xs text-zinc-400 font-mono overflow-x-auto">
{`SELECT p.title as project, t.status, COUNT(*) as count
FROM tasks t
JOIN projects p ON t.project_id = p.id
GROUP BY p.title, t.status
ORDER BY p.title, t.status;`}
                          </pre>
                        </div>

                        <div className="p-4 bg-zinc-800/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-white">Find tasks with high AI potential</p>
                            <button
                              onClick={() => copyToClipboard(
                                `SELECT t.title, t.ai_potential, p.title as project
FROM tasks t
JOIN projects p ON t.project_id = p.id
WHERE t.ai_potential IN ('high', 'full')
ORDER BY t.ai_potential DESC, t.created_at DESC;`,
                                'query3'
                              )}
                              className="text-zinc-400 hover:text-white transition-colors"
                            >
                              {copied === 'query3' ? (
                                <Check className="w-4 h-4 text-green-400" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          <pre className="text-xs text-zinc-400 font-mono overflow-x-auto">
{`SELECT t.title, t.ai_potential, p.title as project
FROM tasks t
JOIN projects p ON t.project_id = p.id
WHERE t.ai_potential IN ('high', 'full')
ORDER BY t.ai_potential DESC, t.created_at DESC;`}
                          </pre>
                        </div>

                        <div className="p-4 bg-zinc-800/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-white">Get recent comments with context</p>
                            <button
                              onClick={() => copyToClipboard(
                                `SELECT c.content, c.created_at, u.name as author,
       p.title as project, t.title as task
FROM comments c
JOIN users u ON c.user_id = u.id
LEFT JOIN projects p ON c.project_id = p.id
LEFT JOIN tasks t ON c.task_id = t.id
ORDER BY c.created_at DESC
LIMIT 20;`,
                                'query4'
                              )}
                              className="text-zinc-400 hover:text-white transition-colors"
                            >
                              {copied === 'query4' ? (
                                <Check className="w-4 h-4 text-green-400" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          <pre className="text-xs text-zinc-400 font-mono overflow-x-auto">
{`SELECT c.content, c.created_at, u.name as author,
       p.title as project, t.title as task
FROM comments c
JOIN users u ON c.user_id = u.id
LEFT JOIN projects p ON c.project_id = p.id
LEFT JOIN tasks t ON c.task_id = t.id
ORDER BY c.created_at DESC
LIMIT 20;`}
                          </pre>
                        </div>
                      </div>
                    </div>

                    {/* API Endpoints Reference */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                        <Code className="w-5 h-5 text-blue-400" />
                        API Endpoints Reference
                      </h3>
                      <p className="text-sm text-zinc-400 mb-4">
                        Available internal API endpoints for development
                      </p>

                      <div className="space-y-2">
                        {[
                          { method: 'GET', path: '/api/projects', desc: 'List all projects with review status' },
                          { method: 'GET', path: '/api/tasks', desc: 'List tasks (supports filtering)' },
                          { method: 'GET', path: '/api/teams', desc: 'List all teams' },
                          { method: 'GET', path: '/api/pillars', desc: 'List all pillars' },
                          { method: 'GET', path: '/api/comments', desc: 'List comments' },
                          { method: 'GET', path: '/api/health', desc: 'System health check' },
                          { method: 'GET', path: '/api/settings', desc: 'App settings and stats' },
                        ].map((endpoint) => (
                          <div key={endpoint.path} className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg">
                            <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                              endpoint.method === 'GET' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                            }`}>
                              {endpoint.method}
                            </span>
                            <code className="text-sm text-white font-mono">{endpoint.path}</code>
                            <span className="text-sm text-zinc-500 ml-auto">{endpoint.desc}</span>
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
