import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getCurrentUser } from '@/lib/supabase/auth';
import { isAdmin, getUnauthorizedMessage } from '@/lib/supabase/authorization';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, serviceRoleKey);
}

/**
 * GET /api/admin/reviews
 * Returns comprehensive review statistics and feedback for admin dashboard
 * Only accessible by admin users
 */
export async function GET() {
  try {
    // Check if user is admin
    const user = await getCurrentUser();
    if (!isAdmin(user)) {
      return NextResponse.json(
        { error: getUnauthorizedMessage('Admin review dashboard') },
        { status: 403 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Get all users who have reviewed
    const { data: reviewers } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('is_active', true);

    // Get all review sessions with user info
    const { data: sessions } = await supabase
      .from('project_review_sessions')
      .select(`
        id,
        project_id,
        reviewer_id,
        reviewer_area,
        status,
        completed_at,
        created_at,
        reviewer:users(id, email, full_name)
      `)
      .order('created_at', { ascending: false });

    // Get all review comments with status
    const { data: comments } = await supabase
      .from('review_comments')
      .select(`
        id,
        review_session_id,
        project_id,
        task_id,
        content,
        status,
        admin_response,
        admin_responded_at,
        created_at,
        session:project_review_sessions(
          reviewer_id,
          reviewer_area,
          reviewer:users(id, email, full_name)
        ),
        project:projects(id, title, slug)
      `)
      .order('created_at', { ascending: false });

    // Get all review feedback
    const { data: feedback } = await supabase
      .from('review_feedback')
      .select(`
        id,
        review_session_id,
        field_name,
        current_value,
        proposed_value,
        comment,
        created_at,
        session:project_review_sessions(
          project_id,
          reviewer_id,
          reviewer_area,
          reviewer:users(id, email, full_name),
          project:projects(id, title, slug)
        )
      `)
      .order('created_at', { ascending: false });

    // Get total projects count
    const { count: totalProjects } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('is_archived', false);

    // Get project review status
    const { data: projectStatuses } = await supabase
      .from('project_review_status')
      .select('*');

    // Calculate reviewer stats
    const reviewerStats: Record<string, {
      email: string;
      name: string | null;
      reviewed: number;
      pending: number;
      totalFeedback: number;
      totalComments: number;
      areas: string[];
    }> = {};

    reviewers?.forEach(reviewer => {
      const userSessions = sessions?.filter(s => s.reviewer_id === reviewer.id) || [];
      const completedSessions = userSessions.filter(s => s.status === 'completed');
      const userComments = comments?.filter(c =>
        (c.session as any)?.reviewer_id === reviewer.id
      ) || [];
      const userFeedback = feedback?.filter(f =>
        (f.session as any)?.reviewer_id === reviewer.id
      ) || [];
      const areas = [...new Set(userSessions.map(s => s.reviewer_area))];

      reviewerStats[reviewer.id] = {
        email: reviewer.email,
        name: reviewer.full_name,
        reviewed: completedSessions.length,
        pending: (totalProjects || 0) - completedSessions.length,
        totalFeedback: userFeedback.length,
        totalComments: userComments.length,
        areas,
      };
    });

    // Calculate area stats
    const areaStats = {
      management: {
        reviewed: projectStatuses?.filter(p => p.management_reviewed).length || 0,
        pending: (totalProjects || 0) - (projectStatuses?.filter(p => p.management_reviewed).length || 0),
      },
      operations_sales: {
        reviewed: projectStatuses?.filter(p => p.operations_sales_reviewed).length || 0,
        pending: (totalProjects || 0) - (projectStatuses?.filter(p => p.operations_sales_reviewed).length || 0),
      },
      product_tech: {
        reviewed: projectStatuses?.filter(p => p.product_tech_reviewed).length || 0,
        pending: (totalProjects || 0) - (projectStatuses?.filter(p => p.product_tech_reviewed).length || 0),
      },
    };

    // Pending comments (not yet resolved)
    const pendingComments = comments?.filter(c => c.status === 'pending') || [];
    const answeredComments = comments?.filter(c => c.status === 'answered') || [];
    const resolvedComments = comments?.filter(c => c.status === 'resolved') || [];

    // Feedback grouped by field
    const feedbackByField: Record<string, number> = {};
    feedback?.forEach(f => {
      feedbackByField[f.field_name] = (feedbackByField[f.field_name] || 0) + 1;
    });

    // Projects needing review (not all 3 areas complete)
    const projectsNeedingReview = projectStatuses?.filter(p => !p.all_reviewed).length || 0;
    const fullyReviewedProjects = projectStatuses?.filter(p => p.all_reviewed).length || 0;

    return NextResponse.json({
      summary: {
        totalProjects: totalProjects || 0,
        fullyReviewed: fullyReviewedProjects,
        needingReview: projectsNeedingReview,
        totalComments: comments?.length || 0,
        pendingComments: pendingComments.length,
        totalFeedback: feedback?.length || 0,
      },
      reviewerStats,
      areaStats,
      commentStats: {
        pending: pendingComments.length,
        answered: answeredComments.length,
        resolved: resolvedComments.length,
      },
      feedbackByField,
      recentComments: pendingComments.slice(0, 20),
      recentFeedback: feedback?.slice(0, 20) || [],
    });
  } catch (error) {
    console.error('Error in admin reviews API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch admin data' },
      { status: 500 }
    );
  }
}
