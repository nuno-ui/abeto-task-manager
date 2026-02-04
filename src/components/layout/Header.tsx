'use client';

import { useState } from 'react';
import { Search, Bell, Plus } from 'lucide-react';
import { Button, Avatar } from '@/components/ui';

interface HeaderProps {
  title?: string;
  onCreateNew?: () => void;
  createLabel?: string;
  extraActions?: React.ReactNode;
}

export function Header({ title, onCreateNew, createLabel = 'New', extraActions }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="h-16 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        {title && <h1 className="text-xl font-semibold text-white">{title}</h1>}
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
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

        {/* Notifications */}
        <button className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
        </button>

        {/* User avatar */}
        <Avatar name="User" size="md" />
      </div>
    </header>
  );
}
