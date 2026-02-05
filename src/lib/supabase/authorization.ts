import { User, ReviewerArea } from '@/types/database';

/**
 * Admin email - the only user who can use AI features and edit projects/tasks
 */
const ADMIN_EMAIL = 'nuno@goabeto.com';

/**
 * Mapping of user emails to their designated review areas
 * Users will be auto-directed to their area when they start reviewing
 */
const USER_AREA_MAP: Record<string, ReviewerArea> = {
  'christian@goabeto.com': 'management',
  'justin@goabeto.com': 'product_tech',
  // Admin can review from any perspective, defaults to operations_sales
  'nuno@goabeto.com': 'operations_sales',
};

/**
 * Check if the user is an admin (can use AI, edit projects, resolve comments)
 */
export function isAdmin(user: User | null): boolean {
  if (!user) return false;
  return user.email === ADMIN_EMAIL;
}

/**
 * Check if the user can use AI features (create projects with AI, apply suggestions, etc.)
 * Only admin can use AI features
 */
export function canUseAI(user: User | null): boolean {
  return isAdmin(user);
}

/**
 * Check if the user can edit project details
 * Only admin can edit projects
 */
export function canEditProject(user: User | null): boolean {
  return isAdmin(user);
}

/**
 * Check if the user can edit task details
 * Only admin can edit tasks
 */
export function canEditTask(user: User | null): boolean {
  return isAdmin(user);
}

/**
 * Check if the user can create new projects (without AI)
 * Only admin can create projects
 */
export function canCreateProject(user: User | null): boolean {
  return isAdmin(user);
}

/**
 * Check if the user can delete projects
 * Only admin can delete projects
 */
export function canDeleteProject(user: User | null): boolean {
  return isAdmin(user);
}

/**
 * Check if the user can respond to and resolve review comments
 * Only admin can resolve comments
 */
export function canResolveComments(user: User | null): boolean {
  return isAdmin(user);
}

/**
 * Check if the user can view projects
 * All authenticated users can view
 */
export function canViewProject(user: User | null): boolean {
  return user !== null && user.is_active !== false;
}

/**
 * Check if the user can add comments during reviews
 * All authenticated users can comment
 */
export function canComment(user: User | null): boolean {
  return user !== null && user.is_active !== false;
}

/**
 * Check if the user can submit review feedback (propose changes)
 * All authenticated users can submit feedback
 */
export function canSubmitFeedback(user: User | null): boolean {
  return user !== null && user.is_active !== false;
}

/**
 * Get the user's designated review area based on their email
 * Returns null if no specific area is mapped (they can choose freely)
 */
export function getUserReviewArea(email: string | undefined): ReviewerArea | null {
  if (!email) return null;
  return USER_AREA_MAP[email.toLowerCase()] || null;
}

/**
 * Check if the user has a fixed review area assignment
 */
export function hasFixedReviewArea(email: string | undefined): boolean {
  return getUserReviewArea(email) !== null;
}

/**
 * Get all permissions for a user in a single object (useful for frontend)
 */
export function getUserPermissions(user: User | null) {
  return {
    isAdmin: isAdmin(user),
    canUseAI: canUseAI(user),
    canEditProject: canEditProject(user),
    canEditTask: canEditTask(user),
    canCreateProject: canCreateProject(user),
    canDeleteProject: canDeleteProject(user),
    canResolveComments: canResolveComments(user),
    canViewProject: canViewProject(user),
    canComment: canComment(user),
    canSubmitFeedback: canSubmitFeedback(user),
  };
}

/**
 * Get a user-friendly message for when an action is not allowed
 */
export function getUnauthorizedMessage(action: string): string {
  return `Contact admin (nuno@goabeto.com) - ${action} is restricted to administrators.`;
}
