'use client';

import { useAuth } from '@/hooks/useAuth';
import { Lock, Mail } from 'lucide-react';

interface AdminOnlyProps {
  children: React.ReactNode;
  /** Custom fallback message when user is not admin */
  fallbackMessage?: string;
  /** Show a loading skeleton while checking permissions */
  showLoadingState?: boolean;
  /** Show nothing when not admin (instead of fallback message) */
  hideWhenNotAdmin?: boolean;
  /** Render children but in a disabled state (grayed out, not clickable) */
  disableInsteadOfHide?: boolean;
  /** Custom class for the disabled wrapper */
  disabledClassName?: string;
}

/**
 * Component that only renders children if the current user is an admin.
 * For non-admins, shows a "Contact admin" message by default.
 */
export function AdminOnly({
  children,
  fallbackMessage = 'Contact admin (nuno@goabeto.com) - This feature is restricted to administrators.',
  showLoadingState = false,
  hideWhenNotAdmin = false,
  disableInsteadOfHide = false,
  disabledClassName = '',
}: AdminOnlyProps) {
  const { permissions, isLoading } = useAuth();

  if (isLoading) {
    if (showLoadingState) {
      return (
        <div className="animate-pulse bg-zinc-800 rounded h-8 w-24" />
      );
    }
    return null;
  }

  if (permissions.isAdmin) {
    return <>{children}</>;
  }

  // Non-admin handling
  if (hideWhenNotAdmin) {
    return null;
  }

  if (disableInsteadOfHide) {
    return (
      <div
        className={`relative group ${disabledClassName}`}
        title={fallbackMessage}
      >
        <div className="opacity-50 pointer-events-none">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900/80 rounded">
          <div className="flex items-center gap-1 text-xs text-zinc-400">
            <Lock className="w-3 h-3" />
            <span>Admin only</span>
          </div>
        </div>
      </div>
    );
  }

  // Default: show contact admin message
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm">
      <Lock className="w-4 h-4 text-amber-500 flex-shrink-0" />
      <span className="text-amber-200">{fallbackMessage}</span>
    </div>
  );
}

/**
 * A simpler inline version that just shows a lock icon with tooltip
 */
export function AdminOnlyInline({
  children,
  tooltip = 'Admin only feature',
}: {
  children: React.ReactNode;
  tooltip?: string;
}) {
  const { permissions, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (permissions.isAdmin) {
    return <>{children}</>;
  }

  return (
    <div
      className="inline-flex items-center gap-1 opacity-50 cursor-not-allowed"
      title={tooltip}
    >
      {children}
      <Lock className="w-3 h-3 text-zinc-500" />
    </div>
  );
}

/**
 * A button wrapper that shows contact admin message on click for non-admins
 */
export function AdminOnlyButton({
  children,
  onClick,
  className = '',
  disabled = false,
  ...props
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { permissions, isLoading } = useAuth();

  const handleClick = () => {
    if (!permissions.isAdmin) {
      alert('Contact admin (nuno@goabeto.com) - This feature is restricted to administrators.');
      return;
    }
    onClick?.();
  };

  if (isLoading) {
    return (
      <button className={`${className} opacity-50 cursor-wait`} disabled {...props}>
        {children}
      </button>
    );
  }

  return (
    <button
      className={`${className} ${!permissions.isAdmin ? 'opacity-60' : ''}`}
      onClick={handleClick}
      disabled={disabled || !permissions.isAdmin}
      {...props}
    >
      <span className="flex items-center gap-1">
        {children}
        {!permissions.isAdmin && <Lock className="w-3 h-3" />}
      </span>
    </button>
  );
}

/**
 * Contact admin card - use when showing a dedicated message
 */
export function ContactAdminCard({
  feature = 'This feature',
  className = '',
}: {
  feature?: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center gap-3 p-6 bg-zinc-800/50 rounded-lg border border-zinc-700 ${className}`}>
      <div className="p-3 bg-amber-500/10 rounded-full">
        <Lock className="w-6 h-6 text-amber-500" />
      </div>
      <div className="text-center">
        <p className="text-zinc-300 font-medium">{feature} is restricted</p>
        <p className="text-sm text-zinc-500 mt-1">Only administrators can access this feature.</p>
      </div>
      <a
        href="mailto:nuno@goabeto.com"
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
      >
        <Mail className="w-4 h-4" />
        Contact Admin
      </a>
    </div>
  );
}
