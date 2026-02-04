'use client';

import { Header } from '@/components/layout/Header';
import { Activity } from 'lucide-react';

export default function ActivityPage() {
  return (
    <div className="min-h-screen">
      <Header title="Activity" />

      <div className="p-6">
        <div className="text-center py-16 bg-zinc-900 border border-zinc-800 rounded-xl">
          <Activity className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Activity Feed</h3>
          <p className="text-zinc-500 max-w-md mx-auto">
            Track all changes and updates across your projects and tasks.
            Activity logging will appear here as you work.
          </p>
        </div>
      </div>
    </div>
  );
}
