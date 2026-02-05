import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase/auth';
import { getUserPermissions, getUserReviewArea } from '@/lib/supabase/authorization';

/**
 * GET /api/auth/me
 * Returns the current authenticated user with their permissions
 */
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          user: null,
          permissions: {
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
          },
          preferredArea: null,
        },
        { status: 401 }
      );
    }

    const permissions = getUserPermissions(user);
    const preferredArea = getUserReviewArea(user.email);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        role: user.role,
        team_id: user.team_id,
        is_active: user.is_active,
      },
      permissions,
      preferredArea,
    });
  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
