import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, serviceRoleKey);
}

// GET: Fetch projects pending review for a reviewer
// Simplified: No longer filters by reviewer_area - projects need 3 reviews from anyone
export async function GET(request: Request) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const reviewerId = searchParams.get('reviewer_id');

    const supabase = getSupabaseAdmin();

    // Fetch all non-archived projects with their review status
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select(`
        *,
        pillar:pillars(*),
        owner_team:teams(*)
      `)
      .eq('is_archived', false)
      .order('created_at', { ascending: false });

    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
      return NextResponse.json({ error: projectsError.message }, { status: 500 });
    }

    // Fetch tasks for all projects
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .order('order_index');

    // Fetch all completed review sessions to count reviews per project
    const { data: allSessions } = await supabase
      .from('project_review_sessions')
      .select('project_id, reviewer_id, status')
      .eq('status', 'completed');

    // Count completed reviews per project
    const reviewCountMap = new Map<string, number>();
    (allSessions || []).forEach(session => {
      const count = reviewCountMap.get(session.project_id) || 0;
      reviewCountMap.set(session.project_id, count + 1);
    });

    // Fetch existing review sessions for this reviewer (if specified)
    let reviewSessions: any[] = [];
    if (reviewerId) {
      const { data: sessions } = await supabase
        .from('project_review_sessions')
        .select('*')
        .eq('reviewer_id', reviewerId);
      reviewSessions = sessions || [];
    }

    // Map review sessions to projects (for this reviewer)
    const sessionMap = new Map(
      reviewSessions.map(s => [s.project_id, s])
    );

    // Group tasks by project
    const tasksByProject = new Map<string, any[]>();
    (tasks || []).forEach(task => {
      const existing = tasksByProject.get(task.project_id) || [];
      existing.push(task);
      tasksByProject.set(task.project_id, existing);
    });

    // Enrich projects with simplified review status
    const enrichedProjects = (projects || []).map(project => {
      const session = sessionMap.get(project.id);
      const projectTasks = tasksByProject.get(project.id) || [];
      const reviewCount = reviewCountMap.get(project.id) || 0;

      return {
        ...project,
        tasks: projectTasks,
        review_status: {
          review_count: reviewCount,
          all_reviewed: reviewCount >= 3,
          alignment_score: null,
        },
        my_review_session: session || null,
        is_reviewed_by_me: session?.status === 'completed',
      };
    });

    // Separate into pending and completed for this reviewer
    const pendingReview = enrichedProjects.filter(p => !p.is_reviewed_by_me);
    const completedReview = enrichedProjects.filter(p => p.is_reviewed_by_me);

    // Calculate progress stats
    const totalProjects = enrichedProjects.length;
    const reviewedProjects = completedReview.length;
    const progress = totalProjects > 0 ? Math.round((reviewedProjects / totalProjects) * 100) : 0;

    return NextResponse.json({
      projects: enrichedProjects,
      pendingReview,
      completedReview,
      stats: {
        totalProjects,
        reviewedProjects,
        pendingProjects: pendingReview.length,
        progress,
      }
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create or start a review session
// Simplified: No longer requires reviewer_area
export async function POST(request: Request) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const supabase = getSupabaseAdmin();

    if (!body.project_id || !body.reviewer_id) {
      return NextResponse.json({
        error: 'project_id and reviewer_id are required'
      }, { status: 400 });
    }

    // Check if session already exists for this reviewer and project
    const { data: existing } = await supabase
      .from('project_review_sessions')
      .select('*')
      .eq('project_id', body.project_id)
      .eq('reviewer_id', body.reviewer_id)
      .single();

    if (existing) {
      // Update to in_progress if not already completed
      if (existing.status !== 'completed') {
        const { data: updated, error: updateError } = await supabase
          .from('project_review_sessions')
          .update({
            status: 'in_progress',
            started_at: existing.started_at || new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (updateError) {
          return NextResponse.json({ error: updateError.message }, { status: 500 });
        }
        return NextResponse.json(updated);
      }
      return NextResponse.json(existing);
    }

    // Create new session (reviewer_area is optional/null now)
    const sessionData = {
      project_id: body.project_id,
      reviewer_id: body.reviewer_id,
      reviewer_area: body.reviewer_area || null, // Optional for backward compat
      status: 'in_progress',
      started_at: new Date().toISOString(),
    };

    const { data: session, error } = await supabase
      .from('project_review_sessions')
      .insert(sessionData)
      .select()
      .single();

    if (error) {
      console.error('Error creating review session:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Complete a review session
export async function PUT(request: Request) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const supabase = getSupabaseAdmin();

    if (!body.id) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.status) {
      updateData.status = body.status;
      if (body.status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }
    }

    const { data: session, error } = await supabase
      .from('project_review_sessions')
      .update(updateData)
      .eq('id', body.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating review session:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
