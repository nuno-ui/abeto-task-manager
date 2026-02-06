'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { GlobalHeader } from '@/components/layout/GlobalHeader';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-zinc-950">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <GlobalHeader />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
