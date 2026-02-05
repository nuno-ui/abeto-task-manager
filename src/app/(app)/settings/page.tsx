'use client';

import { useState, useEffect } from 'react';
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

export default function SettingsPage() {
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [stats, setStats] = useState<Stats>({ teams: 0, users: 0, projects: 0, tasks: 0 });
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'pillars' | 'database' | 'about'>('pillars');

  // Pillar management
  const [showAddPillar, setShowAddPillar] = useState(false);
  const [editingPillar, setEditingPillar] = useState<string | null>(null);
  const [newPillar, setNewPillar] = useState({ name: '', description: '', color: '#6366f1' });
  const [editPillar, setEditPillar] = useState({ name: '', description: '', color: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
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

  const sections = [
    { id: 'pillars', label: 'Pillars', icon: Layers, description: 'Manage strategic pillars for organizing projects' },
    { id: 'database', label: 'Database', icon: Database, description: 'View database statistics and health' },
    { id: 'about', label: 'About', icon: FileText, description: 'Application information and version' },
  ] as const;

  return (
    <div className="min-h-screen">
      <Header title="Settings" />

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
                    <div>
                      <p className="text-sm font-medium">{section.label}</p>
                    </div>
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

                {/* Database Section */}
                {activeSection === 'database' && (
                  <div className="space-y-6">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h2 className="text-xl font-semibold text-white">Database Statistics</h2>
                          <p className="text-sm text-zinc-400 mt-1">
                            Overview of your database records
                          </p>
                        </div>
                        <button
                          onClick={fetchSettings}
                          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Refresh
                        </button>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-zinc-800/50 rounded-xl p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                              <Users className="w-5 h-5 text-blue-400" />
                            </div>
                            <span className="text-sm text-zinc-400">Teams</span>
                          </div>
                          <p className="text-3xl font-bold text-white">{stats.teams}</p>
                        </div>
                        <div className="bg-zinc-800/50 rounded-xl p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-500/20 rounded-lg">
                              <Users className="w-5 h-5 text-green-400" />
                            </div>
                            <span className="text-sm text-zinc-400">Users</span>
                          </div>
                          <p className="text-3xl font-bold text-white">{stats.users}</p>
                        </div>
                        <div className="bg-zinc-800/50 rounded-xl p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-500/20 rounded-lg">
                              <FolderKanban className="w-5 h-5 text-purple-400" />
                            </div>
                            <span className="text-sm text-zinc-400">Projects</span>
                          </div>
                          <p className="text-3xl font-bold text-white">{stats.projects}</p>
                        </div>
                        <div className="bg-zinc-800/50 rounded-xl p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-orange-500/20 rounded-lg">
                              <CheckSquare className="w-5 h-5 text-orange-400" />
                            </div>
                            <span className="text-sm text-zinc-400">Tasks</span>
                          </div>
                          <p className="text-3xl font-bold text-white">{stats.tasks}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Database Connection</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-white">Supabase Connection</span>
                          </div>
                          <span className="text-sm text-green-400">Connected</span>
                        </div>
                        <div className="p-4 bg-zinc-800/50 rounded-lg">
                          <p className="text-sm text-zinc-400">Database URL</p>
                          <p className="text-white font-mono text-sm mt-1 truncate">
                            {process.env.NEXT_PUBLIC_SUPABASE_URL ? '***configured***' : 'Not configured'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* About Section */}
                {activeSection === 'about' && (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <div className="text-center py-8">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Zap className="w-10 h-10 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-white mb-2">Abeto Task Manager</h2>
                      <p className="text-zinc-400 mb-6">AI-Powered Project & Task Management</p>

                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-full text-sm text-zinc-300 mb-8">
                        <span>Version 1.0.0</span>
                        <span className="text-zinc-600">|</span>
                        <span>Next.js 16</span>
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
