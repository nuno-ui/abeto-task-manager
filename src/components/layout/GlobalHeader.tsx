'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Bell,
  Plus,
  FileText,
  CheckSquare,
  Loader2,
  X,
  LogOut,
  User,
  Settings,
  Bot,
  MessageSquare,
  Sparkles,
  Bug,
  Slack
} from 'lucide-react';
import { Button, Avatar, Badge } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';

interface SearchResult {
  projects: Array<{
    id: string;
    title: string;
    slug: string;
    status: string;
    priority: string;
  }>;
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    phase: string;
    project?: {
      id: string;
      title: string;
      slug: string;
    };
  }>;
}

export function GlobalHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, permissions, isLoading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const quickActionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Get page title based on pathname
  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'My Workspace';
    if (pathname === '/projects') return 'Projects';
    if (pathname.startsWith('/projects/')) return '';
    if (pathname === '/tasks') return 'Tasks';
    if (pathname === '/reviews') return 'Reviews';
    if (pathname === '/activity') return 'Activity';
    if (pathname === '/team') return 'Team';
    if (pathname === '/settings') return 'Health';
    if (pathname === '/admin/reviews') return 'Review Admin';
    return '';
  };

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (quickActionsRef.current && !quickActionsRef.current.contains(event.target as Node)) {
        setShowQuickActions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (searchQuery.trim().length < 2) {
      setSearchResults(null);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data);
          setShowResults(true);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery]);

  const handleResultClick = (path: string) => {
    setShowResults(false);
    setSearchQuery('');
    router.push(path);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoggingOut(false);
    }
  };

  const hasResults = searchResults && (searchResults.projects.length > 0 || searchResults.tasks.length > 0);

  // Get user display name and initials
  const displayName = user?.full_name || user?.email?.split('@')[0] || 'User';

  const pageTitle = getPageTitle();

  return (
    <header className="h-14 bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-800 flex items-center justify-between px-4 sticky top-0 z-40">
      {/* Left side - Page title */}
      <div className="flex items-center gap-4 min-w-0">
        {pageTitle && (
          <h1 className="text-lg font-semibold text-white truncate">{pageTitle}</h1>
        )}
      </div>

      {/* Center - Search */}
      <div className="flex-1 flex justify-center max-w-xl mx-4">
        <div className="relative w-full" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search projects, tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
            className="w-full pl-10 pr-10 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 animate-spin" />
          )}
          {searchQuery && !isSearching && (
            <button
              onClick={() => {
                setSearchQuery('');
                setShowResults(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Search Results Dropdown */}
          {showResults && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl overflow-hidden z-50">
              {!hasResults ? (
                <div className="p-4 text-center text-sm text-zinc-500">
                  No results found for &quot;{searchQuery}&quot;
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  {searchResults.projects.length > 0 && (
                    <div>
                      <div className="px-3 py-2 text-xs font-medium text-zinc-500 bg-zinc-800/50">
                        Projects
                      </div>
                      {searchResults.projects.map((project) => (
                        <button
                          key={project.id}
                          onClick={() => handleResultClick(`/projects/${project.slug}`)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-800 transition-colors text-left"
                        >
                          <FileText className="w-4 h-4 text-amber-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">{project.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge variant="status" value={project.status} className="text-xs">
                                {project.status}
                              </Badge>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {searchResults.tasks.length > 0 && (
                    <div>
                      <div className="px-3 py-2 text-xs font-medium text-zinc-500 bg-zinc-800/50">
                        Tasks
                      </div>
                      {searchResults.tasks.map((task) => (
                        <button
                          key={task.id}
                          onClick={() => task.project && handleResultClick(`/projects/${task.project.slug}`)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-800 transition-colors text-left"
                        >
                          <CheckSquare className="w-4 h-4 text-green-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">{task.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge variant="phase" value={task.phase} className="text-xs">
                                {task.phase}
                              </Badge>
                              {task.project && (
                                <span className="text-xs text-zinc-500 truncate">
                                  in {task.project.title}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right side - Quick Actions & User */}
      <div className="flex items-center gap-2">
        {/* Quick Action Buttons */}
        <div className="hidden md:flex items-center gap-1">
          {/* AI Companion */}
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-lg transition-colors"
            title="AI Companion"
          >
            <Bot className="w-4 h-4" />
            <span className="hidden lg:inline">AI</span>
          </Link>

          {/* Slack */}
          <Link
            href="/settings"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
            title="Slack Integration"
          >
            <Slack className="w-4 h-4" />
          </Link>

          {/* Bug Report */}
          <Link
            href="/settings?tab=bugs"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
            title="Report Bug"
          >
            <Bug className="w-4 h-4" />
          </Link>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-6 bg-zinc-700 mx-1" />

        {/* New Project dropdown */}
        <div className="relative" ref={quickActionsRef}>
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-medium text-sm rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New</span>
          </button>

          {showQuickActions && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl overflow-hidden z-50">
              <Link
                href="/projects?create=true"
                onClick={() => setShowQuickActions(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                New Project
              </Link>
              <Link
                href="/projects?ai=true"
                onClick={() => setShowQuickActions(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors border-t border-zinc-800"
              >
                <Sparkles className="w-4 h-4 text-violet-400" />
                Create with AI
              </Link>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors relative"
          >
            <Bell className="w-5 h-5" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-zinc-800">
                <h3 className="text-sm font-medium text-white">Notifications</h3>
              </div>
              <div className="p-8 text-center">
                <Bell className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                <p className="text-sm text-zinc-400">No notifications yet</p>
                <p className="text-xs text-zinc-500 mt-1">
                  We&apos;ll notify you when something important happens
                </p>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            {authLoading ? (
              <div className="w-8 h-8 bg-zinc-700 rounded-full animate-pulse" />
            ) : (
              <Avatar
                name={displayName}
                src={user?.avatar_url || undefined}
                size="md"
              />
            )}
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <Avatar
                    name={displayName}
                    src={user?.avatar_url || undefined}
                    size="lg"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{displayName}</p>
                    <p className="text-xs text-zinc-400 truncate">{user?.email}</p>
                    {permissions.isAdmin && (
                      <span className="inline-flex items-center px-1.5 py-0.5 mt-1 text-xs font-medium bg-amber-500/20 text-amber-400 rounded">
                        Admin
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="py-1">
                <Link
                  href="/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                <Link
                  href="/team"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>
              </div>

              <div className="border-t border-zinc-800 py-1">
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-zinc-800 transition-colors disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4" />
                  {loggingOut ? 'Signing out...' : 'Sign out'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
