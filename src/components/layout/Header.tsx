'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Bell, Plus, FileText, CheckSquare, Loader2, X } from 'lucide-react';
import { Button, Avatar, Badge } from '@/components/ui';

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

interface HeaderProps {
  title?: string;
  onCreateNew?: () => void;
  createLabel?: string;
  extraActions?: React.ReactNode;
}

export function Header({ title, onCreateNew, createLabel = 'New', extraActions }: HeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Handle click outside to close search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
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

  const hasResults = searchResults && (searchResults.projects.length > 0 || searchResults.tasks.length > 0);

  return (
    <header className="h-16 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        {title && <h1 className="text-xl font-semibold text-white">{title}</h1>}
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search projects, tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
            className="w-72 pl-10 pr-10 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden z-50">
              {!hasResults ? (
                <div className="p-4 text-center text-sm text-zinc-500">
                  No results found for "{searchQuery}"
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
                          <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">{project.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge variant="status" value={project.status} className="text-xs">
                                {project.status}
                              </Badge>
                              <Badge variant="priority" value={project.priority} className="text-xs">
                                {project.priority}
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

        {/* Extra actions */}
        {extraActions}

        {/* Create button */}
        {onCreateNew && (
          <Button onClick={onCreateNew} size="sm">
            <Plus className="w-4 h-4" />
            {createLabel}
          </Button>
        )}

        {/* Notifications - placeholder for now */}
        <button
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors relative"
          title="Notifications coming soon"
        >
          <Bell className="w-5 h-5" />
        </button>

        {/* User avatar */}
        <Avatar name="User" size="md" />
      </div>
    </header>
  );
}
