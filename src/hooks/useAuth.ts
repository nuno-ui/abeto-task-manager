'use client';

import { useState, useEffect, useCallback } from 'react';
import { User, ReviewerArea } from '@/types/database';

interface Permissions {
  isAdmin: boolean;
  canUseAI: boolean;
  canEditProject: boolean;
  canEditTask: boolean;
  canCreateProject: boolean;
  canDeleteProject: boolean;
  canResolveComments: boolean;
  canViewProject: boolean;
  canComment: boolean;
  canSubmitFeedback: boolean;
}

interface AuthState {
  user: User | null;
  permissions: Permissions;
  preferredArea: ReviewerArea | null;
  isLoading: boolean;
  error: string | null;
}

const defaultPermissions: Permissions = {
  isAdmin: false,
  canUseAI: false,
  canEditProject: false,
  canEditTask: false,
  canCreateProject: false,
  canDeleteProject: false,
  canResolveComments: false,
  canViewProject: false,
  canComment: false,
  canSubmitFeedback: false,
};

/**
 * Hook to access current user authentication and permissions
 * Fetches from /api/auth/me on mount and provides user info + permissions
 */
export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    permissions: defaultPermissions,
    preferredArea: null,
    isLoading: true,
    error: null,
  });

  const fetchAuth = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch('/api/auth/me');
      const data = await response.json();

      if (response.ok) {
        setState({
          user: data.user,
          permissions: data.permissions || defaultPermissions,
          preferredArea: data.preferredArea,
          isLoading: false,
          error: null,
        });
      } else {
        // User not authenticated
        setState({
          user: null,
          permissions: defaultPermissions,
          preferredArea: null,
          isLoading: false,
          error: data.error || 'Not authenticated',
        });
      }
    } catch (error) {
      console.error('Error fetching auth:', error);
      setState({
        user: null,
        permissions: defaultPermissions,
        preferredArea: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch auth',
      });
    }
  }, []);

  useEffect(() => {
    fetchAuth();
  }, [fetchAuth]);

  return {
    ...state,
    refetch: fetchAuth,
    isAuthenticated: !!state.user,
  };
}

/**
 * Helper hook to check if current user is admin
 */
export function useIsAdmin() {
  const { permissions, isLoading } = useAuth();
  return { isAdmin: permissions.isAdmin, isLoading };
}

/**
 * Helper hook to check if current user can use AI features
 */
export function useCanUseAI() {
  const { permissions, isLoading } = useAuth();
  return { canUseAI: permissions.canUseAI, isLoading };
}

/**
 * Helper hook to get the user's preferred review area
 */
export function usePreferredReviewArea() {
  const { preferredArea, isLoading } = useAuth();
  return { preferredArea, isLoading };
}
