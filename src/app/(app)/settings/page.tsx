'use client';

import { Header } from '@/components/layout/Header';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="min-h-screen">
      <Header title="Settings" />

      <div className="p-6">
        <div className="text-center py-16 bg-zinc-900 border border-zinc-800 rounded-xl">
          <Settings className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Settings</h3>
          <p className="text-zinc-500 max-w-md mx-auto">
            Configure your workspace preferences, notifications, and integrations.
            Coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}
