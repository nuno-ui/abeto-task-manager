import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, serviceRoleKey);
}

// GET: Get review progress stats
export async function GET(request: Request) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const reviewerId = searchParams.get('reviewer_id');
    const reviewerArea = searchParams.get('reviewer_area');

    const supabase = getSupabaseAdmin();

    // Get total non-archived projects
    const { count: totalProjects } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('is_archived', false);

    // Get overall review status
    const { data: reviewStatuses } = await supabase
      .from('project_review_status')
      .select('*');

    // Get reviewer-specific stats if reviewer info provided
    let reviewerStats = {
      completedReviews: 0,
      inProgressReviews: 0,
      feedbackCount: 0,
      commentCount: 0,
    };

    if (reviewerId && reviewerArea) {
      // Get completed sessions for this reviewer
      const { data: sessions } = await supabase
        .from('project_review_sessions')
        .select('id, status')
        .eq('reviewer_id', reviewerId)
        .eq('reviewer_area', reviewerArea);

      if (sessions) {
        reviewerStats.completedReviews = sessions.filter(s => s.status === 'completed').length;
        reviewerStats.inProgressReviews = sessions.filter(s => s.status === 'in_progress').length;

        // Get feedback count
        const sessionIds = sessions.map(s => s.id);
        if (sessionIds.length > 0) {
          const { count: feedbackCount } = await supabase
            .from('review_feedback')
            .select('*', { count: 'exact', head: true })
            .in('review_session_id', sessionIds);

          const { count: commentCount } = await supabase
            .from('review_comments')
            .select('*', { count: 'exact', head: true })
            .in('review_session_id', sessionIds);

          reviewerStats.feedbackCount = feedbackCount || 0;
          reviewerStats.commentCount = commentCount || 0;
        }
      }
    }

    // Calculate overall alignment stats
    const fullyReviewed = (reviewStatuses || []).filter(rs => rs.all_reviewed).length;
    const partiallyReviewed = (reviewStatuses || []).filter(rs =>
      !rs.all_reviewed && (rs.management_reviewed || rs.operations_sales_reviewed || rs.product_tech_reviewed)
    ).length;

    // Count reviews by area
    const managementReviewed = (reviewStatuses || []).filter(rs => rs.management_reviewed).length;
    const operationsReviewed = (reviewStatuses || []).filter(rs => rs.operations_sales_reviewed).length;
    const productTechReviewed = (reviewStatuses || []).filter(rs => rs.product_tech_reviewed).length;

    return NextResponse.json({
      totalProjects: totalProjects || 0,
      fullyReviewed,
      partiallyReviewed,
      notReviewed: (totalProjects || 0) - fullyReviewed - partiallyReviewed,
      byArea: {
        management: managementReviewed,
        operations_sales: operationsReviewed,
        product_tech: productTechReviewed,
      },
      reviewer: reviewerStats,
      progress: totalProjects ? Math.round((reviewerStats.completedReviews / totalProjects) * 100) : 0,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
