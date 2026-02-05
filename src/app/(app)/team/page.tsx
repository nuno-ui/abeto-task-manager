'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import Link from 'next/link';
import {
  Users,
  FolderKanban,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  AlertCircle,
  Clock,
  UserPlus,
  X,
  Calendar,
  Target,
  Activity,
} from 'lucide-react';

interface TeamProject {
  id: string;
  title: string;
  slug: string;
  status: string;
  priority: string;
  target_date: string | null;
  progress_percentage: number;
}

interface TeamTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string | null;
  project_id: string;
}

interface TeamMember {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
}

interface TeamStats {
  projectCount: number;
  activeProjects: number;
  taskCount: number;
  completedTasks: number;
  inProgressTasks: number;
  blockedTasks: number;
  overdueTasks: number;
  memberCount: number;
}

interface Team {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  projects: TeamProject[];
  tasks: TeamTask[];
  members: TeamMember[];
  stats: TeamStats;
}

interface AllUser {
  id: string;
  email: string;
  full_name: string | null;
  team_id: string | null;
}

const statusColors: Record<string, string> = {
  idea: 'bg-gray-500',
  planning: 'bg-blue-500',
  in_progress: 'bg-yellow-500',
  on_hold: 'bg-orange-500',
  completed: 'bg-green-500',
  cancelled: 'bg-red-500',
  not_started: 'bg-gray-500',
  blocked: 'bg-red-500',
  in_review: 'bg-purple-500',
};

const priorityColors: Record<string, string> = {
  critical: 'text-red-400',
  high: 'text-orange-400',
  medium: 'text-yellow-400',
  low: 'text-green-400',
};

export default function TeamPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<Record<string, 'overview' | 'projects' | 'tasks' | 'members'>>({});
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<AllUser[]>([]);
  const [newTeam, setNewTeam] = useState({ name: '', description: '', color: '#6366f1' });
  const [newMember, setNewMember] = useState({ email: '', full_name: '', role: 'member' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/teams');
      if (response.ok) {
        const data = await response.json();
        setTeams(data);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await fetch('/api/teams/members');
      if (response.ok) {
        const data = await response.json();
        setAllUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const toggleTeam = (teamId: string) => {
    const newExpanded = new Set(expandedTeams);
    if (newExpanded.has(teamId)) {
      newExpanded.delete(teamId);
    } else {
      newExpanded.add(teamId);
      if (!activeTab[teamId]) {
        setActiveTab(prev => ({ ...prev, [teamId]: 'overview' }));
      }
    }
    setExpandedTeams(newExpanded);
  };

  const handleCreateTeam = async () => {
    if (!newTeam.name.trim()) return;
    setSaving(true);
    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTeam),
      });
      if (response.ok) {
        await fetchTeams();
        setShowAddTeamModal(false);
        setNewTeam({ name: '', description: '', color: '#6366f1' });
      }
    } catch (error) {
      console.error('Error creating team:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!window.confirm('Are you sure you want to delete this team? Members will be unassigned.')) return;
    try {
      const response = await fetch(`/api/teams?id=${teamId}`, { method: 'DELETE' });
      if (response.ok) {
        await fetchTeams();
      }
    } catch (error) {
      console.error('Error deleting team:', error);
    }
  };

  const handleAddMember = async (teamId: string) => {
    if (!newMember.email.trim() || !newMember.full_name.trim()) return;
    setSaving(true);
    try {
      const response = await fetch('/api/teams/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newMember, team_id: teamId }),
      });
      if (response.ok) {
        await fetchTeams();
        setShowAddMemberModal(null);
        setNewMember({ email: '', full_name: '', role: 'member' });
      }
    } catch (error) {
      console.error('Error adding member:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAssignUserToTeam = async (userId: string, teamId: string) => {
    try {
      const response = await fetch('/api/teams/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, team_id: teamId }),
      });
      if (response.ok) {
        await fetchTeams();
        await fetchAllUsers();
      }
    } catch (error) {
      console.error('Error assigning user:', error);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!window.confirm('Remove this member from the team?')) return;
    try {
      const response = await fetch(`/api/teams/members?user_id=${userId}`, { method: 'DELETE' });
      if (response.ok) {
        await fetchTeams();
      }
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'No date';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = (date: string | null) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  const renderTimeline = (team: Team) => {
    const itemsWithDates = [
      ...team.projects.filter(p => p.target_date).map(p => ({
        type: 'project' as const,
        id: p.id,
        title: p.title,
        slug: p.slug,
        date: p.target_date!,
        status: p.status,
        priority: p.priority,
      })),
      ...team.tasks.filter(t => t.due_date).map(t => ({
        type: 'task' as const,
        id: t.id,
        title: t.title,
        slug: '',
        date: t.due_date!,
        status: t.status,
        priority: t.priority,
      })),
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (itemsWithDates.length === 0) {
      return <p className="text-zinc-500 text-sm">No items with deadlines</p>;
    }

    return (
      <div className="space-y-2">
        {itemsWithDates.slice(0, 8).map(item => (
          <div
            key={`${item.type}-${item.id}`}
            className={`flex items-center gap-3 p-2 rounded-lg ${
              isOverdue(item.date) && item.status !== 'completed' ? 'bg-red-500/10' : 'bg-zinc-800/50'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${statusColors[item.status]}`} />
            <div className="flex-1 min-w-0">
              {item.type === 'project' ? (
                <Link
                  href={`/projects/${item.slug}`}
                  className="text-sm text-white hover:text-blue-400 truncate block"
                >
                  {item.title}
                </Link>
              ) : (
                <span className="text-sm text-white truncate block">{item.title}</span>
              )}
            </div>
            <div className={`text-xs ${isOverdue(item.date) && item.status !== 'completed' ? 'text-red-400' : 'text-zinc-400'}`}>
              {formatDate(item.date)}
            </div>
            <span className={`text-xs ${priorityColors[item.priority] || 'text-zinc-400'}`}>
              {item.priority}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <Header title="Teams" />

      <div className="p-6">
        {/* Header with Add Team button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Team Management</h2>
            <p className="text-sm text-zinc-400">View projects, tasks, and manage team members</p>
          </div>
          <button
            onClick={() => setShowAddTeamModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Team
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-zinc-900 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : teams.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900 rounded-xl border border-zinc-800">
            <Users className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400">No teams yet</p>
            <button
              onClick={() => setShowAddTeamModal(true)}
              className="mt-4 text-blue-400 hover:text-blue-300"
            >
              Create your first team
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {teams.map(team => (
              <div
                key={team.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden"
              >
                {/* Team Header */}
                <div
                  className="p-4 cursor-pointer hover:bg-zinc-800/50 transition-colors"
                  onClick={() => toggleTeam(team.id)}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: team.color + '20' }}
                    >
                      <Users className="w-6 h-6" style={{ color: team.color }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white">{team.name}</h3>
                        <span className="text-xs text-zinc-500">({team.slug})</span>
                      </div>
                      {team.description && (
                        <p className="text-sm text-zinc-400 truncate">{team.description}</p>
                      )}
                    </div>

                    {/* Quick Stats */}
                    <div className="hidden md:flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <FolderKanban className="w-4 h-4 text-zinc-500" />
                        <span className="text-zinc-300">{team.stats.projectCount} projects</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 text-zinc-500" />
                        <span className="text-zinc-300">{team.stats.taskCount} tasks</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-zinc-500" />
                        <span className="text-zinc-300">{team.stats.memberCount} members</span>
                      </div>
                      {team.stats.overdueTasks > 0 && (
                        <div className="flex items-center gap-2 text-red-400">
                          <AlertCircle className="w-4 h-4" />
                          <span>{team.stats.overdueTasks} overdue</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTeam(team.id);
                        }}
                        className="p-2 text-zinc-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {expandedTeams.has(team.id) ? (
                        <ChevronDown className="w-5 h-5 text-zinc-500" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-zinc-500" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedTeams.has(team.id) && (
                  <div className="border-t border-zinc-800">
                    {/* Tabs */}
                    <div className="flex border-b border-zinc-800">
                      {(['overview', 'projects', 'tasks', 'members'] as const).map(tab => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(prev => ({ ...prev, [team.id]: tab }))}
                          className={`px-4 py-3 text-sm font-medium transition-colors ${
                            activeTab[team.id] === tab
                              ? 'text-white border-b-2 border-blue-500'
                              : 'text-zinc-400 hover:text-zinc-300'
                          }`}
                        >
                          {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                      ))}
                    </div>

                    <div className="p-4">
                      {/* Overview Tab */}
                      {activeTab[team.id] === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Stats Grid */}
                          <div>
                            <h4 className="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2">
                              <Activity className="w-4 h-4" />
                              Statistics
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-zinc-800/50 rounded-lg p-3">
                                <p className="text-2xl font-bold text-white">{team.stats.activeProjects}</p>
                                <p className="text-xs text-zinc-400">Active Projects</p>
                              </div>
                              <div className="bg-zinc-800/50 rounded-lg p-3">
                                <p className="text-2xl font-bold text-white">{team.stats.inProgressTasks}</p>
                                <p className="text-xs text-zinc-400">Tasks In Progress</p>
                              </div>
                              <div className="bg-zinc-800/50 rounded-lg p-3">
                                <p className="text-2xl font-bold text-green-400">{team.stats.completedTasks}</p>
                                <p className="text-xs text-zinc-400">Completed Tasks</p>
                              </div>
                              <div className="bg-zinc-800/50 rounded-lg p-3">
                                <p className="text-2xl font-bold text-red-400">{team.stats.blockedTasks}</p>
                                <p className="text-xs text-zinc-400">Blocked Tasks</p>
                              </div>
                            </div>
                          </div>

                          {/* Timeline */}
                          <div>
                            <h4 className="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              Upcoming Deadlines
                            </h4>
                            {renderTimeline(team)}
                          </div>
                        </div>
                      )}

                      {/* Projects Tab */}
                      {activeTab[team.id] === 'projects' && (
                        <div>
                          {team.projects.length === 0 ? (
                            <p className="text-zinc-500 text-sm">No projects assigned to this team</p>
                          ) : (
                            <div className="space-y-2">
                              {team.projects.map(project => (
                                <Link
                                  key={project.id}
                                  href={`/projects/${project.slug}`}
                                  className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors"
                                >
                                  <div className={`w-2 h-2 rounded-full ${statusColors[project.status]}`} />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{project.title}</p>
                                    <p className="text-xs text-zinc-500 capitalize">{project.status.replace('_', ' ')}</p>
                                  </div>
                                  <div className="text-right">
                                    <div className="w-24 h-2 bg-zinc-700 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-blue-500"
                                        style={{ width: `${project.progress_percentage}%` }}
                                      />
                                    </div>
                                    <p className="text-xs text-zinc-500 mt-1">{project.progress_percentage}%</p>
                                  </div>
                                  {project.target_date && (
                                    <div className={`text-xs ${isOverdue(project.target_date) && project.status !== 'completed' ? 'text-red-400' : 'text-zinc-400'}`}>
                                      <Clock className="w-3 h-3 inline mr-1" />
                                      {formatDate(project.target_date)}
                                    </div>
                                  )}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Tasks Tab */}
                      {activeTab[team.id] === 'tasks' && (
                        <div>
                          {team.tasks.length === 0 ? (
                            <p className="text-zinc-500 text-sm">No tasks assigned to this team</p>
                          ) : (
                            <div className="space-y-2">
                              {team.tasks.map(task => (
                                <div
                                  key={task.id}
                                  className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg"
                                >
                                  <div className={`w-2 h-2 rounded-full ${statusColors[task.status]}`} />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{task.title}</p>
                                    <p className="text-xs text-zinc-500 capitalize">{task.status.replace('_', ' ')}</p>
                                  </div>
                                  <span className={`text-xs ${priorityColors[task.priority]}`}>
                                    {task.priority}
                                  </span>
                                  {task.due_date && (
                                    <div className={`text-xs ${isOverdue(task.due_date) && task.status !== 'completed' ? 'text-red-400' : 'text-zinc-400'}`}>
                                      <Clock className="w-3 h-3 inline mr-1" />
                                      {formatDate(task.due_date)}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Members Tab */}
                      {activeTab[team.id] === 'members' && (
                        <div>
                          <div className="flex justify-between items-center mb-4">
                            <p className="text-sm text-zinc-400">{team.stats.memberCount} team members</p>
                            <button
                              onClick={() => {
                                setShowAddMemberModal(team.id);
                                fetchAllUsers();
                              }}
                              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
                            >
                              <UserPlus className="w-4 h-4" />
                              Add Member
                            </button>
                          </div>

                          {team.members.length === 0 ? (
                            <p className="text-zinc-500 text-sm">No members in this team</p>
                          ) : (
                            <div className="space-y-2">
                              {team.members.map(member => (
                                <div
                                  key={member.id}
                                  className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg"
                                >
                                  <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center">
                                    {member.avatar_url ? (
                                      <img src={member.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                                    ) : (
                                      <span className="text-sm text-white">
                                        {(member.full_name || member.email).charAt(0).toUpperCase()}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">
                                      {member.full_name || 'No name'}
                                    </p>
                                    <p className="text-xs text-zinc-500 truncate">{member.email}</p>
                                  </div>
                                  <span className="text-xs px-2 py-1 bg-zinc-700 text-zinc-300 rounded capitalize">
                                    {member.role}
                                  </span>
                                  <button
                                    onClick={() => handleRemoveMember(member.id)}
                                    className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Team Modal */}
      {showAddTeamModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Create New Team</h3>
              <button onClick={() => setShowAddTeamModal(false)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Team Name</label>
                <input
                  type="text"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g., Engineering"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">Description</label>
                <textarea
                  value={newTeam.description}
                  onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
                  rows={3}
                  placeholder="Team description..."
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={newTeam.color}
                    onChange={(e) => setNewTeam({ ...newTeam, color: e.target.value })}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <span className="text-sm text-zinc-400">{newTeam.color}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddTeamModal(false)}
                className="flex-1 px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTeam}
                disabled={saving || !newTeam.name.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Creating...' : 'Create Team'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Add Team Member</h3>
              <button onClick={() => setShowAddMemberModal(null)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Existing users without team */}
            {allUsers.filter(u => !u.team_id).length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-zinc-400 mb-2">Add Existing User</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {allUsers.filter(u => !u.team_id).map(user => (
                    <button
                      key={user.id}
                      onClick={() => handleAssignUserToTeam(user.id, showAddMemberModal)}
                      className="w-full flex items-center gap-3 p-2 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center">
                        <span className="text-sm text-white">
                          {(user.full_name || user.email).charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{user.full_name || 'No name'}</p>
                        <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                      </div>
                      <Plus className="w-4 h-4 text-zinc-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-zinc-800 pt-4">
              <h4 className="text-sm font-medium text-zinc-400 mb-3">Or Create New Member</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={newMember.full_name}
                    onChange={(e) => setNewMember({ ...newMember, full_name: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Role</label>
                  <select
                    value={newMember.role}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="member">Member</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddMemberModal(null)}
                  className="flex-1 px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAddMember(showAddMemberModal)}
                  disabled={saving || !newMember.email.trim() || !newMember.full_name.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
