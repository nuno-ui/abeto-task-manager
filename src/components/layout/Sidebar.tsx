'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Activity,
  ClipboardCheck,
  Shield,
  Heart,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Tasks', href: '/tasks', icon: ListTodo },
  { name: 'Reviews', href: '/reviews', icon: ClipboardCheck },
  { name: 'Activity', href: '/activity', icon: Activity },
  { name: 'Team', href: '/team', icon: Users },
  { name: 'Health', href: '/settings', icon: Heart },
];

const adminNavigation = [
  { name: 'Review Admin', href: '/admin/reviews', icon: Shield },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { permissions } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

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

  return (
    <aside
      className={cn(
        'h-screen bg-zinc-950 border-r border-zinc-800 flex flex-col transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-800">
        {!collapsed ? (
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image
              src="/abeto-logo.svg"
              alt="Abeto"
              width={32}
              height={28}
              className="w-8 h-7"
            />
            <span className="font-semibold text-white">Abeto Tasks</span>
          </Link>
        ) : (
          <Link href="/dashboard" className="mx-auto">
            <Image
              src="/abeto-logo.svg"
              alt="Abeto"
              width={28}
              height={24}
              className="w-7 h-6"
            />
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors",
            collapsed && "absolute right-2"
          )}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                isActive
                  ? 'bg-blue-600/20 text-blue-400'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              )}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}

        {/* Admin section - only visible to admins */}
        {permissions.isAdmin && (
          <>
            {!collapsed && (
              <div className="pt-4 pb-2">
                <span className="px-3 text-xs font-semibold text-zinc-500 uppercase">Admin</span>
              </div>
            )}
            {adminNavigation.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                    isActive
                      ? 'bg-amber-600/20 text-amber-400'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  )}
                  title={collapsed ? item.name : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-zinc-800">
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors',
            collapsed && 'justify-center',
            loggingOut && 'opacity-50 cursor-not-allowed'
          )}
          title={collapsed ? 'Log out' : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>{loggingOut ? 'Logging out...' : 'Log out'}</span>}
        </button>
      </div>
    </aside>
  );
}
