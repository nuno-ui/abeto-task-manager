import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, serviceRoleKey);
}

// GET: Fetch review comments
export async function GET(request: Request) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('review_session_id');
    const projectId = searchParams.get('project_id');

    const supabase = getSupabaseAdmin();

    let query = supabase.from('review_comments').select(`
      *,
      task:tasks(id, title)
    `);

    if (sessionId) {
      query = query.eq('review_session_id', sessionId);
    }

    if (projectId) {
      // Get all comments for this project across all review sessions
      const { data: sessions } = await supabase
        .from('project_review_sessions')
        .select('id, reviewer_area')
        .eq('project_id', projectId);

      if (sessions && sessions.length > 0) {
        const sessionIds = sessions.map(s => s.id);
        query = supabase
          .from('review_comments')
          .select(`
            *,
            task:tasks(id, title),
            review_session:project_review_sessions(id, reviewer_area, reviewer_id)
          `)
          .in('review_session_id', sessionIds);
      }
    }

    const { data: comments, error } = await query.order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching review comments:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Add a review comment
export async function POST(request: Request) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const supabase = getSupabaseAdmin();

    if (!body.review_session_id || !body.project_id || !body.content) {
      return NextResponse.json({
        error: 'review_session_id, project_id, and content are required'
      }, { status: 400 });
    }

    const commentData = {
      review_session_id: body.review_session_id,
      project_id: body.project_id,
      task_id: body.task_id || null,
      content: body.content,
    };

    const { data: comment, error } = await supabase
      .from('review_comments')
      .insert(commentData)
      .select(`
        *,
        task:tasks(id, title)
      `)
      .single();

    if (error) {
      console.error('Error creating review comment:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Remove a review comment
export async function DELETE(request: Request) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from('review_comments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting review comment:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
