import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, serviceRoleKey);
}

// GET: Fetch feedback for a review session
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

    let query = supabase.from('review_feedback').select('*');

    if (sessionId) {
      query = query.eq('review_session_id', sessionId);
    }

    // If project_id provided, get all feedback for that project across all sessions
    if (projectId) {
      const { data: sessions } = await supabase
        .from('project_review_sessions')
        .select('id')
        .eq('project_id', projectId);

      if (sessions && sessions.length > 0) {
        const sessionIds = sessions.map(s => s.id);
        query = supabase
          .from('review_feedback')
          .select('*, review_session:project_review_sessions(*)')
          .in('review_session_id', sessionIds);
      }
    }

    const { data: feedback, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching feedback:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(feedback);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Submit feedback (proposed change)
export async function POST(request: Request) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const supabase = getSupabaseAdmin();

    if (!body.review_session_id || !body.field_name) {
      return NextResponse.json({
        error: 'review_session_id and field_name are required'
      }, { status: 400 });
    }

    // Check if feedback already exists for this field in this session
    const { data: existing } = await supabase
      .from('review_feedback')
      .select('id')
      .eq('review_session_id', body.review_session_id)
      .eq('field_name', body.field_name)
      .single();

    if (existing) {
      // Update existing feedback
      const { data: updated, error } = await supabase
        .from('review_feedback')
        .update({
          current_value: body.current_value || null,
          proposed_value: body.proposed_value || null,
          comment: body.comment || null,
          is_area_specific: body.is_area_specific || false,
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json(updated);
    }

    // Create new feedback
    const feedbackData = {
      review_session_id: body.review_session_id,
      field_name: body.field_name,
      current_value: body.current_value || null,
      proposed_value: body.proposed_value || null,
      comment: body.comment || null,
      is_area_specific: body.is_area_specific || false,
    };

    const { data: feedback, error } = await supabase
      .from('review_feedback')
      .insert(feedbackData)
      .select()
      .single();

    if (error) {
      console.error('Error creating feedback:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Remove feedback
export async function DELETE(request: Request) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Feedback ID is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from('review_feedback')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting feedback:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
